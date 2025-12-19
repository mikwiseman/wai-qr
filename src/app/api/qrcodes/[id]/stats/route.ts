import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (qrError || !qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get total scan count
    const { count: totalScans } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('qr_code_id', id)

    // Get all scans for analysis
    const { data: allScans, error: scansError } = await supabase
      .from('scans')
      .select('*')
      .eq('qr_code_id', id)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true })

    if (scansError) {
      console.error('Error fetching scans:', scansError)
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    // Process scans over time (daily buckets)
    const dailyScansMap = new Map<string, number>()
    allScans?.forEach((scan) => {
      const date = new Date(scan.timestamp).toISOString().split('T')[0]
      dailyScansMap.set(date, (dailyScansMap.get(date) || 0) + 1)
    })

    const scansOverTime = Array.from(dailyScansMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Device breakdown
    const deviceMap = new Map<string, number>()
    allScans?.forEach((scan) => {
      const device = scan.device_type || 'Unknown'
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1)
    })
    const deviceBreakdown = Array.from(deviceMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))

    // Browser breakdown
    const browserMap = new Map<string, number>()
    allScans?.forEach((scan) => {
      const browser = scan.browser || 'Unknown'
      browserMap.set(browser, (browserMap.get(browser) || 0) + 1)
    })
    const browserBreakdown = Array.from(browserMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // OS breakdown
    const osMap = new Map<string, number>()
    allScans?.forEach((scan) => {
      const os = scan.os || 'Unknown'
      osMap.set(os, (osMap.get(os) || 0) + 1)
    })
    const osBreakdown = Array.from(osMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // Geographic distribution
    const geoMap = new Map<string, { count: number; countryCode: string | null }>()
    allScans?.forEach((scan) => {
      if (scan.country) {
        const existing = geoMap.get(scan.country) || { count: 0, countryCode: scan.country_code }
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
    const { data: recentScans } = await supabase
      .from('scans')
      .select('*')
      .eq('qr_code_id', id)
      .order('timestamp', { ascending: false })
      .limit(50)

    return NextResponse.json({
      totalScans: totalScans || 0,
      scansOverTime,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      geoDistribution,
      recentScans: recentScans || [],
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
