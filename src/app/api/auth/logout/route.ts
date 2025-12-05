import { NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'

export async function POST() {
  const cookie = getAuthCookie(false)
  const response = NextResponse.json({ success: true })
  response.headers.set('Set-Cookie', cookie)
  return response
}
