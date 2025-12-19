import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  // Create the redirect URL
  const redirectTo = new URL(next, 'https://waiqr.xyz')

  if (!token_hash || !type) {
    redirectTo.pathname = '/login'
    redirectTo.searchParams.set('error', 'missing_params')
    return NextResponse.redirect(redirectTo)
  }

  // Create response that we'll add cookies to
  let response = NextResponse.redirect(redirectTo)

  // Create Supabase client that sets cookies on the response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Verify the OTP token
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  })

  if (error) {
    console.error('OTP verification error:', error)
    const errorRedirect = new URL('/login', 'https://waiqr.xyz')
    errorRedirect.searchParams.set('error', 'auth_failed')
    return NextResponse.redirect(errorRedirect)
  }

  // Success - return response with auth cookies set
  return response
}
