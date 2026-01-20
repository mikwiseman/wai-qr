import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's uploaded images
    const images = await prisma.userImage.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        storagePath: true,
        originalFilename: true,
        createdAt: true,
      },
    })

    // Convert storage paths to public URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://waiqr.xyz'
    const imagesWithUrls = images.map(image => ({
      id: image.id,
      url: `${baseUrl}/uploads/${image.storagePath}`,
      filename: image.originalFilename || 'Uploaded image',
    }))

    return NextResponse.json({ images: imagesWithUrls })
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json({ images: [] })
  }
}
