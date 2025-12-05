import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAuthenticatedSync } from '@/lib/auth'

// Routes that don't require authentication
const publicPaths = ['/login', '/r/', '/api/auth/']

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(path => pathname.startsWith(path))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Skip static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check authentication
  const cookieHeader = request.headers.get('cookie')
  const authenticated = isAuthenticatedSync(cookieHeader)

  if (!authenticated) {
    // Redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
