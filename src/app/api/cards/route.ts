import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateShortCode } from '@/lib/shortcode'

// Transform Prisma BusinessCard to API format
function transformCard(card: {
  id: string
  userId: string
  shortCode: string
  displayName: string
  headline: string | null
  bio: string | null
  avatarUrl: string | null
  coverImageUrl: string | null
  email: string | null
  phone: string | null
  website: string | null
  company: string | null
  jobTitle: string | null
  location: string | null
  themeColor: string
  themeStyle: string
  calendarUrl: string | null
  calendarEmbed: boolean
  isActive: boolean
  isPublic: boolean
  showVcardDownload: boolean
  showContactForm: boolean
  createdAt: Date
  updatedAt: Date
  _count?: { cardViews: number; linkClicks: number; contactRequests: number }
}) {
  return {
    id: card.id,
    user_id: card.userId,
    short_code: card.shortCode,
    display_name: card.displayName,
    headline: card.headline,
    bio: card.bio,
    avatar_url: card.avatarUrl,
    cover_image_url: card.coverImageUrl,
    email: card.email,
    phone: card.phone,
    website: card.website,
    company: card.company,
    job_title: card.jobTitle,
    location: card.location,
    theme_color: card.themeColor,
    theme_style: card.themeStyle,
    calendar_url: card.calendarUrl,
    calendar_embed: card.calendarEmbed,
    is_active: card.isActive,
    is_public: card.isPublic,
    show_vcard_download: card.showVcardDownload,
    show_contact_form: card.showContactForm,
    created_at: card.createdAt.toISOString(),
    updated_at: card.updatedAt.toISOString(),
    view_count: card._count?.cardViews ?? 0,
    click_count: card._count?.linkClicks ?? 0,
    contact_count: card._count?.contactRequests ?? 0,
  }
}

// GET /api/cards - List user's business cards
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cards = await prisma.businessCard.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            cardViews: true,
            linkClicks: true,
            contactRequests: true,
          },
        },
      },
    })

    return NextResponse.json(cards.map(transformCard))
  } catch (error) {
    console.error('Error fetching cards:', error)
    return NextResponse.json({ error: 'Failed to fetch business cards' }, { status: 500 })
  }
}

// POST /api/cards - Create a new business card
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      displayName,
      headline,
      bio,
      avatarUrl,
      coverImageUrl,
      email,
      phone,
      website,
      company,
      jobTitle,
      location,
      themeColor,
      themeStyle,
      calendarUrl,
      calendarEmbed,
      socialLinks,
      customLinks,
    } = body

    // Validate required field
    if (!displayName || displayName.trim().length === 0) {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 })
    }

    // Generate unique short code
    const shortCode = generateShortCode(8)

    // Create card with links in a transaction
    const card = await prisma.$transaction(async (tx) => {
      // Create the business card
      const newCard = await tx.businessCard.create({
        data: {
          userId: session.userId,
          shortCode,
          displayName: displayName.trim(),
          headline: headline?.trim() || null,
          bio: bio?.trim() || null,
          avatarUrl: avatarUrl || null,
          coverImageUrl: coverImageUrl || null,
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          website: website?.trim() || null,
          company: company?.trim() || null,
          jobTitle: jobTitle?.trim() || null,
          location: location?.trim() || null,
          themeColor: themeColor || '#8B5CF6',
          themeStyle: themeStyle || 'modern',
          calendarUrl: calendarUrl?.trim() || null,
          calendarEmbed: calendarEmbed || false,
        },
      })

      // Create social links if provided
      if (socialLinks && Array.isArray(socialLinks) && socialLinks.length > 0) {
        await tx.socialLink.createMany({
          data: socialLinks.map((link: { platform: string; url: string; username?: string }, index: number) => ({
            businessCardId: newCard.id,
            platform: link.platform,
            url: link.url,
            username: link.username || null,
            sortOrder: index,
          })),
        })
      }

      // Create custom links if provided
      if (customLinks && Array.isArray(customLinks) && customLinks.length > 0) {
        await tx.customLink.createMany({
          data: customLinks.map((link: { title: string; url: string; icon?: string }, index: number) => ({
            businessCardId: newCard.id,
            title: link.title,
            url: link.url,
            icon: link.icon || null,
            sortOrder: index,
          })),
        })
      }

      return newCard
    })

    // Fetch the card with counts
    const cardWithCounts = await prisma.businessCard.findUnique({
      where: { id: card.id },
      include: {
        _count: {
          select: {
            cardViews: true,
            linkClicks: true,
            contactRequests: true,
          },
        },
      },
    })

    return NextResponse.json(transformCard(cardWithCounts!), { status: 201 })
  } catch (error) {
    console.error('Error creating card:', error)
    return NextResponse.json({ error: 'Failed to create business card' }, { status: 500 })
  }
}
