-- Migration: Create referrals table
-- StoryMagic - Referral tracking and rewards

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id),
    referred_user_id UUID REFERENCES users(id),
    referral_code VARCHAR(8) NOT NULL,
    status VARCHAR(20) DEFAULT 'signed_up'
        CHECK (status IN ('signed_up', 'created_book', 'reward_given')),
    reward_type VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
