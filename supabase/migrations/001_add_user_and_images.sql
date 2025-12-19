-- Migration: Add user ownership and custom center images
-- Run this in your Supabase SQL Editor

-- 1. Add new columns to qr_codes table
ALTER TABLE qr_codes
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS center_image_type VARCHAR(20) DEFAULT 'default',
ADD COLUMN IF NOT EXISTS center_image_ref VARCHAR(255);

-- 2. Create index for user queries
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);

-- 3. Create user_images table for uploaded images
CREATE TABLE IF NOT EXISTS user_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  storage_path VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255),
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create index for user images
CREATE INDEX IF NOT EXISTS idx_user_images_user_id ON user_images(user_id);

-- 5. Create storage bucket for QR center images (run this separately in Storage settings)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('qr-center-images', 'qr-center-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- 6. Enable Row Level Security on user_images
ALTER TABLE user_images ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for user_images
CREATE POLICY "Users can view own images" ON user_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images" ON user_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON user_images
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Update RLS on qr_codes (if not already set)
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean migration)
DROP POLICY IF EXISTS "Users can view own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Users can insert own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Users can update own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Users can delete own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Anyone can view QR codes for redirect" ON qr_codes;

-- Create RLS policies for qr_codes
CREATE POLICY "Users can view own QR codes" ON qr_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own QR codes" ON qr_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own QR codes" ON qr_codes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own QR codes" ON qr_codes
  FOR DELETE USING (auth.uid() = user_id);

-- Allow public access to QR codes for redirect functionality (by short_code)
CREATE POLICY "Anyone can view QR codes for redirect" ON qr_codes
  FOR SELECT USING (true);
