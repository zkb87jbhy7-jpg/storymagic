"""Subscription endpoints.

Spec ref: Ch8.10 - Subscription Endpoints
  POST /api/v1/subscriptions/create-checkout — Create Stripe Checkout session
  POST /api/v1/subscriptions/portal — Create Stripe Customer Portal session
  POST /api/v1/subscriptions/webhook — Stripe webhook handler
  GET  /api/v1/subscriptions/status — Current subscription status
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from pydantic import BaseModel, Field

from app.dependencies import get_current_user

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


# ── Request / Response Schemas (inline) ───────────────────────────────────


class SubscriptionCheckoutRequest(BaseModel):
    """POST /api/v1/subscriptions/create-checkout"""
    plan: str = Field(description="'monthly' or 'yearly'")
    success_url: str
    cancel_url: str


class SubscriptionCheckoutResponse(BaseModel):
    """Stripe Checkout session response."""
    checkout_url: str
    session_id: str


class SubscriptionPortalRequest(BaseModel):
    """POST /api/v1/subscriptions/portal"""
    return_url: str


class SubscriptionPortalResponse(BaseModel):
    """Stripe Customer Portal session response."""
    portal_url: str


class SubscriptionStatusResponse(BaseModel):
    """Current subscription status."""
    user_id: uuid.UUID
    plan: str  # free, monthly, yearly
    status: str  # active, past_due, cancelled, trialing
    books_remaining: int
    books_used_this_period: int
    books_limit: int
    current_period_start: datetime | None = None
    current_period_end: datetime | None = None
    cancel_at_period_end: bool = False
    stripe_customer_id: str | None = None


# ── POST /subscriptions/create-checkout ──────────────────────────────────


@router.post(
    "/create-checkout",
    response_model=SubscriptionCheckoutResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create subscription checkout session",
)
async def create_checkout(
    body: SubscriptionCheckoutRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> SubscriptionCheckoutResponse:
    """Create a Stripe Checkout session for subscription.

    Spec ref: Ch8.10 — POST /api/v1/subscriptions/create-checkout
    """
    # Placeholder: In production, create a Stripe Checkout Session.
    # import stripe
    # session = stripe.checkout.Session.create(...)
    return SubscriptionCheckoutResponse(
        checkout_url=f"https://checkout.stripe.com/placeholder/{uuid.uuid4()}",
        session_id=f"cs_{uuid.uuid4().hex[:24]}",
    )


# ── POST /subscriptions/portal ───────────────────────────────────────────


@router.post(
    "/portal",
    response_model=SubscriptionPortalResponse,
    summary="Create customer portal session",
)
async def create_portal(
    body: SubscriptionPortalRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> SubscriptionPortalResponse:
    """Create a Stripe Customer Portal session for subscription management.

    Spec ref: Ch8.10 — POST /api/v1/subscriptions/portal
    """
    # Placeholder: In production, create a Stripe billing portal session.
    # import stripe
    # session = stripe.billing_portal.Session.create(...)
    return SubscriptionPortalResponse(
        portal_url=f"https://billing.stripe.com/placeholder/{uuid.uuid4()}",
    )


# ── POST /subscriptions/webhook ──────────────────────────────────────────


@router.post(
    "/webhook",
    status_code=status.HTTP_200_OK,
    summary="Stripe subscription webhook",
)
async def subscription_webhook(
    request: Request,
    stripe_signature: str | None = Header(default=None, alias="stripe-signature"),
) -> dict[str, str]:
    """Handle Stripe webhook events for subscription lifecycle.

    Spec ref: Ch8.10 — POST /api/v1/subscriptions/webhook
    No auth required — verified via Stripe signature.
    """
    body = await request.body()

    if not stripe_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature header",
        )

    # Placeholder: In production, verify the webhook signature:
    # import stripe
    # event = stripe.Webhook.construct_event(body, stripe_signature, webhook_secret)
    #
    # Handle events like:
    #   customer.subscription.created
    #   customer.subscription.updated
    #   customer.subscription.deleted
    #   invoice.payment_succeeded
    #   invoice.payment_failed

    return {"status": "received"}


# ── GET /subscriptions/status ─────────────────────────────────────────────


@router.get(
    "/status",
    response_model=SubscriptionStatusResponse,
    summary="Get subscription status",
)
async def get_subscription_status(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> SubscriptionStatusResponse:
    """Get the current subscription status including books remaining.

    Spec ref: Ch8.10 — GET /api/v1/subscriptions/status
    """
    # Placeholder: In production, query subscription from DB and Stripe.
    return SubscriptionStatusResponse(
        user_id=uuid.UUID(str(current_user["id"])),
        plan="free",
        status="active",
        books_remaining=1,
        books_used_this_period=0,
        books_limit=1,
        current_period_start=None,
        current_period_end=None,
        cancel_at_period_end=False,
        stripe_customer_id=None,
    )
