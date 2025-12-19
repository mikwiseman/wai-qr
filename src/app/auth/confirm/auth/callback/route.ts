import { NextRequest, NextResponse } from 'next/server'

export function GET(request: NextRequest) {
  const redirectUrl = new URL(request.url)
  redirectUrl.pathname = '/auth/callback'
  return NextResponse.redirect(redirectUrl)
}
