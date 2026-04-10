-- Migration: Create voice_profiles table
-- StoryMagic - Voice presets and family voice clones

CREATE TABLE voice_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('preset', 'family')),
    family_role VARCHAR(30),
    language VARCHAR(10),
    gender VARCHAR(20),
    age_range VARCHAR(20),
    preview_audio_url VARCHAR(500),
    original_recording_url VARCHAR(500),
    clone_status VARCHAR(20)
        CHECK (clone_status IN ('processing', 'ready', 'failed')),
    provider VARCHAR(30),
    provider_voice_id VARCHAR(255),
    quality_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
