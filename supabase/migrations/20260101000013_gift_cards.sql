-- Migration: Create gift_cards table
-- StoryMagic - Gift card purchases and redemptions

CREATE TABLE gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchaser_id UUID NOT NULL REFERENCES users(id),
    recipient_email VARCHAR(255),
    recipient_name VARCHAR(255),
    gift_type VARCHAR(20)
        CHECK (gift_type IN ('digital', 'print', 'experience')),
    gift_message TEXT,
    delivery_date DATE,
    redeem_code VARCHAR(12) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'purchased'
        CHECK (status IN ('purchased', 'delivered', 'redeemed', 'expired')),
    stripe_payment_id VARCHAR(255),
    credits JSONB,
    -- {digital_books: int, print_books: int}
    redeemed_by_user_id UUID,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gifts_code ON gift_cards(redeem_code);
