import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateShortCode } from '@/lib/shortcode'
import { CenterImageType } from '@/lib/supabase'

// GET /api/qrcodes - List user's QR codes with scan counts
export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: qrCodes, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching QR codes:', error)
      return NextResponse.json({ error: 'Failed to fetch QR codes' }, { status: 500 })
    }

    // Get scan counts for each QR code
    const qrCodesWithCounts = await Promise.all(
      (qrCodes || []).map(async (qr) => {
        const { count } = await supabase
          .from('scans')
          .select('*', { count: 'exact', head: true })
          .eq('qr_code_id', qr.id)

        return { ...qr, scan_count: count || 0 }
      })
    )

    return NextResponse.json(qrCodesWithCounts)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch QR codes' }, { status: 500 })
  }
}

// POST /api/qrcodes - Create a new QR code
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
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

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .insert({
        user_id: user.id,
        short_code: shortCode,
        destination_url: destinationUrl,
        title: title || null,
        center_image_type: imageType,
        center_image_ref: centerImageRef || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating QR code:', error)
      return NextResponse.json({ error: 'Failed to create QR code' }, { status: 500 })
    }

    return NextResponse.json(qrCode, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to create QR code' }, { status: 500 })
  }
}
