import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseUserAgent } from '@/lib/user-agent'
import { getGeoLocation, getClientIP } from '@/lib/geolocation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    // Find the QR code
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode: code },
    })

    if (!qrCode) {
      return NextResponse.redirect(new URL('/not-found', request.url))
    }

    if (!qrCode.isActive) {
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
        await prisma.scan.create({
          data: {
            qrCodeId: qrCode.id,
            deviceType,
            browser,
            browserVersion,
            os,
            osVersion,
            ipAddress: ip,
            country: geo.country,
            countryCode: geo.countryCode,
            region: geo.region,
            city: geo.city,
            latitude: geo.latitude,
            longitude: geo.longitude,
            referrer,
            userAgent: userAgentString,
          },
        })
      })
      .catch(console.error)

    // Redirect immediately (don't wait for analytics)
    return NextResponse.redirect(qrCode.destinationUrl)
  } catch (error) {
    console.error('Redirect error:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }
}
