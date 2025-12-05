import { cookies } from 'next/headers'
import { serialize } from 'cookie'

const AUTH_COOKIE_NAME = 'qr_auth'

export function verifyPassword(password: string): boolean {
  const authPassword = process.env.AUTH_PASSWORD
  if (!authPassword) {
    console.error('AUTH_PASSWORD environment variable is not set')
    return false
  }
  return password === authPassword
}

export function getAuthCookie(authenticated: boolean): string {
  return serialize(AUTH_COOKIE_NAME, authenticated ? 'true' : '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: authenticated ? 60 * 60 * 24 * 7 : 0, // 1 week or expire immediately
    path: '/',
  })
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME)
  return authCookie?.value === 'true'
}

export function isAuthenticatedSync(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false
  const cookies = cookieHeader.split(';').map(c => c.trim())
  const authCookie = cookies.find(c => c.startsWith(`${AUTH_COOKIE_NAME}=`))
  return authCookie?.split('=')[1] === 'true'
}
