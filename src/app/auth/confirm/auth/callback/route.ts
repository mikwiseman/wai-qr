import { NextRequest, NextResponse } from 'next/server'

const APP_ORIGIN = 'https://waiqr.xyz'

export function GET(request: NextRequest) {
  const redirectUrl = new URL('/auth/callback', APP_ORIGIN)
  redirectUrl.search = new URL(request.url).search
  return NextResponse.redirect(redirectUrl)
}
