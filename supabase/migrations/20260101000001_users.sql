-- Migration: Create users table
-- StoryMagic - Core user accounts
-- Spec ref: Ch7.2

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    language_preference VARCHAR(10) DEFAULT 'he',
    currency_preference VARCHAR(3) DEFAULT 'ILS',
    subscription_tier VARCHAR(20) DEFAULT 'free'
        CHECK (subscription_tier IN ('free', 'monthly', 'yearly')),
    accessibility_prefs JSONB DEFAULT '{}'::jsonb,
    -- Structure: {dyslexia_mode: bool, adhd_mode: bool, autism_mode: bool,
    --             font_size: "normal"|"large"|"xl", high_contrast: bool,
    --             reduced_motion: bool}
    onboarding_type VARCHAR(20) DEFAULT 'guided'
        CHECK (onboarding_type IN ('quick', 'creative', 'guided')),
    is_admin BOOLEAN DEFAULT false,
    encryption_key_ref VARCHAR(255) NOT NULL DEFAULT 'pending',
    referral_code VARCHAR(8) UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
    referred_by VARCHAR(8),
    timezone VARCHAR(50) DEFAULT 'Asia/Jerusalem',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);

-- Reusable trigger function for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
