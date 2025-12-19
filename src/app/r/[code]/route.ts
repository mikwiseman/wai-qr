import { NextRequest, NextResponse } from 'next/server'
import { createPublicSupabase } from '@/lib/supabase'
import { parseUserAgent } from '@/lib/user-agent'
import { getGeoLocation, getClientIP } from '@/lib/geolocation'

const supabase = createPublicSupabase()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    // Find the QR code
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('short_code', code)
      .single()

    if (error || !qrCode) {
      return NextResponse.redirect(new URL('/not-found', request.url))
    }

    if (!qrCode.is_active) {
      return NextResponse.redirect(new URL('/inactive', request.url))
    }

    // Capture analytics data
    const userAgentString = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || null
    const ip = getClientIP(request)

    // Parse user agent
    const { deviceType, browser, browserVersion, os, osVersion } = parseUserAgent(userAgentString)

    // Get geolocation and save scan (async, don't block redirect)
    getGeoLocation(ip)
      .then(async (geo) => {
        await supabase.from('scans').insert({
          qr_code_id: qrCode.id,
          device_type: deviceType,
          browser,
          browser_version: browserVersion,
          os,
          os_version: osVersion,
          ip_address: ip,
          country: geo.country,
          country_code: geo.countryCode,
          region: geo.region,
          city: geo.city,
          latitude: geo.latitude,
          longitude: geo.longitude,
          referrer,
          user_agent: userAgentString,
        })
      })
      .catch(console.error)

    // Redirect immediately (don't wait for analytics)
    return NextResponse.redirect(qrCode.destination_url)
  } catch (error) {
    console.error('Redirect error:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }
}
