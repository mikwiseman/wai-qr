-- Migration: Add Business Cards Feature
-- Creates tables for digital business cards, social links, custom links,
-- card views analytics, link clicks, and contact requests

-- Business Cards table
CREATE TABLE IF NOT EXISTS business_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    short_code VARCHAR(20) UNIQUE NOT NULL,

    -- Profile Info
    display_name VARCHAR(255) NOT NULL,
    headline VARCHAR(255),
    bio TEXT,
    avatar_url VARCHAR(500),
    cover_image_url VARCHAR(500),

    -- Contact Info (for vCard)
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(500),
    company VARCHAR(255),
    job_title VARCHAR(255),
    location VARCHAR(255),

    -- Theme
    theme_color VARCHAR(20) DEFAULT '#8B5CF6',
    theme_style VARCHAR(50) DEFAULT 'modern',

    -- Calendar Integration
    calendar_url VARCHAR(500),
    calendar_embed BOOLEAN DEFAULT false,

    -- Settings
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    show_vcard_download BOOLEAN DEFAULT true,
    show_contact_form BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Links table
CREATE TABLE IF NOT EXISTS social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_card_id UUID NOT NULL REFERENCES business_cards(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    username VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true
);

-- Custom Links table
CREATE TABLE IF NOT EXISTS custom_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_card_id UUID NOT NULL REFERENCES business_cards(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true
);

-- Card Views analytics table
CREATE TABLE IF NOT EXISTS card_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_card_id UUID NOT NULL REFERENCES business_cards(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Device Info
    device_type VARCHAR(50),
    browser VARCHAR(100),
    browser_version VARCHAR(50),
    os VARCHAR(100),
    os_version VARCHAR(50),

    -- Location Info
    country VARCHAR(100),
    country_code VARCHAR(10),
    region VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Request Info
    ip_address VARCHAR(50),
    referrer VARCHAR(500),
    user_agent TEXT
);

-- Link Clicks table
CREATE TABLE IF NOT EXISTS link_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_card_id UUID NOT NULL REFERENCES business_cards(id) ON DELETE CASCADE,
    link_type VARCHAR(20) NOT NULL,
    link_id UUID,
    platform VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Minimal analytics
    device_type VARCHAR(50),
    country VARCHAR(100)
);

-- Contact Requests table (two-way exchange)
CREATE TABLE IF NOT EXISTS contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_card_id UUID NOT NULL REFERENCES business_cards(id) ON DELETE CASCADE,

    -- Visitor contact info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    message TEXT,

    -- Metadata
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false,

    -- Analytics
    country VARCHAR(100),
    device_type VARCHAR(50)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_cards_short_code ON business_cards(short_code);
CREATE INDEX IF NOT EXISTS idx_business_cards_user_id ON business_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_business_card_id ON social_links(business_card_id);
CREATE INDEX IF NOT EXISTS idx_custom_links_business_card_id ON custom_links(business_card_id);
CREATE INDEX IF NOT EXISTS idx_card_views_business_card_id ON card_views(business_card_id);
CREATE INDEX IF NOT EXISTS idx_card_views_timestamp ON card_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_link_clicks_business_card_id ON link_clicks(business_card_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_timestamp ON link_clicks(timestamp);
CREATE INDEX IF NOT EXISTS idx_contact_requests_business_card_id ON contact_requests(business_card_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_timestamp ON contact_requests(timestamp);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_business_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_business_cards_updated_at ON business_cards;
CREATE TRIGGER trigger_business_cards_updated_at
    BEFORE UPDATE ON business_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_business_cards_updated_at();
