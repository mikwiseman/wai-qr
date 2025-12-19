import { NextResponse } from 'next/server'
import { createSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createSupabase()

    // Get all uploaded images
    const { data: images, error } = await supabase
      .from('user_images')
      .select('id, storage_path, original_filename, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ images: [] })
    }

    // Convert storage paths to public URLs
    const imagesWithUrls = images.map(image => {
      const { data: { publicUrl } } = supabase.storage
        .from('qr-center-images')
        .getPublicUrl(image.storage_path)

      return {
        id: image.id,
        url: publicUrl,
        filename: image.original_filename || 'Uploaded image',
      }
    })

    return NextResponse.json({ images: imagesWithUrls })
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json({ images: [] })
  }
}
