import { NextResponse, type NextRequest } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/auth/', '/api/auth/', '/r/', '/api/qr/', '/c/']

// Patterns for public card API endpoints (vcard download and contact submission)
const PUBLIC_CARD_API_PATTERNS = [
  /^\/api\/cards\/[^/]+\/vcard$/,    // /api/cards/[id]/vcard
  /^\/api\/cards\/[^/]+\/contact$/,  // /api/cards/[id]/contact (POST is public)
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip if public route
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if it's a public card API endpoint
  // Note: Contact GET requires auth (handled in route handler)
  if (PUBLIC_CARD_API_PATTERNS.some(pattern => pattern.test(pathname))) {
    // vCard is always public, contact POST is public
    if (pathname.endsWith('/vcard') || request.method === 'POST') {
      return NextResponse.next()
    }
  }

  // Check JWT session
  const session = await getSessionFromRequest(request)

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads|presets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
