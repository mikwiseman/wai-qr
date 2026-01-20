-- Migration: Create scans table for analytics
-- Run this in your Supabase SQL Editor

-- 1. Create the scans table
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  browser_version VARCHAR(50),
  os VARCHAR(100),
  os_version VARCHAR(50),
  ip_address VARCHAR(45),
  country VARCHAR(100),
  country_code VARCHAR(10),
  region VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  referrer TEXT,
  user_agent TEXT
);

-- 2. Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_scans_qr_code_id ON scans(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_scans_timestamp ON scans(timestamp);
CREATE INDEX IF NOT EXISTS idx_scans_qr_code_timestamp ON scans(qr_code_id, timestamp DESC);

-- 3. Enable Row Level Security
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for scans
-- Allow inserting scans from anyone (for tracking QR code scans)
DROP POLICY IF EXISTS "Anyone can insert scans" ON scans;
CREATE POLICY "Anyone can insert scans" ON scans
  FOR INSERT WITH CHECK (true);

-- Only allow users to view scans for their own QR codes
DROP POLICY IF EXISTS "Users can view scans for own QR codes" ON scans;
CREATE POLICY "Users can view scans for own QR codes" ON scans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = scans.qr_code_id
      AND qr_codes.user_id = auth.uid()
    )
  );
