import { NextRequest, NextResponse } from 'next/server'
import { createSupabase } from '@/lib/supabase'
import sharp from 'sharp'
import { nanoid } from 'nanoid'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabase()

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use PNG or JPEG.' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 2MB.' }, { status: 400 })
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Process image with sharp - resize and convert to PNG
    const processedBuffer = await sharp(buffer)
      .resize(200, 200, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toBuffer()

    // Generate unique filename
    const filename = `uploads/${nanoid()}.png`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('qr-center-images')
      .upload(filename, processedBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('qr-center-images')
      .getPublicUrl(filename)

    // Store in user_images table
    const { data: imageRecord, error: dbError } = await supabase
      .from('user_images')
      .insert({
        storage_path: filename,
        original_filename: file.name,
        file_size: processedBuffer.length,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Image was uploaded but db record failed - still return success with URL
    }

    return NextResponse.json({
      id: imageRecord?.id || nanoid(),
      url: publicUrl,
      filename: file.name,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
