import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateQRCodeDataURL, LogoOptions, CenterImageType } from '@/lib/qrcode'
import { CenterImageType as PrismaCenterImageType } from '@/generated/prisma'

// Map Prisma enum to API values
function fromPrismaCenterImageType(type: PrismaCenterImageType): CenterImageType {
  if (type === 'default_img') return 'default'
  return type as CenterImageType
}

// Map API values to Prisma enum
function toPrismaCenterImageType(type: CenterImageType): PrismaCenterImageType {
  if (type === 'default') return 'default_img'
  return type as PrismaCenterImageType
}

// GET /api/qrcodes/[id] - Get single QR code with full details
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

    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id,
        userId: session.userId,
      },
      include: {
        _count: {
          select: { scans: true },
        },
      },
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    // Generate the redirect URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://waiqr.xyz'
    const redirectUrl = `${baseUrl}/r/${qrCode.shortCode}`

    // Build logo options from stored settings
    const centerImageType = fromPrismaCenterImageType(qrCode.centerImageType)
    const logoOptions: LogoOptions = {
      type: centerImageType,
      reference: qrCode.centerImageRef || undefined,
    }

    // Generate QR code image as data URL
    const qrImageDataUrl = await generateQRCodeDataURL(redirectUrl, logoOptions)

    return NextResponse.json({
      id: qrCode.id,
      short_code: qrCode.shortCode,
      destination_url: qrCode.destinationUrl,
      title: qrCode.title,
      created_at: qrCode.createdAt.toISOString(),
      updated_at: qrCode.updatedAt.toISOString(),
      is_active: qrCode.isActive,
      user_id: qrCode.userId,
      center_image_type: centerImageType,
      center_image_ref: qrCode.centerImageRef,
      scan_count: qrCode._count.scans,
      redirectUrl,
      qrImageDataUrl,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch QR code' }, { status: 500 })
  }
}

// DELETE /api/qrcodes/[id] - Delete a QR code
export async function DELETE(
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

    // Delete only if owned by user
    const result = await prisma.qRCode.deleteMany({
      where: {
        id,
        userId: session.userId,
      },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to delete QR code' }, { status: 500 })
  }
}

// PATCH /api/qrcodes/[id] - Update a QR code
export async function PATCH(
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

    const body = await request.json()

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (body.destinationUrl !== undefined) updateData.destinationUrl = body.destinationUrl
    if (body.title !== undefined) updateData.title = body.title
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.centerImageType !== undefined) {
      updateData.centerImageType = toPrismaCenterImageType(body.centerImageType as CenterImageType)
    }
    if (body.centerImageRef !== undefined) updateData.centerImageRef = body.centerImageRef

    // Update only if owned by user
    const qrCode = await prisma.qRCode.updateMany({
      where: {
        id,
        userId: session.userId,
      },
      data: updateData,
    })

    if (qrCode.count === 0) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    // Fetch updated record
    const updated = await prisma.qRCode.findUnique({
      where: { id },
    })

    if (!updated) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: updated.id,
      short_code: updated.shortCode,
      destination_url: updated.destinationUrl,
      title: updated.title,
      created_at: updated.createdAt.toISOString(),
      updated_at: updated.updatedAt.toISOString(),
      is_active: updated.isActive,
      user_id: updated.userId,
      center_image_type: fromPrismaCenterImageType(updated.centerImageType),
      center_image_ref: updated.centerImageRef,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to update QR code' }, { status: 500 })
  }
}
