-- Migration: Create user_drafts table
-- StoryMagic - Auto-saved user drafts for book creation flows

CREATE TABLE user_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    draft_type VARCHAR(30) NOT NULL,
    step INT,
    data JSONB NOT NULL,
    expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drafts_user ON user_drafts(user_id, draft_type);
