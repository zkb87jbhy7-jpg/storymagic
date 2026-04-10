-- Migration: Create subscriptions table
-- StoryMagic - User subscription management

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    tier VARCHAR(20) NOT NULL
        CHECK (tier IN ('monthly', 'yearly')),
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'cancelled', 'past_due', 'paused')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    books_remaining_this_period INT DEFAULT 0,
    books_cap_per_period INT DEFAULT 2,
    -- Monthly: 2, Yearly: 24 (to maintain margin)
    free_prints_remaining INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subs_user ON subscriptions(user_id);
CREATE INDEX idx_subs_status ON subscriptions(status);
