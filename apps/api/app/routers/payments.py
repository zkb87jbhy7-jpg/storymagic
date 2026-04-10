"""Payment endpoints.

Spec ref: Ch8.11 - Payment Endpoints
  POST /api/v1/payments/create-checkout — Stripe Checkout for one-time purchase
  POST /api/v1/payments/webhook — Stripe webhook handler for payment events
"""

from __future__ import annotations

import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from pydantic import BaseModel, Field

from app.dependencies import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])


# ── Request / Response Schemas (inline) ───────────────────────────────────


class PaymentCheckoutRequest(BaseModel):
    """POST /api/v1/payments/create-checkout"""
    order_id: uuid.UUID
    success_url: str
    cancel_url: str
    currency: str = Field(default="USD", max_length=3)


class PaymentCheckoutResponse(BaseModel):
    """Stripe Checkout session response for one-time payment."""
    checkout_url: str
    session_id: str
    amount: float
    currency: str


# ── POST /payments/create-checkout ────────────────────────────────────────


@router.post(
    "/create-checkout",
    response_model=PaymentCheckoutResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create one-time payment checkout",
)
async def create_checkout(
    body: PaymentCheckoutRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> PaymentCheckoutResponse:
    """Create a Stripe Checkout session for a one-time purchase.

    Spec ref: Ch8.11 — POST /api/v1/payments/create-checkout
    """
    # Placeholder: In production, create a Stripe Checkout Session.
    # import stripe
    # session = stripe.checkout.Session.create(
    #     mode="payment",
    #     line_items=[...],
    #     success_url=body.success_url,
    #     cancel_url=body.cancel_url,
    # )
    return PaymentCheckoutResponse(
        checkout_url=f"https://checkout.stripe.com/placeholder/{uuid.uuid4()}",
        session_id=f"cs_{uuid.uuid4().hex[:24]}",
        amount=29.99,
        currency=body.currency,
    )


# ── POST /payments/webhook ───────────────────────────────────────────────


@router.post(
    "/webhook",
    status_code=status.HTTP_200_OK,
    summary="Stripe payment webhook",
)
async def payment_webhook(
    request: Request,
    stripe_signature: str | None = Header(default=None, alias="stripe-signature"),
) -> dict[str, str]:
    """Handle Stripe webhook events for one-time payments.

    Spec ref: Ch8.11 — POST /api/v1/payments/webhook
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
    #   checkout.session.completed
    #   payment_intent.succeeded
    #   payment_intent.payment_failed
    #   charge.refunded

    return {"status": "received"}
