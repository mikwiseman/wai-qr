import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getClientIP, getGeoLocation } from '@/lib/geolocation'
import { parseUserAgent } from '@/lib/user-agent'

// POST /c/[code]/click - Track a link click
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()

    const { linkType, linkId, platform } = body

    // Validate link type
    const validTypes = ['social', 'custom', 'vcard', 'calendar']
    if (!linkType || !validTypes.includes(linkType)) {
      return NextResponse.json({ error: 'Invalid link type' }, { status: 400 })
    }

    // Find the card
    const card = await prisma.businessCard.findUnique({
      where: { shortCode: code },
    })

    if (!card || !card.isActive || !card.isPublic) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // Get analytics data
    const userAgentString = request.headers.get('user-agent') || ''
    const ip = getClientIP(request)
    const { deviceType } = parseUserAgent(userAgentString)

    // Get geolocation asynchronously (don't block response)
    getGeoLocation(ip)
      .then(async (geo) => {
        await prisma.linkClick.create({
          data: {
            businessCardId: card.id,
            linkType,
            linkId: linkId || null,
            platform: platform || null,
            deviceType,
            country: geo.country,
          },
        })
      })
      .catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking click:', error)
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
  }
}
