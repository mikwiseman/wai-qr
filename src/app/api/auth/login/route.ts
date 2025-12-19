import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const EMAIL_REDIRECT_TO = 'https://waiqr.xyz/auth/callback'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  // Create response for cookie handling
  const response = NextResponse.json({ success: true })

  // Create Supabase client
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

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: EMAIL_REDIRECT_TO,
    },
  })

  if (error) {
    console.error('Magic link error:', error.message)
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 })
  }

  return response
}
