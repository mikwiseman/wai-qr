import { NextResponse, type NextRequest } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/auth/', '/api/auth/', '/r/', '/api/qr/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip if public route
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
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
