import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createSessionToken, setSessionCookie } from '@/lib/auth'

const APP_ORIGIN = process.env.NEXT_PUBLIC_BASE_URL || 'https://waiqr.xyz'
const DEFAULT_NEXT = '/dashboard'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const next = searchParams.get('next') ?? DEFAULT_NEXT
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : DEFAULT_NEXT

  if (!token) {
    return NextResponse.redirect(`${APP_ORIGIN}/login?error=no_token`)
  }

  try {
    // Find and validate magic link
    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!magicLink) {
      return NextResponse.redirect(`${APP_ORIGIN}/login?error=invalid_token`)
    }

    // Check if already used
    if (magicLink.usedAt) {
      return NextResponse.redirect(`${APP_ORIGIN}/login?error=token_used`)
    }

    // Check if expired
    if (new Date() > magicLink.expiresAt) {
      return NextResponse.redirect(`${APP_ORIGIN}/login?error=token_expired`)
    }

    // Mark token as used
    await prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { usedAt: new Date() },
    })

    // Get or create user (should exist from login, but handle edge cases)
    let user = magicLink.user
    if (!user) {
      user = await prisma.user.upsert({
        where: { email: magicLink.email },
        create: { email: magicLink.email },
        update: {},
      })
    }

    // Create JWT session token
    const sessionToken = await createSessionToken(user.id, user.email)

    // Create redirect response and set session cookie
    const redirectUrl = new URL(safeNext, APP_ORIGIN)
    const response = NextResponse.redirect(redirectUrl)
    setSessionCookie(response, sessionToken)

    return response
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${APP_ORIGIN}/login?error=auth_failed`)
  }
}
