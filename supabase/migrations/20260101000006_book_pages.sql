-- Migration: Create book_pages table
-- StoryMagic - Individual pages within generated books

CREATE TABLE book_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES generated_books(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    text_primary TEXT NOT NULL,
    text_secondary TEXT,
    illustration_url VARCHAR(500),
    illustration_thumbnail_url VARCHAR(500),
    illustration_print_url VARCHAR(500),
    illustration_prompt TEXT,
    illustration_negative_prompt TEXT,
    layout_type VARCHAR(50),
    animation_preset VARCHAR(30),
    interactive_elements JSONB,
    -- [{type: "tappable", position: {x,y,w,h}, content: str,
    --   sound_effect: str}]
    performance_markup JSONB,
    -- {speaker: str, emotion: str, pace: str, pause_before: int,
    --  pause_after: int, emphasized_words: [int], sound_effect: str}
    alt_text TEXT,
    alt_text_secondary TEXT,
    fun_facts JSONB,
    reading_buddy_question JSONB,
    -- {question: str, type: "pointing"|"prediction"|"analytical",
    --  answer_hint: str}
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(book_id, page_number)
);

CREATE INDEX idx_pages_book ON book_pages(book_id);
