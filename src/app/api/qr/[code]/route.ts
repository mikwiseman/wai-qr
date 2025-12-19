import { NextRequest, NextResponse } from 'next/server'
import { createPublicSupabase, CenterImageType } from '@/lib/supabase'
import { generateQRCodeBuffer, LogoOptions } from '@/lib/qrcode'

const supabase = createPublicSupabase()

// GET /api/qr/[code] - Download QR code as PNG
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('short_code', code)
      .single()

    if (error || !qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUrl = `${baseUrl}/r/${qrCode.short_code}`

    // Build logo options from stored settings
    const logoOptions: LogoOptions = {
      type: (qrCode.center_image_type as CenterImageType) || 'default',
      reference: qrCode.center_image_ref || undefined,
    }

    const buffer = await generateQRCodeBuffer(redirectUrl, logoOptions)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="qrcode-${qrCode.short_code}.png"`,
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
  }
}
