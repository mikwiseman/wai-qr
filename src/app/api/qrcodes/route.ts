import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateShortCode } from '@/lib/shortcode'
import { CenterImageType } from '@/lib/qrcode'
import { CenterImageType as PrismaCenterImageType } from '@/generated/prisma'

// Map API values to Prisma enum
function toPrismaCenterImageType(type: CenterImageType): PrismaCenterImageType {
  if (type === 'default') return 'default_img'
  return type as PrismaCenterImageType
}

// Map Prisma enum to API values
function fromPrismaCenterImageType(type: PrismaCenterImageType): CenterImageType {
  if (type === 'default_img') return 'default'
  return type as CenterImageType
}

// GET /api/qrcodes - List user's QR codes with scan counts
export async function GET() {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const qrCodes = await prisma.qRCode.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { scans: true },
        },
      },
    })

    // Transform to match expected API format
    const qrCodesWithCounts = qrCodes.map(qr => ({
      id: qr.id,
      short_code: qr.shortCode,
      destination_url: qr.destinationUrl,
      title: qr.title,
      created_at: qr.createdAt.toISOString(),
      updated_at: qr.updatedAt.toISOString(),
      is_active: qr.isActive,
      user_id: qr.userId,
      center_image_type: fromPrismaCenterImageType(qr.centerImageType),
      center_image_ref: qr.centerImageRef,
      scan_count: qr._count.scans,
    }))

    return NextResponse.json(qrCodesWithCounts)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch QR codes' }, { status: 500 })
  }
}

// POST /api/qrcodes - Create a new QR code
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { destinationUrl, title, centerImageType, centerImageRef } = await request.json()

    if (!destinationUrl) {
      return NextResponse.json({ error: 'Destination URL is required' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(destinationUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const shortCode = generateShortCode()

    // Validate center image type
    const validTypes: CenterImageType[] = ['default', 'preset', 'custom', 'none']
    const imageType: CenterImageType = validTypes.includes(centerImageType) ? centerImageType : 'default'

    const qrCode = await prisma.qRCode.create({
      data: {
        userId: session.userId,
        shortCode,
        destinationUrl,
        title: title || null,
        centerImageType: toPrismaCenterImageType(imageType),
        centerImageRef: centerImageRef || null,
      },
    })

    // Transform to match expected API format
    return NextResponse.json({
      id: qrCode.id,
      short_code: qrCode.shortCode,
      destination_url: qrCode.destinationUrl,
      title: qrCode.title,
      created_at: qrCode.createdAt.toISOString(),
      updated_at: qrCode.updatedAt.toISOString(),
      is_active: qrCode.isActive,
      user_id: qrCode.userId,
      center_image_type: fromPrismaCenterImageType(qrCode.centerImageType),
      center_image_ref: qrCode.centerImageRef,
    }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to create QR code' }, { status: 500 })
  }
}
