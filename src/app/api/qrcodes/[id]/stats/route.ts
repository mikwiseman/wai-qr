import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get total scan count
    const totalScans = await prisma.scan.count({
      where: { qrCodeId: id },
    })

    // Get all scans for analysis within date range
    const allScans = await prisma.scan.findMany({
      where: {
        qrCodeId: id,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'asc' },
    })

    // Process scans over time (daily buckets)
    const dailyScansMap = new Map<string, number>()
    allScans.forEach((scan) => {
      const date = scan.timestamp.toISOString().split('T')[0]
      dailyScansMap.set(date, (dailyScansMap.get(date) || 0) + 1)
    })

    const scansOverTime = Array.from(dailyScansMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Device breakdown
    const deviceMap = new Map<string, number>()
    allScans.forEach((scan) => {
      const device = scan.deviceType || 'Unknown'
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1)
    })
    const deviceBreakdown = Array.from(deviceMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))

    // Browser breakdown
    const browserMap = new Map<string, number>()
    allScans.forEach((scan) => {
      const browser = scan.browser || 'Unknown'
      browserMap.set(browser, (browserMap.get(browser) || 0) + 1)
    })
    const browserBreakdown = Array.from(browserMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // OS breakdown
    const osMap = new Map<string, number>()
    allScans.forEach((scan) => {
      const os = scan.os || 'Unknown'
      osMap.set(os, (osMap.get(os) || 0) + 1)
    })
    const osBreakdown = Array.from(osMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // Geographic distribution
    const geoMap = new Map<string, { count: number; countryCode: string | null }>()
    allScans.forEach((scan) => {
      if (scan.country) {
        const existing = geoMap.get(scan.country) || { count: 0, countryCode: scan.countryCode }
        existing.count++
        geoMap.set(scan.country, existing)
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

    // Get recent scans
    const recentScans = await prisma.scan.findMany({
      where: { qrCodeId: id },
      orderBy: { timestamp: 'desc' },
      take: 50,
    })

    // Transform recent scans to match expected API format
    const formattedRecentScans = recentScans.map(scan => ({
      id: scan.id,
      qr_code_id: scan.qrCodeId,
      timestamp: scan.timestamp.toISOString(),
      device_type: scan.deviceType,
      browser: scan.browser,
      browser_version: scan.browserVersion,
      os: scan.os,
      os_version: scan.osVersion,
      ip_address: scan.ipAddress,
      country: scan.country,
      country_code: scan.countryCode,
      region: scan.region,
      city: scan.city,
      latitude: scan.latitude ? Number(scan.latitude) : null,
      longitude: scan.longitude ? Number(scan.longitude) : null,
      referrer: scan.referrer,
      user_agent: scan.userAgent,
    }))

    return NextResponse.json({
      totalScans,
      scansOverTime,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      geoDistribution,
      recentScans: formattedRecentScans,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
