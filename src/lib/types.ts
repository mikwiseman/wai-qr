// Shared types used across the application

export type CenterImageType = 'default' | 'preset' | 'custom' | 'none'

export interface QRCode {
  id: string
  short_code: string
  destination_url: string
  title: string | null
  created_at: string
  updated_at: string
  is_active: boolean
  user_id: string
  center_image_type: CenterImageType
  center_image_ref: string | null
}

export interface QRCodeWithCount extends QRCode {
  scan_count: number
}

export interface QRCodeWithDetails extends QRCodeWithCount {
  redirectUrl: string
  qrImageDataUrl: string
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

// ============================================
// Business Cards Types
// ============================================

export interface BusinessCard {
  id: string
  user_id: string
  short_code: string
  display_name: string
  headline: string | null
  bio: string | null
  avatar_url: string | null
  cover_image_url: string | null
  email: string | null
  phone: string | null
  website: string | null
  company: string | null
  job_title: string | null
  location: string | null
  theme_color: string
  theme_style: string
  calendar_url: string | null
  calendar_embed: boolean
  is_active: boolean
  is_public: boolean
  show_vcard_download: boolean
  show_contact_form: boolean
  created_at: string
  updated_at: string
}

export interface BusinessCardWithStats extends BusinessCard {
  view_count: number
  click_count: number
  contact_count: number
}

export interface BusinessCardWithLinks extends BusinessCard {
  social_links: SocialLink[]
  custom_links: CustomLink[]
}

export interface SocialLink {
  id: string
  business_card_id: string
  platform: string
  url: string
  username: string | null
  sort_order: number
  is_visible: boolean
}

export interface CustomLink {
  id: string
  business_card_id: string
  title: string
  url: string
  icon: string | null
  sort_order: number
  is_visible: boolean
}

export interface CardView {
  id: string
  business_card_id: string
  timestamp: string
  device_type: string | null
  browser: string | null
  browser_version: string | null
  os: string | null
  os_version: string | null
  country: string | null
  country_code: string | null
  region: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  ip_address: string | null
  referrer: string | null
  user_agent: string | null
}

export interface LinkClick {
  id: string
  business_card_id: string
  link_type: 'social' | 'custom' | 'vcard' | 'calendar'
  link_id: string | null
  platform: string | null
  timestamp: string
  device_type: string | null
  country: string | null
}

export interface ContactRequest {
  id: string
  business_card_id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  message: string | null
  timestamp: string
  is_read: boolean
  country: string | null
  device_type: string | null
}
