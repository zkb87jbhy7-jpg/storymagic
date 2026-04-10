-- Migration: Create dreams table
-- StoryMagic - Dream-to-Story feature recordings

CREATE TABLE dreams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    child_id UUID NOT NULL REFERENCES children_profiles(id),
    transcript TEXT NOT NULL,
    emotion VARCHAR(30),
    emotion_intensity DECIMAL(3,1),
    illustration_url VARCHAR(500),
    book_id UUID REFERENCES generated_books(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
