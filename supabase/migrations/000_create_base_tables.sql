-- Migration: Create base tables (run this FIRST if tables were dropped)
-- Run this in your Supabase SQL Editor

-- 1. Create qr_codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code VARCHAR(20) UNIQUE NOT NULL,
  destination_url TEXT NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id),
  center_image_type VARCHAR(20) DEFAULT 'default',
  center_image_ref VARCHAR(255)
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_qr_codes_short_code ON qr_codes(short_code);
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);

-- 3. Enable RLS on qr_codes
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for qr_codes
DROP POLICY IF EXISTS "Users can view own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Users can insert own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Users can update own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Users can delete own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Anyone can view QR codes for redirect" ON qr_codes;

CREATE POLICY "Users can view own QR codes" ON qr_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own QR codes" ON qr_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own QR codes" ON qr_codes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own QR codes" ON qr_codes
  FOR DELETE USING (auth.uid() = user_id);

-- Allow public access to QR codes for redirect functionality
CREATE POLICY "Anyone can view QR codes for redirect" ON qr_codes
  FOR SELECT USING (true);
