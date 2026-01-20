import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const card = await prisma.businessCard.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    })

    if (!card) {
      return NextResponse.json({ error: 'Business card not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get total counts
    const [totalViews, totalClicks] = await Promise.all([
      prisma.cardView.count({ where: { businessCardId: id } }),
      prisma.linkClick.count({ where: { businessCardId: id } }),
    ])

    // Get all views for analysis within date range
    const allViews = await prisma.cardView.findMany({
      where: {
        businessCardId: id,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'asc' },
    })

    // Get all clicks for analysis
    const allClicks = await prisma.linkClick.findMany({
      where: {
        businessCardId: id,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'asc' },
    })

    // Views over time (daily buckets)
    const dailyViewsMap = new Map<string, number>()
    allViews.forEach((view) => {
      const date = view.timestamp.toISOString().split('T')[0]
      dailyViewsMap.set(date, (dailyViewsMap.get(date) || 0) + 1)
    })

    const viewsOverTime = Array.from(dailyViewsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Device breakdown
    const deviceMap = new Map<string, number>()
    allViews.forEach((view) => {
      const device = view.deviceType || 'Unknown'
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1)
    })
    const deviceBreakdown = Array.from(deviceMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))

    // Browser breakdown
    const browserMap = new Map<string, number>()
    allViews.forEach((view) => {
      const browser = view.browser || 'Unknown'
      browserMap.set(browser, (browserMap.get(browser) || 0) + 1)
    })
    const browserBreakdown = Array.from(browserMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // OS breakdown
    const osMap = new Map<string, number>()
    allViews.forEach((view) => {
      const os = view.os || 'Unknown'
      osMap.set(os, (osMap.get(os) || 0) + 1)
    })
    const osBreakdown = Array.from(osMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // Geographic distribution
    const geoMap = new Map<string, { count: number; countryCode: string | null }>()
    allViews.forEach((view) => {
      if (view.country) {
        const existing = geoMap.get(view.country) || { count: 0, countryCode: view.countryCode }
        existing.count++
        geoMap.set(view.country, existing)
      }
    })
    const geoDistribution = Array.from(geoMap.entries())
      .map(([country, data]) => ({
        country,
        countryCode: data.countryCode,
        value: data.count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20)

    // Link clicks breakdown by type
    const clicksByType = new Map<string, number>()
    allClicks.forEach((click) => {
      const type = click.linkType || 'Unknown'
      clicksByType.set(type, (clicksByType.get(type) || 0) + 1)
    })
    const clickTypeBreakdown = Array.from(clicksByType.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Social platform clicks breakdown
    const clicksByPlatform = new Map<string, number>()
    allClicks.forEach((click) => {
      if (click.platform) {
        clicksByPlatform.set(click.platform, (clicksByPlatform.get(click.platform) || 0) + 1)
      }
    })
    const platformClickBreakdown = Array.from(clicksByPlatform.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Get recent views
    const recentViews = await prisma.cardView.findMany({
      where: { businessCardId: id },
      orderBy: { timestamp: 'desc' },
      take: 50,
    })

    const formattedRecentViews = recentViews.map(view => ({
      id: view.id,
      business_card_id: view.businessCardId,
      timestamp: view.timestamp.toISOString(),
      device_type: view.deviceType,
      browser: view.browser,
      browser_version: view.browserVersion,
      os: view.os,
      os_version: view.osVersion,
      ip_address: view.ipAddress,
      country: view.country,
      country_code: view.countryCode,
      region: view.region,
      city: view.city,
      latitude: view.latitude ? Number(view.latitude) : null,
      longitude: view.longitude ? Number(view.longitude) : null,
      referrer: view.referrer,
      user_agent: view.userAgent,
    }))

    return NextResponse.json({
      totalViews,
      totalClicks,
      viewsOverTime,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      geoDistribution,
      clickTypeBreakdown,
      platformClickBreakdown,
      recentViews: formattedRecentViews,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
