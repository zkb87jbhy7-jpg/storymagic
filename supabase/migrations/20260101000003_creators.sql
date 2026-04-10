-- Migration: Create creators table
-- StoryMagic - Creator marketplace accounts

CREATE TABLE creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    display_name VARCHAR(255) NOT NULL,
    bio TEXT,
    bio_he TEXT,
    avatar_url VARCHAR(500),
    portfolio_links VARCHAR(500)[],
    revenue_share_percent INT DEFAULT 70,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    pending_payout DECIMAL(10,2) DEFAULT 0,
    stripe_connect_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
