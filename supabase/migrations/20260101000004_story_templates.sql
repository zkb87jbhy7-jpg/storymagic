-- Migration: Create story_templates table
-- StoryMagic - Pre-built story templates for the marketplace

CREATE TABLE story_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id),
    title VARCHAR(500) NOT NULL,
    title_he VARCHAR(500),
    description TEXT,
    description_he TEXT,
    category VARCHAR(50) NOT NULL,
    age_range_min INT DEFAULT 2,
    age_range_max INT DEFAULT 10,
    language VARCHAR(10) DEFAULT 'he',
    is_rhyming BOOLEAN DEFAULT false,
    scene_definitions JSONB NOT NULL,
    -- Array of scenes with text, illustration hints, animation presets,
    -- interactive elements, and placeholder markers
    cover_image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'review', 'published', 'suspended')),
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    purchase_count INT DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0,
    seo_metadata JSONB DEFAULT '{}'::jsonb,
    -- Structure: {title: str, description: str, tags: [str],
    --             og_image: str, structured_data: json}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON story_templates(category);
CREATE INDEX idx_templates_status ON story_templates(status);
CREATE INDEX idx_templates_creator ON story_templates(creator_id);
