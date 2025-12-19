import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Simple client for public routes (no auth needed)
 */
export function createPublicSupabase() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Browser client - use in client components
 */
export function createBrowserSupabase() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Server client - use in server components and server actions
 */
export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from Server Component - ignore
        }
      },
    },
  })
}

/**
 * Route handler client - use in API routes
 * Returns client and a function to get the response with cookies
 */
export function createRouteSupabase(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  return supabase
}

// Types for database tables
export type CenterImageType = 'default' | 'preset' | 'custom' | 'none'

export interface QRCode {
  id: string
  short_code: string
  destination_url: string
  title: string | null
  created_at: string
  updated_at: string
  is_active: boolean
  user_id: string | null
  center_image_type: CenterImageType
  center_image_ref: string | null
}

export interface Scan {
  id: string
  qr_code_id: string
  timestamp: string
  device_type: string | null
  browser: string | null
  browser_version: string | null
  os: string | null
  os_version: string | null
  ip_address: string | null
  country: string | null
  country_code: string | null
  region: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  referrer: string | null
  user_agent: string | null
}

export interface UserImage {
  id: string
  user_id: string
  storage_path: string
  original_filename: string | null
  file_size: number | null
  created_at: string
}
