"""Order schemas for creation, response, tracking, and soft-proof.

Endpoints: /api/v1/orders/*  (Chapter 8.8)
Maps to TypeScript: packages/shared-types/src/order.ts
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


# ── Enumerations ──────────────────────────────────────────────────────────────


class OrderType(StrEnum):
    DIGITAL = "digital"
    SOFTCOVER = "softcover"
    HARDCOVER = "hardcover"
    GIFT = "gift"


class PaymentStatus(StrEnum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


# ── Sub-schemas ───────────────────────────────────────────────────────────────


class PrintOptions(BaseModel):
    """Print customisation stored as JSONB."""

    cover_type: str = "softcover"
    size: str = "8.5x8.5"
    gift_wrap: bool = False
    paper_quality: str = "standard"
    quantity: int = Field(default=1, ge=1, le=100)


class ShippingAddress(BaseModel):
    """Shipping address stored as JSONB."""

    full_name: str = Field(min_length=1, max_length=200)
    street: str = Field(min_length=1, max_length=300)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(max_length=100)
    postal_code: str = Field(min_length=1, max_length=20)
    country: str = Field(min_length=2, max_length=3)
    phone: str | None = None


# ── Create ────────────────────────────────────────────────────────────────────


class OrderCreate(BaseModel):
    """POST /api/v1/orders"""

    book_id: uuid.UUID
    order_type: OrderType
    dedication_text: str | None = Field(default=None, max_length=500)
    dedication_handwritten_url: str | None = None
    print_options: PrintOptions | None = None
    shipping_address: ShippingAddress | None = None
    shipping_method: str | None = None
    currency: str = Field(default="USD", max_length=3)


# ── Response ──────────────────────────────────────────────────────────────────


class OrderResponse(BaseModel):
    """Full order representation."""

    id: uuid.UUID
    user_id: uuid.UUID
    book_id: uuid.UUID
    order_type: OrderType
    dedication_text: str | None = None
    dedication_handwritten_url: str | None = None
    print_options: PrintOptions | None = None
    payment_status: PaymentStatus
    payment_provider: str
    stripe_session_id: str | None = None
    stripe_payment_intent_id: str | None = None
    shipping_address: ShippingAddress | None = None
    shipping_method: str | None = None
    tracking_number: str | None = None
    tracking_url: str | None = None
    print_provider: str | None = None
    external_order_id: str | None = None
    estimated_delivery: datetime | None = None
    total_amount: float = Field(ge=0.0)
    currency: str
    soft_proof_url: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Tracking ──────────────────────────────────────────────────────────────────


class TrackingEvent(BaseModel):
    status: str
    location: str | None = None
    timestamp: datetime
    description: str | None = None


class TrackingResponse(BaseModel):
    """GET /api/v1/orders/{id}/tracking"""

    order_id: uuid.UUID
    tracking_number: str | None = None
    tracking_url: str | None = None
    carrier: str | None = None
    estimated_delivery: datetime | None = None
    events: list[TrackingEvent] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# ── Soft Proof ────────────────────────────────────────────────────────────────


class SoftProofResponse(BaseModel):
    """GET /api/v1/orders/{id}/soft-proof — CMYK soft-proof preview."""

    order_id: uuid.UUID
    soft_proof_url: str
    pages: list[str] = Field(
        default_factory=list,
        description="Per-page CMYK preview URLs",
    )
    color_profile: str = "FOGRA39"
    approval_required: bool = True

    model_config = ConfigDict(from_attributes=True)


class ApproveProofRequest(BaseModel):
    """POST /api/v1/orders/{id}/approve-proof"""

    approved: bool = True
    notes: str | None = Field(default=None, max_length=1000)
