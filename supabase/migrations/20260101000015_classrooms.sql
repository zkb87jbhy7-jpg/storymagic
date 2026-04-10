-- Migration: Create classrooms table
-- StoryMagic - Classroom/school edition support

CREATE TABLE classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_user_id UUID NOT NULL REFERENCES users(id),
    school_name VARCHAR(255),
    grade_name VARCHAR(100),
    student_count INT,
    subscription_tier VARCHAR(20) DEFAULT 'free'
        CHECK (subscription_tier IN ('free', 'school', 'district')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
