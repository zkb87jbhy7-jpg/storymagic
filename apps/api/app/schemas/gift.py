"""Gift card schemas.

Endpoints: /api/v1/gifts/*  (Chapter 8.15)
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ── Enumerations ──────────────────────────────────────────────────────────────


class GiftStatus(StrEnum):
    ACTIVE = "active"
    REDEEMED = "redeemed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class GiftType(StrEnum):
    DIGITAL = "digital"
    PRINT = "print"
    SUBSCRIPTION = "subscription"


# ── Purchase ──────────────────────────────────────────────────────────────────


class GiftPurchaseRequest(BaseModel):
    """POST /api/v1/gifts/purchase"""

    gift_type: GiftType
    amount: float = Field(gt=0.0, description="Gift value in the selected currency")
    currency: str = Field(default="USD", max_length=3)
    recipient_email: EmailStr | None = Field(
        default=None,
        description="If provided, a gift notification email is sent immediately",
    )
    recipient_name: str | None = Field(default=None, max_length=200)
    sender_name: str | None = Field(default=None, max_length=200)
    personal_message: str | None = Field(default=None, max_length=1000)
    scheduled_delivery: datetime | None = Field(
        default=None,
        description="Schedule the gift email for a specific date/time",
    )


# ── Redeem ────────────────────────────────────────────────────────────────────


class GiftRedeemRequest(BaseModel):
    """POST /api/v1/gifts/redeem/{code}"""

    code: str = Field(min_length=6, max_length=50)


# ── Response ──────────────────────────────────────────────────────────────────


class GiftResponse(BaseModel):
    """Returned by purchase, validate, and redeem endpoints."""

    id: uuid.UUID
    code: str
    gift_type: GiftType
    amount: float
    currency: str
    status: GiftStatus
    purchaser_id: uuid.UUID
    recipient_email: str | None = None
    recipient_name: str | None = None
    sender_name: str | None = None
    personal_message: str | None = None
    redeemed_by: uuid.UUID | None = None
    redeemed_at: datetime | None = None
    expires_at: datetime | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
