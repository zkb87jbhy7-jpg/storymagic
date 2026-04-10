-- Migration: Create children_profiles table
-- StoryMagic - Child profiles linked to user accounts

CREATE TABLE children_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(30) CHECK (gender IN ('boy', 'girl', 'prefer_not_to_say')),
    birth_date DATE,
    physical_traits JSONB DEFAULT '{}'::jsonb,
    -- Structure: {wheelchair: bool, glasses: bool, hearing_aid: bool,
    --             skin_tone: str, hair_color: str, hair_style: str,
    --             custom_notes: str}
    preferences JSONB DEFAULT '{}'::jsonb,
    -- Structure: {family_structure: str, cultural_prefs: [str],
    --             accessibility_needs: [str], reading_prefs: [str],
    --             dietary_restrictions: [str], modesty_concerns: bool,
    --             holiday_preferences: [str], pronouns: str}
    face_embedding_ref VARCHAR(255),
    character_sheet_urls JSONB,
    -- Structure: {front: url, profile: url, three_quarter: url, back: url}
    photos_expiry_date TIMESTAMPTZ,
    photos_count INT DEFAULT 0,
    face_processing_status VARCHAR(20) DEFAULT 'pending'
        CHECK (face_processing_status IN
            ('pending', 'processing', 'ready', 'failed', 'expired')),
    face_embedding_expiry TIMESTAMPTZ,
    -- Auto-delete after 12 months of inactivity per COPPA 2025
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_children_user ON children_profiles(user_id);

CREATE TRIGGER update_children_profiles_updated_at
    BEFORE UPDATE ON children_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
