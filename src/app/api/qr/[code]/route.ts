import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateQRCodeBuffer, LogoOptions, CenterImageType } from '@/lib/qrcode'
import { CenterImageType as PrismaCenterImageType } from '@/generated/prisma'

// Map Prisma enum to API values
function fromPrismaCenterImageType(type: PrismaCenterImageType): CenterImageType {
  if (type === 'default_img') return 'default'
  return type as CenterImageType
}

// GET /api/qr/[code] - Download QR code as PNG
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode: code },
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://waiqr.xyz'
    const redirectUrl = `${baseUrl}/r/${qrCode.shortCode}`

    // Build logo options from stored settings
    const logoOptions: LogoOptions = {
      type: fromPrismaCenterImageType(qrCode.centerImageType),
      reference: qrCode.centerImageRef || undefined,
    }

    const buffer = await generateQRCodeBuffer(redirectUrl, logoOptions)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="qrcode-${qrCode.shortCode}.png"`,
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
  }
}
