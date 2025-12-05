import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a placeholder client for build time
    return createClient('https://placeholder.supabase.co', 'placeholder-key')
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// Export as getter for backward compatibility
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getSupabase() as any)[prop]
  }
})

// Types for our database tables
export interface QRCode {
  id: string
  short_code: string
  destination_url: string
  title: string | null
  created_at: string
  updated_at: string
  is_active: boolean
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
