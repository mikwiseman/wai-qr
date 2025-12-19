import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const APP_ORIGIN = 'https://waiqr.xyz'
const DEFAULT_NEXT = '/dashboard'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? DEFAULT_NEXT
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : DEFAULT_NEXT

  if (!code) {
    return NextResponse.redirect(`${APP_ORIGIN}/login?error=no_code`)
  }

  // Create redirect response first so we can set cookies on it
  const redirectUrl = new URL(safeNext, APP_ORIGIN)
  let response = NextResponse.redirect(redirectUrl)

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Exchange the code for a session
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Auth callback error:', error.message)
    return NextResponse.redirect(`${APP_ORIGIN}/login?error=auth_failed`)
  }

  return response
}
