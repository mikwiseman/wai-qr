import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { CenterImageType as PrismaCenterImageType } from '@/generated/prisma'

// Map API center image type to Prisma enum
function toPrismaCenterImageType(type: string): PrismaCenterImageType {
  if (type === 'default') return 'default_img'
  if (type === 'preset' || type === 'custom' || type === 'none') return type as PrismaCenterImageType
  return 'default_img'
}

// Map Prisma enum to API format
function fromPrismaCenterImageType(type: PrismaCenterImageType): string {
  if (type === 'default_img') return 'default'
  return type
}

// Transform functions for API response
function transformSocialLink(link: {
  id: string
  businessCardId: string
  platform: string
  url: string
  username: string | null
  sortOrder: number
  isVisible: boolean
}) {
  return {
    id: link.id,
    business_card_id: link.businessCardId,
    platform: link.platform,
    url: link.url,
    username: link.username,
    sort_order: link.sortOrder,
    is_visible: link.isVisible,
  }
}

function transformCustomLink(link: {
  id: string
  businessCardId: string
  title: string
  url: string
  icon: string | null
  sortOrder: number
  isVisible: boolean
}) {
  return {
    id: link.id,
    business_card_id: link.businessCardId,
    title: link.title,
    url: link.url,
    icon: link.icon,
    sort_order: link.sortOrder,
    is_visible: link.isVisible,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformCard(card: any) {
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
    qr_center_type: fromPrismaCenterImageType(card.qrCenterType),
    qr_center_image: card.qrCenterImage,
    is_active: card.isActive,
    is_public: card.isPublic,
    show_vcard_download: card.showVcardDownload,
    show_contact_form: card.showContactForm,
    created_at: card.createdAt.toISOString(),
    updated_at: card.updatedAt.toISOString(),
    social_links: card.socialLinks?.map(transformSocialLink) || [],
    custom_links: card.customLinks?.map(transformCustomLink) || [],
    view_count: card._count?.cardViews ?? 0,
    click_count: card._count?.linkClicks ?? 0,
    contact_count: card._count?.contactRequests ?? 0,
  }
}

// GET /api/cards/[id] - Get a single business card with links
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const card = await prisma.businessCard.findUnique({
      where: { id, userId: session.userId },
      include: {
        socialLinks: {
          orderBy: { sortOrder: 'asc' },
        },
        customLinks: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            cardViews: true,
            linkClicks: true,
            contactRequests: true,
          },
        },
      },
    })

    if (!card) {
      return NextResponse.json({ error: 'Business card not found' }, { status: 404 })
    }

    return NextResponse.json(transformCard(card))
  } catch (error) {
    console.error('Error fetching card:', error)
    return NextResponse.json({ error: 'Failed to fetch business card' }, { status: 500 })
  }
}

// PATCH /api/cards/[id] - Update a business card
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Check ownership
    const existing = await prisma.businessCard.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Business card not found' }, { status: 404 })
    }

    if (existing.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {}

    // Handle string fields
    const stringFields = [
      'displayName', 'headline', 'bio', 'avatarUrl', 'coverImageUrl',
      'email', 'phone', 'website', 'company', 'jobTitle', 'location',
      'themeColor', 'themeStyle', 'calendarUrl',
    ]
    for (const field of stringFields) {
      if (field in body) {
        const value = body[field]
        updateData[field] = typeof value === 'string' ? value.trim() || null : null
      }
    }

    // Handle boolean fields
    const booleanFields = ['isActive', 'isPublic', 'showVcardDownload', 'showContactForm', 'calendarEmbed']
    for (const field of booleanFields) {
      if (field in body) {
        updateData[field] = Boolean(body[field])
      }
    }

    // Handle QR code center image
    if ('qrCenterType' in body) {
      updateData.qrCenterType = toPrismaCenterImageType(body.qrCenterType)
    }
    if ('qrCenterImage' in body) {
      updateData.qrCenterImage = body.qrCenterImage || null
    }

    // Update card and links in a transaction
    const updatedCard = await prisma.$transaction(async (tx) => {
      // Update the card
      const card = await tx.businessCard.update({
        where: { id },
        data: updateData,
      })

      // Update social links if provided
      if ('socialLinks' in body && Array.isArray(body.socialLinks)) {
        // Delete existing links
        await tx.socialLink.deleteMany({
          where: { businessCardId: id },
        })

        // Create new links
        if (body.socialLinks.length > 0) {
          await tx.socialLink.createMany({
            data: body.socialLinks.map((link: { platform: string; url: string; username?: string; isVisible?: boolean }, index: number) => ({
              businessCardId: id,
              platform: link.platform,
              url: link.url,
              username: link.username || null,
              sortOrder: index,
              isVisible: link.isVisible !== false,
            })),
          })
        }
      }

      // Update custom links if provided
      if ('customLinks' in body && Array.isArray(body.customLinks)) {
        // Delete existing links
        await tx.customLink.deleteMany({
          where: { businessCardId: id },
        })

        // Create new links
        if (body.customLinks.length > 0) {
          await tx.customLink.createMany({
            data: body.customLinks.map((link: { title: string; url: string; icon?: string; isVisible?: boolean }, index: number) => ({
              businessCardId: id,
              title: link.title,
              url: link.url,
              icon: link.icon || null,
              sortOrder: index,
              isVisible: link.isVisible !== false,
            })),
          })
        }
      }

      return card
    })

    // Fetch the updated card with all relations
    const cardWithRelations = await prisma.businessCard.findUnique({
      where: { id: updatedCard.id },
      include: {
        socialLinks: {
          orderBy: { sortOrder: 'asc' },
        },
        customLinks: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            cardViews: true,
            linkClicks: true,
            contactRequests: true,
          },
        },
      },
    })

    return NextResponse.json(transformCard(cardWithRelations))
  } catch (error) {
    console.error('Error updating card:', error)
    return NextResponse.json({ error: 'Failed to update business card' }, { status: 500 })
  }
}

// DELETE /api/cards/[id] - Delete a business card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check ownership
    const existing = await prisma.businessCard.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Business card not found' }, { status: 404 })
    }

    if (existing.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the card (cascades to links, views, clicks, contact requests)
    await prisma.businessCard.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting card:', error)
    return NextResponse.json({ error: 'Failed to delete business card' }, { status: 500 })
  }
}
