import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateQRCodeBuffer, type CenterImageType } from '@/lib/qrcode'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/cards/[id]/qrcode - Download QR code image for a business card
export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params

  const card = await prisma.businessCard.findUnique({
    where: { id },
  })

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  // Generate the QR code URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://waiqr.xyz'
  const cardUrl = `${baseUrl}/c/${card.shortCode}`

  // Map database enum to qrcode lib type
  const typeMap: Record<string, CenterImageType> = {
    default_img: 'default',
    preset: 'preset',
    custom: 'custom',
    none: 'none',
  }

  const logoOptions = {
    type: typeMap[card.qrCenterType] || 'default',
    reference: card.qrCenterImage || undefined,
  }

  // Generate the QR code
  const qrBuffer = await generateQRCodeBuffer(cardUrl, logoOptions)

  // Return as PNG image (convert Buffer to Uint8Array for NextResponse)
  return new NextResponse(new Uint8Array(qrBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="card-${card.shortCode}-qr.png"`,
      'Cache-Control': 'no-cache',
    },
  })
}
