-- Migration: Create prompt_versions table
-- StoryMagic - Versioned AI prompt management with A/B testing

CREATE TABLE prompt_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_key VARCHAR(100) NOT NULL,
    -- e.g., "story-architect-system", "hebrew-poet-system"
    version INT NOT NULL,
    content TEXT NOT NULL,
    variables VARCHAR(100)[],
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'testing', 'active', 'retired')),
    test_results JSONB,
    -- {pass_rate: float, avg_quality_score: float,
    --  acceptance_rate: float, last_tested_at: timestamp}
    ab_test_traffic_percent INT DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(prompt_key, version)
);

CREATE INDEX idx_prompts_key_status ON prompt_versions(prompt_key, status);
