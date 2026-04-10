-- Migration: Create orders table
-- StoryMagic - Print and digital book orders

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    book_id UUID NOT NULL REFERENCES generated_books(id),
    order_type VARCHAR(20) NOT NULL
        CHECK (order_type IN ('digital', 'softcover', 'hardcover', 'gift')),
    dedication_text TEXT,
    dedication_handwritten_url VARCHAR(500),
    print_options JSONB,
    -- {cover_type: str, size: str, gift_wrap: bool,
    --  paper_quality: str, quantity: int}
    payment_status VARCHAR(20) DEFAULT 'pending'
        CHECK (payment_status IN
            ('pending', 'paid', 'failed', 'refunded')),
    payment_provider VARCHAR(20) DEFAULT 'stripe',
    stripe_session_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    shipping_address JSONB,
    shipping_method VARCHAR(20),
    tracking_number VARCHAR(255),
    tracking_url VARCHAR(500),
    print_provider VARCHAR(20),
    external_order_id VARCHAR(255),
    estimated_delivery DATE,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ILS',
    soft_proof_url VARCHAR(500),
    -- CMYK preview for customer approval before printing
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(payment_status);
