import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, getAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    const isValid = verifyPassword(password)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const cookie = getAuthCookie(true)
    const response = NextResponse.json({ success: true })
    response.headers.set('Set-Cookie', cookie)

    return response
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
