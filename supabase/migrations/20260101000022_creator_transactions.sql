-- Migration: Create creator_transactions table
-- StoryMagic - Creator marketplace revenue tracking

CREATE TABLE creator_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES story_templates(id),
    creator_id UUID NOT NULL REFERENCES creators(id),
    user_id UUID NOT NULL REFERENCES users(id),
    book_id UUID NOT NULL REFERENCES generated_books(id),
    total_amount DECIMAL(10,2),
    creator_share DECIMAL(10,2),
    platform_share DECIMAL(10,2),
    payout_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
