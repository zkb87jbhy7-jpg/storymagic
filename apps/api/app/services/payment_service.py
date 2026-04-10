"""Payment service — Stripe checkout, webhooks, and subscription billing.

Wraps Stripe API for one-time book purchases, subscription management,
webhook handling, and customer portal access.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.models.order import Order
from app.models.subscription import Subscription
from app.models.user import User

# Stripe price IDs mapped per order type (configured in Stripe dashboard)
_STRIPE_PRICE_IDS: dict[str, str] = {
    "digital": "price_digital_placeholder",
    "softcover": "price_softcover_placeholder",
    "hardcover": "price_hardcover_placeholder",
    "gift": "price_gift_placeholder",
}

_SUBSCRIPTION_PRICE_IDS: dict[str, str] = {
    "monthly": "price_monthly_placeholder",
    "yearly": "price_yearly_placeholder",
}


class PaymentService:
    """Business logic for Stripe payment integration."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._settings: Settings = get_settings()

    async def create_checkout_session(
        self,
        *,
        user_id: uuid.UUID,
        order_id: uuid.UUID,
        success_url: str,
        cancel_url: str,
    ) -> dict[str, Any]:
        """Create a Stripe Checkout Session for a one-time book purchase.

        Args:
            user_id: UUID of the paying user.
            order_id: UUID of the order to pay for.
            success_url: URL to redirect on successful payment.
            cancel_url: URL to redirect on cancellation.

        Returns:
            Dictionary with ``checkout_url`` and ``session_id``.

        Raises:
            HTTPException: 404 if the order is not found.
            HTTPException: 403 if the order does not belong to *user_id*.
            HTTPException: 400 if the order is already paid.
        """
        stmt = select(Order).where(Order.id == order_id)
        result = await self._db.execute(stmt)
        order: Order | None = result.scalar_one_or_none()

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found",
            )
        if order.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this order",
            )
        if order.payment_status == "paid":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order is already paid",
            )

        price_id = _STRIPE_PRICE_IDS.get(order.order_type, "price_digital_placeholder")

        # TODO: Replace with actual Stripe API call:
        # import stripe
        # stripe.api_key = self._settings.stripe_secret_key
        # session = stripe.checkout.Session.create(
        #     mode="payment",
        #     line_items=[{"price": price_id, "quantity": 1}],
        #     success_url=success_url,
        #     cancel_url=cancel_url,
        #     metadata={"order_id": str(order_id), "user_id": str(user_id)},
        #     client_reference_id=str(user_id),
        # )

        # Placeholder response
        placeholder_session_id = f"cs_placeholder_{uuid.uuid4().hex[:16]}"
        order.stripe_session_id = placeholder_session_id
        await self._db.flush()

        return {
            "checkout_url": f"https://checkout.stripe.com/pay/{placeholder_session_id}",
            "session_id": placeholder_session_id,
        }

    async def handle_webhook(
        self,
        *,
        payload: bytes,
        signature: str,
    ) -> dict[str, Any]:
        """Process a Stripe webhook event for one-time payments.

        Verifies the webhook signature using the configured secret,
        then updates the order payment status accordingly.

        Args:
            payload: Raw request body from Stripe.
            signature: Value of the ``Stripe-Signature`` header.

        Returns:
            Dictionary with ``event_type`` and ``handled`` flag.

        Raises:
            HTTPException: 400 if signature verification fails.
        """
        # TODO: Replace with actual Stripe webhook verification:
        # import stripe
        # try:
        #     event = stripe.Webhook.construct_event(
        #         payload, signature, self._settings.stripe_webhook_secret
        #     )
        # except stripe.error.SignatureVerificationError:
        #     raise HTTPException(status_code=400, detail="Invalid signature")

        # Placeholder: parse event type from payload
        # In production this would handle:
        # - checkout.session.completed -> mark order paid
        # - payment_intent.payment_failed -> mark order failed
        # - charge.refunded -> mark order refunded

        return {
            "event_type": "placeholder",
            "handled": True,
            "message": "Webhook processing not yet implemented",
        }

    async def create_subscription_checkout(
        self,
        *,
        user_id: uuid.UUID,
        tier: str,
        success_url: str,
        cancel_url: str,
    ) -> dict[str, Any]:
        """Create a Stripe Checkout Session for a subscription.

        Args:
            user_id: UUID of the subscribing user.
            tier: Subscription tier — ``"monthly"`` or ``"yearly"``.
            success_url: URL to redirect on successful subscription.
            cancel_url: URL to redirect on cancellation.

        Returns:
            Dictionary with ``checkout_url`` and ``session_id``.

        Raises:
            HTTPException: 400 if *tier* is invalid or user already
                has an active subscription at this tier.
        """
        if tier not in _SUBSCRIPTION_PRICE_IDS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid tier. Must be one of: {sorted(_SUBSCRIPTION_PRICE_IDS.keys())}",
            )

        # Check for existing active subscription
        stmt = (
            select(Subscription)
            .where(Subscription.user_id == user_id)
            .where(Subscription.status == "active")
        )
        result = await self._db.execute(stmt)
        existing: Subscription | None = result.scalar_one_or_none()

        if existing and existing.tier == tier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"You already have an active {tier} subscription",
            )

        price_id = _SUBSCRIPTION_PRICE_IDS[tier]

        # TODO: Replace with actual Stripe API call:
        # session = stripe.checkout.Session.create(
        #     mode="subscription",
        #     line_items=[{"price": price_id, "quantity": 1}],
        #     success_url=success_url,
        #     cancel_url=cancel_url,
        #     metadata={"user_id": str(user_id), "tier": tier},
        #     client_reference_id=str(user_id),
        # )

        placeholder_session_id = f"cs_sub_placeholder_{uuid.uuid4().hex[:16]}"

        return {
            "checkout_url": f"https://checkout.stripe.com/pay/{placeholder_session_id}",
            "session_id": placeholder_session_id,
        }

    async def handle_subscription_webhook(
        self,
        *,
        payload: bytes,
        signature: str,
    ) -> dict[str, Any]:
        """Process Stripe webhook events for subscriptions.

        Handles subscription lifecycle events including creation,
        renewal, cancellation, and payment failures.

        Args:
            payload: Raw request body from Stripe.
            signature: Value of the ``Stripe-Signature`` header.

        Returns:
            Dictionary with ``event_type`` and ``handled`` flag.

        Raises:
            HTTPException: 400 if signature verification fails.
        """
        # TODO: Replace with actual Stripe webhook verification.
        # Events to handle:
        # - customer.subscription.created -> create Subscription record
        # - customer.subscription.updated -> update tier/status/period
        # - customer.subscription.deleted -> cancel subscription
        # - invoice.payment_succeeded -> reset books_remaining
        # - invoice.payment_failed -> set status to 'past_due'

        return {
            "event_type": "placeholder",
            "handled": True,
            "message": "Subscription webhook processing not yet implemented",
        }

    async def create_customer_portal(
        self,
        *,
        user_id: uuid.UUID,
        return_url: str,
    ) -> dict[str, Any]:
        """Generate a Stripe Customer Portal URL for subscription management.

        The portal allows the customer to update payment methods,
        change subscription tier, or cancel.

        Args:
            user_id: UUID of the user.
            return_url: URL to redirect back to after portal interaction.

        Returns:
            Dictionary with ``portal_url``.

        Raises:
            HTTPException: 404 if the user has no active subscription.
        """
        stmt = (
            select(Subscription)
            .where(Subscription.user_id == user_id)
            .where(Subscription.status.in_(["active", "past_due"]))
        )
        result = await self._db.execute(stmt)
        subscription: Subscription | None = result.scalar_one_or_none()

        if subscription is None or not subscription.stripe_customer_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active subscription found for this user",
            )

        # TODO: Replace with actual Stripe API call:
        # session = stripe.billing_portal.Session.create(
        #     customer=subscription.stripe_customer_id,
        #     return_url=return_url,
        # )
        # return {"portal_url": session.url}

        placeholder_portal_id = f"bps_placeholder_{uuid.uuid4().hex[:16]}"

        return {
            "portal_url": f"https://billing.stripe.com/p/{placeholder_portal_id}",
        }
