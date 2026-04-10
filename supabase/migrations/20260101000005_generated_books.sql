-- Migration: Create generated_books table
-- StoryMagic - AI-generated personalized books

CREATE TABLE generated_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_profile_ids UUID[] NOT NULL,
    story_template_id UUID REFERENCES story_templates(id),
    free_prompt TEXT,
    title VARCHAR(500),
    generated_story JSONB,
    -- Full story with pages including text, illustration prompts,
    -- layout data, animation presets, interactive elements,
    -- performance markup
    illustration_style VARCHAR(50),
    character_sheet_ref VARCHAR(255),
    illustrations JSONB,
    -- {page_number: {url: str, thumbnail_url: str, print_url: str}}
    voice_narration_url VARCHAR(500),
    voice_profile_id UUID,
    interactive_book_data JSONB,
    print_ready_pdf_url VARCHAR(500),
    digital_pdf_url VARCHAR(500),
    parental_guide JSONB,
    quality_scores JSONB,
    -- {overall: float, per_page: [{page: int, text_score: float,
    --  illustration_score: float, likeness_score: float}],
    --  consistency_score: float}
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'generating', 'preview',
            'approved', 'ordered', 'printing', 'shipped')),
    generation_workflow_id VARCHAR(255),
    -- Temporal.io workflow ID for tracking/debugging
    is_living_book BOOLEAN DEFAULT false,
    is_bilingual BOOLEAN DEFAULT false,
    secondary_language VARCHAR(10),
    mood_setting VARCHAR(30),
    creation_method VARCHAR(20)
        CHECK (creation_method IN
            ('free_prompt', 'template', 'co_creation', 'dream', 'remix')),
    co_creation_journey JSONB,
    book_dna_pattern VARCHAR(500),
    -- Generative visual pattern unique to this book
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_books_user ON generated_books(user_id);
CREATE INDEX idx_books_status ON generated_books(status);
