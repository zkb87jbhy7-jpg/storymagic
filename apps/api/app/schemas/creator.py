"""Creator marketplace schemas for template creators and revenue sharing.

Endpoints: /api/v1/creators/*  (Chapter 8.12)
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .template import SceneDefinition, SEOMetadata, TemplateStatus


# ── Enumerations ──────────────────────────────────────────────────────────────


class CreatorStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class PayoutStatus(StrEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ── Application ───────────────────────────────────────────────────────────────


class CreatorApply(BaseModel):
    """POST /api/v1/creators/apply"""

    display_name: str = Field(min_length=1, max_length=200)
    bio: str | None = Field(default=None, max_length=2000)
    portfolio_url: str | None = Field(default=None, max_length=500)
    sample_template_description: str | None = Field(default=None, max_length=5000)
    contact_email: EmailStr
    languages: list[str] = Field(
        default_factory=lambda: ["en"],
        description="Languages the creator can write in",
    )
    specialties: list[str] = Field(
        default_factory=list,
        description="e.g. 'adventure', 'bedtime', 'educational'",
    )


class CreatorApplyResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    display_name: str
    status: CreatorStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Template Creation ─────────────────────────────────────────────────────────


class CreatorTemplateCreate(BaseModel):
    """POST /api/v1/creators/templates

    Same as TemplateCreate but with creator-specific context.
    """

    title: str = Field(min_length=1, max_length=200)
    title_he: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    description_he: str | None = Field(default=None, max_length=2000)
    category: str = Field(min_length=1, max_length=100)
    age_range_min: int = Field(default=2, ge=2, le=10)
    age_range_max: int = Field(default=10, ge=2, le=10)
    language: str = Field(default="en", max_length=5)
    is_rhyming: bool = False
    scene_definitions: list[SceneDefinition] = Field(min_length=1)
    cover_image_url: str | None = None
    price: float = Field(default=0.0, ge=0.0)
    seo_metadata: SEOMetadata | None = None
    tags: list[str] = Field(default_factory=list, max_length=20)


# ── Analytics ─────────────────────────────────────────────────────────────────


class TemplateAnalytics(BaseModel):
    template_id: uuid.UUID
    title: str
    status: TemplateStatus
    total_purchases: int = 0
    total_revenue: float = 0.0
    average_rating: float = 0.0
    rating_count: int = 0


class CreatorAnalytics(BaseModel):
    """GET /api/v1/creators/analytics"""

    creator_id: uuid.UUID
    display_name: str
    total_templates: int = 0
    published_templates: int = 0
    total_revenue: float = 0.0
    total_purchases: int = 0
    average_rating: float = 0.0
    pending_payout: float = 0.0
    templates: list[TemplateAnalytics] = Field(default_factory=list)
    period_start: datetime | None = None
    period_end: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


# ── Payout ────────────────────────────────────────────────────────────────────


class PayoutRequest(BaseModel):
    """POST /api/v1/creators/payout-request"""

    amount: float = Field(gt=0.0, description="Amount to withdraw")
    currency: str = Field(default="USD", max_length=3)
    payout_method: str = Field(
        default="stripe",
        description="Payment method: 'stripe', 'paypal', 'bank_transfer'",
    )
    payout_details: dict[str, str] = Field(
        default_factory=dict,
        description="Method-specific details (e.g. PayPal email, bank IBAN)",
    )


class PayoutResponse(BaseModel):
    id: uuid.UUID
    creator_id: uuid.UUID
    amount: float
    currency: str
    status: PayoutStatus
    payout_method: str
    requested_at: datetime
    processed_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
