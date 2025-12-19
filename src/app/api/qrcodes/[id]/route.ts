import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateQRCodeDataURL, LogoOptions } from '@/lib/qrcode'
import { CenterImageType } from '@/lib/supabase'

// GET /api/qrcodes/[id] - Get single QR code with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
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

    // Build logo options from stored settings
    const logoOptions: LogoOptions = {
      type: (qrCode.center_image_type as CenterImageType) || 'default',
      reference: qrCode.center_image_ref || undefined,
    }

    // Generate QR code image as data URL
    const qrImageDataUrl = await generateQRCodeDataURL(redirectUrl, logoOptions)

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
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete only if owned by user
    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

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
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.destinationUrl !== undefined) updateData.destination_url = body.destinationUrl
    if (body.title !== undefined) updateData.title = body.title
    if (body.isActive !== undefined) updateData.is_active = body.isActive
    if (body.centerImageType !== undefined) updateData.center_image_type = body.centerImageType
    if (body.centerImageRef !== undefined) updateData.center_image_ref = body.centerImageRef
    updateData.updated_at = new Date().toISOString()

    // Update only if owned by user
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
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
