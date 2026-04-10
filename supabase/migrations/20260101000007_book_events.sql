-- Migration: Create book_events table (append-only, partitioned by month)
-- StoryMagic - Event log for book generation pipeline (CQRS pattern)

CREATE TABLE book_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    agent_name VARCHAR(50),
    payload JSONB,
    quality_score DECIMAL(5,2),
    latency_ms INT,
    provider_id VARCHAR(50),
    prompt_version_id UUID,
    error_details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions for 2026
CREATE TABLE book_events_2026_01 PARTITION OF book_events
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE book_events_2026_02 PARTITION OF book_events
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE book_events_2026_03 PARTITION OF book_events
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE book_events_2026_04 PARTITION OF book_events
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE book_events_2026_05 PARTITION OF book_events
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE book_events_2026_06 PARTITION OF book_events
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE book_events_2026_07 PARTITION OF book_events
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE book_events_2026_08 PARTITION OF book_events
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE book_events_2026_09 PARTITION OF book_events
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE book_events_2026_10 PARTITION OF book_events
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE book_events_2026_11 PARTITION OF book_events
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE book_events_2026_12 PARTITION OF book_events
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

CREATE INDEX idx_events_book ON book_events(book_id);
CREATE INDEX idx_events_type ON book_events(event_type);
CREATE INDEX idx_events_timestamp ON book_events(timestamp);
