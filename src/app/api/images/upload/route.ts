import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import sharp from 'sharp'
import { nanoid } from 'nanoid'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    const filename = `${nanoid()}.png`
    const userDir = path.join(UPLOADS_DIR, session.userId)
    const filePath = path.join(userDir, filename)

    // Ensure user directory exists
    await mkdir(userDir, { recursive: true })

    // Write file to disk
    await writeFile(filePath, processedBuffer)

    // Store path relative to /public for URL generation
    const storagePath = `${session.userId}/${filename}`

    // Store in user_images table
    const imageRecord = await prisma.userImage.create({
      data: {
        userId: session.userId,
        storagePath,
        originalFilename: file.name,
        fileSize: processedBuffer.length,
      },
    })

    // Generate public URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://waiqr.xyz'
    const publicUrl = `${baseUrl}/uploads/${storagePath}`

    return NextResponse.json({
      id: imageRecord.id,
      url: publicUrl,
      filename: file.name,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
