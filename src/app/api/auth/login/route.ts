import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, getAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Debug: log env var status
    const envPassword = process.env.AUTH_PASSWORD
    console.log('AUTH_PASSWORD is set:', !!envPassword)
    console.log('AUTH_PASSWORD length:', envPassword?.length || 0)

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    const isValid = verifyPassword(password)
    console.log('Password valid:', isValid)

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
