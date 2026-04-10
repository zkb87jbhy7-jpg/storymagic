-- Migration: Create abuse_reports table
-- StoryMagic - Content abuse reporting and moderation

CREATE TABLE abuse_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_user_id UUID REFERENCES users(id),
    reported_template_id UUID REFERENCES story_templates(id),
    reported_book_id UUID REFERENCES generated_books(id),
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
