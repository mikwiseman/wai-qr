import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabaseInstance: SupabaseClient | null = null

export const supabase = (() => {
  if (!supabaseInstance && supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  if (!supabaseInstance) {
    // Return a mock client for build time
    return createClient('https://placeholder.supabase.co', 'placeholder-key')
  }
  return supabaseInstance
})()

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
