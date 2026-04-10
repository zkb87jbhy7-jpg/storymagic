"""Subscription and payment schemas.

Endpoints: /api/v1/subscriptions/*, /api/v1/payments/*  (Chapters 8.10 & 8.11)
Maps to TypeScript: packages/shared-types/src/subscription.ts
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


# ── Enumerations ──────────────────────────────────────────────────────────────


class SubscriptionPlanTier(StrEnum):
    MONTHLY = "monthly"
    YEARLY = "yearly"


class SubscriptionStatus(StrEnum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    PAST_DUE = "past_due"
    PAUSED = "paused"


class WebhookEventType(StrEnum):
    """Stripe webhook event types we handle."""

    CHECKOUT_COMPLETED = "checkout.session.completed"
    SUBSCRIPTION_UPDATED = "customer.subscription.updated"
    SUBSCRIPTION_DELETED = "customer.subscription.deleted"
    INVOICE_PAID = "invoice.paid"
    INVOICE_PAYMENT_FAILED = "invoice.payment_failed"
    PAYMENT_INTENT_SUCCEEDED = "payment_intent.succeeded"
    PAYMENT_INTENT_FAILED = "payment_intent.payment_failed"


# ── Checkout ──────────────────────────────────────────────────────────────────


class CheckoutRequest(BaseModel):
    """POST /api/v1/subscriptions/create-checkout"""

    tier: SubscriptionPlanTier
    success_url: str = Field(max_length=2000)
    cancel_url: str = Field(max_length=2000)


class CheckoutResponse(BaseModel):
    """Returned by create-checkout — redirects user to Stripe."""

    checkout_url: str
    session_id: str

    model_config = ConfigDict(from_attributes=True)


# ── Payment Checkout (one-time purchases) ─────────────────────────────────────


class PaymentCheckoutRequest(BaseModel):
    """POST /api/v1/payments/create-checkout"""

    book_id: uuid.UUID
    order_type: str = "digital"
    success_url: str = Field(max_length=2000)
    cancel_url: str = Field(max_length=2000)
    currency: str = Field(default="USD", max_length=3)


class PaymentCheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str

    model_config = ConfigDict(from_attributes=True)


# ── Subscription Status ──────────────────────────────────────────────────────


class SubscriptionStatusResponse(BaseModel):
    """GET /api/v1/subscriptions/status"""

    id: uuid.UUID
    user_id: uuid.UUID
    tier: SubscriptionPlanTier
    status: SubscriptionStatus
    current_period_start: datetime | None = None
    current_period_end: datetime | None = None
    books_remaining_this_period: int = Field(ge=0)
    books_cap_per_period: int = Field(ge=0)
    free_prints_remaining: int = Field(ge=0)
    stripe_subscription_id: str | None = None
    stripe_customer_id: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Portal ────────────────────────────────────────────────────────────────────


class PortalRequest(BaseModel):
    """POST /api/v1/subscriptions/portal"""

    return_url: str = Field(max_length=2000)


class PortalResponse(BaseModel):
    portal_url: str

    model_config = ConfigDict(from_attributes=True)


# ── Webhook ───────────────────────────────────────────────────────────────────


class WebhookPayload(BaseModel):
    """POST /api/v1/subscriptions/webhook and /api/v1/payments/webhook

    The raw Stripe event is verified via signature; this schema represents
    our parsed internal representation.
    """

    event_id: str
    event_type: str  # kept as str for forward compatibility with new Stripe events
    data: dict[str, object] = Field(default_factory=dict)
    created: int = Field(description="Unix timestamp from Stripe")
    livemode: bool = False
