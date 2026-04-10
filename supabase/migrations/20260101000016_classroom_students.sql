-- Migration: Create classroom_students table
-- StoryMagic - Students within classrooms with parental consent tracking

CREATE TABLE classroom_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    age INT,
    consent_status VARCHAR(20) DEFAULT 'pending'
        CHECK (consent_status IN ('pending', 'consented', 'opted_out')),
    consent_parent_email VARCHAR(255),
    consent_token VARCHAR(255) UNIQUE,
    consent_date TIMESTAMPTZ,
    has_photos BOOLEAN DEFAULT false,
    face_embedding_ref VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
