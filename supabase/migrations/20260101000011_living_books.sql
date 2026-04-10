-- Migration: Create living_books table
-- StoryMagic - Living Books that grow with the child over time

CREATE TABLE living_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initial_book_id UUID NOT NULL REFERENCES generated_books(id),
    child_id UUID NOT NULL REFERENCES children_profiles(id),
    user_id UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    chapters JSONB DEFAULT '[]'::jsonb,
    -- [{chapter_number: int, book_id: uuid, title: str, added_at: timestamp}]
    next_reminder_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
