import { NextRequest, NextResponse } from 'next/server'

export function GET(request: NextRequest) {
  const currentUrl = new URL(request.url)
  const redirectUrl = new URL('/auth/callback', currentUrl.origin)
  redirectUrl.search = currentUrl.search
  return NextResponse.redirect(redirectUrl)
}
