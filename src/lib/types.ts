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
