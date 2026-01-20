import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateVCard, generateVCardFilename, getVCardMimeType } from '@/lib/vcard'

// GET /api/cards/[id]/vcard - Download vCard for a business card
// This is a public route (no auth required) for vCard download
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find the card with social links
    const card = await prisma.businessCard.findUnique({
      where: { id },
      include: {
        socialLinks: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!card) {
      return NextResponse.json({ error: 'Business card not found' }, { status: 404 })
    }

    if (!card.isActive || !card.isPublic) {
      return NextResponse.json({ error: 'Business card is not available' }, { status: 404 })
    }

    if (!card.showVcardDownload) {
      return NextResponse.json({ error: 'vCard download is disabled for this card' }, { status: 403 })
    }

    // Build the card URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://waiqr.xyz'
    const cardUrl = `${baseUrl}/c/${card.shortCode}`

    // Generate vCard
    const vCardData = generateVCard({
      displayName: card.displayName,
      email: card.email,
      phone: card.phone,
      website: card.website,
      company: card.company,
      jobTitle: card.jobTitle,
      location: card.location,
      bio: card.bio,
      avatarUrl: card.avatarUrl,
      socialLinks: card.socialLinks.map(link => ({
        platform: link.platform,
        url: link.url,
      })),
      cardUrl,
    })

    const filename = generateVCardFilename(card.displayName)

    return new NextResponse(vCardData, {
      headers: {
        'Content-Type': getVCardMimeType(),
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating vCard:', error)
    return NextResponse.json({ error: 'Failed to generate vCard' }, { status: 500 })
  }
}
