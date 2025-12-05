import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateShortCode } from '@/lib/shortcode'

// GET /api/qrcodes - List all QR codes with scan counts
export async function GET() {
  try {
    const { data: qrCodes, error } = await supabase
      .from('qr_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching QR codes:', error)
      return NextResponse.json({ error: 'Failed to fetch QR codes' }, { status: 500 })
    }

    // Get scan counts for each QR code
    const qrCodesWithCounts = await Promise.all(
      qrCodes.map(async (qr) => {
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
    const { destinationUrl, title } = await request.json()

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

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .insert({
        short_code: shortCode,
        destination_url: destinationUrl,
        title: title || null,
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
