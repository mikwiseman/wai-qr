import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateQRCodeDataURL } from '@/lib/qrcode'

// GET /api/qrcodes/[id] - Get single QR code with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    // Get scan count
    const { count } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('qr_code_id', id)

    // Generate the redirect URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUrl = `${baseUrl}/r/${qrCode.short_code}`

    // Generate QR code image as data URL
    const qrImageDataUrl = await generateQRCodeDataURL(redirectUrl)

    return NextResponse.json({
      ...qrCode,
      scan_count: count || 0,
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

    const { error } = await supabase.from('qr_codes').delete().eq('id', id)

    if (error) {
      console.error('Error deleting QR code:', error)
      return NextResponse.json({ error: 'Failed to delete QR code' }, { status: 500 })
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
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.destinationUrl !== undefined) updateData.destination_url = body.destinationUrl
    if (body.title !== undefined) updateData.title = body.title
    if (body.isActive !== undefined) updateData.is_active = body.isActive
    updateData.updated_at = new Date().toISOString()

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating QR code:', error)
      return NextResponse.json({ error: 'Failed to update QR code' }, { status: 500 })
    }

    return NextResponse.json(qrCode)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to update QR code' }, { status: 500 })
  }
}
