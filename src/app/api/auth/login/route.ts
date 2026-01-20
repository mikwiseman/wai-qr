import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/db'
import { sendMagicLinkEmail } from '@/lib/email'

const MAGIC_LINK_EXPIRY_MINUTES = 15

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      user = await prisma.user.create({
        data: { email: normalizedEmail },
      })
    }

    // Generate magic link token
    const token = nanoid(32)
    const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000)

    // Store magic link in database
    await prisma.magicLink.create({
      data: {
        token,
        email: normalizedEmail,
        userId: user.id,
        expiresAt,
      },
    })

    // Send email
    const { success, error } = await sendMagicLinkEmail({
      email: normalizedEmail,
      token,
    })

    if (!success) {
      console.error('Failed to send magic link email:', error)
      return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 })
  }
}
