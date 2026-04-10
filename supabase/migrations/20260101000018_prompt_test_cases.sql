-- Migration: Create prompt_test_cases table
-- StoryMagic - Test cases for AI prompt quality validation

CREATE TABLE prompt_test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_key VARCHAR(100) NOT NULL,
    input_variables JSONB NOT NULL,
    expected_traits VARCHAR(100)[] NOT NULL,
    -- ['contains_child_name', 'age_appropriate', 'safe_content',
    --  'has_moral_lesson', 'rhymes_if_requested', 'consistent_pronouns',
    --  'complete_arc']
    created_at TIMESTAMPTZ DEFAULT NOW()
);
