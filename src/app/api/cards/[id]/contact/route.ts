import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getClientIP } from '@/lib/geolocation'
import { parseUserAgent } from '@/lib/user-agent'
import { getGeoLocation } from '@/lib/geolocation'

// Transform contact request for API response
function transformContactRequest(request: {
  id: string
  businessCardId: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  message: string | null
  timestamp: Date
  isRead: boolean
  country: string | null
  deviceType: string | null
}) {
  return {
    id: request.id,
    business_card_id: request.businessCardId,
    name: request.name,
    email: request.email,
    phone: request.phone,
    company: request.company,
    message: request.message,
    timestamp: request.timestamp.toISOString(),
    is_read: request.isRead,
    country: request.country,
    device_type: request.deviceType,
  }
}

// GET /api/cards/[id]/contact - List contact requests (owner only)
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
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const requests = await prisma.contactRequest.findMany({
      where: {
        businessCardId: id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.contactRequest.count({
      where: {
        businessCardId: id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
    })

    return NextResponse.json({
      requests: requests.map(transformContactRequest),
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching contact requests:', error)
    return NextResponse.json({ error: 'Failed to fetch contact requests' }, { status: 500 })
  }
}

// POST /api/cards/[id]/contact - Submit a contact request (public)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Find the card
    const card = await prisma.businessCard.findUnique({
      where: { id },
    })

    if (!card) {
      return NextResponse.json({ error: 'Business card not found' }, { status: 404 })
    }

    if (!card.isActive || !card.isPublic) {
      return NextResponse.json({ error: 'Business card is not available' }, { status: 404 })
    }

    if (!card.showContactForm) {
      return NextResponse.json({ error: 'Contact form is disabled for this card' }, { status: 403 })
    }

    // Validate required fields
    const { name, email, phone, company, message } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 })
    }

    // Get analytics data
    const userAgentString = request.headers.get('user-agent') || ''
    const ip = getClientIP(request)
    const { deviceType } = parseUserAgent(userAgentString)

    // Get geolocation (async, but we'll wait for it for contact requests)
    const geo = await getGeoLocation(ip)

    // Create the contact request
    const contactRequest = await prisma.contactRequest.create({
      data: {
        businessCardId: id,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        message: message?.trim() || null,
        country: geo.country,
        deviceType,
      },
    })

    return NextResponse.json(transformContactRequest(contactRequest), { status: 201 })
  } catch (error) {
    console.error('Error creating contact request:', error)
    return NextResponse.json({ error: 'Failed to submit contact request' }, { status: 500 })
  }
}

// PATCH /api/cards/[id]/contact - Mark contact requests as read (owner only)
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

    const { requestIds, markAllRead } = body

    if (markAllRead) {
      // Mark all as read
      await prisma.contactRequest.updateMany({
        where: { businessCardId: id },
        data: { isRead: true },
      })
    } else if (requestIds && Array.isArray(requestIds)) {
      // Mark specific requests as read
      await prisma.contactRequest.updateMany({
        where: {
          id: { in: requestIds },
          businessCardId: id,
        },
        data: { isRead: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating contact requests:', error)
    return NextResponse.json({ error: 'Failed to update contact requests' }, { status: 500 })
  }
}
