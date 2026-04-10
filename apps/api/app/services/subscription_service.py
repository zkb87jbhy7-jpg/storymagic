"""Subscription service — plan management, book allowances, and feature gating.

Manages subscription status checks, book credit tracking, and
tier-based feature access for free, monthly, and yearly plans.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subscription import Subscription
from app.models.user import User

# Feature matrix per tier (Chapter 3.5)
_TIER_FEATURES: dict[str, dict[str, Any]] = {
    "free": {
        "digital_books_per_period": 1,
        "books_cap_per_period": 1,
        "illustration_styles": ["classic_storybook"],
        "voice_narration": False,
        "voice_cloning": False,
        "all_illustration_styles": False,
        "interactive_experience": False,
        "reading_buddy": False,
        "print_discount_percent": 0,
        "free_prints_per_year": 0,
        "priority_queue": False,
        "watermark": True,
    },
    "monthly": {
        "digital_books_per_period": 2,
        "books_cap_per_period": 2,
        "illustration_styles": "all",
        "voice_narration": True,
        "voice_cloning": False,
        "all_illustration_styles": True,
        "interactive_experience": True,
        "reading_buddy": True,
        "print_discount_percent": 20,
        "free_prints_per_year": 0,
        "priority_queue": False,
        "watermark": False,
    },
    "yearly": {
        "digital_books_per_period": 24,
        "books_cap_per_period": 24,
        "illustration_styles": "all",
        "voice_narration": True,
        "voice_cloning": True,
        "all_illustration_styles": True,
        "interactive_experience": True,
        "reading_buddy": True,
        "print_discount_percent": 20,
        "free_prints_per_year": 3,
        "priority_queue": True,
        "watermark": False,
    },
}


class SubscriptionService:
    """Business logic for subscription plans and book allowances."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_status(
        self,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Return the current subscription status for a user.

        If no active subscription record exists the user is on the free tier.

        Args:
            user_id: UUID of the user.

        Returns:
            Dictionary with ``user_id``, ``tier``, ``status``,
            ``books_remaining``, ``books_cap``, ``free_prints_remaining``,
            ``current_period_start``, ``current_period_end``,
            and ``features``.
        """
        # Look up the user to get their tier
        user_stmt = select(User).where(User.id == user_id)
        user_result = await self._db.execute(user_stmt)
        user: User | None = user_result.scalar_one_or_none()

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Find active subscription
        sub_stmt = (
            select(Subscription)
            .where(Subscription.user_id == user_id)
            .where(Subscription.status.in_(["active", "past_due"]))
            .order_by(Subscription.created_at.desc())
        )
        sub_result = await self._db.execute(sub_stmt)
        subscription: Subscription | None = sub_result.scalar_one_or_none()

        tier = user.subscription_tier or "free"

        if subscription:
            return {
                "user_id": str(user_id),
                "tier": subscription.tier,
                "status": subscription.status,
                "books_remaining": subscription.books_remaining_this_period or 0,
                "books_cap": subscription.books_cap_per_period or 0,
                "free_prints_remaining": subscription.free_prints_remaining or 0,
                "current_period_start": (
                    subscription.current_period_start.isoformat()
                    if subscription.current_period_start
                    else None
                ),
                "current_period_end": (
                    subscription.current_period_end.isoformat()
                    if subscription.current_period_end
                    else None
                ),
                "features": _TIER_FEATURES.get(subscription.tier, _TIER_FEATURES["free"]),
            }

        # Free tier (no subscription record)
        free_features = _TIER_FEATURES["free"]
        return {
            "user_id": str(user_id),
            "tier": "free",
            "status": "active",
            "books_remaining": free_features["digital_books_per_period"],
            "books_cap": free_features["books_cap_per_period"],
            "free_prints_remaining": 0,
            "current_period_start": None,
            "current_period_end": None,
            "features": free_features,
        }

    async def check_book_allowance(
        self,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Check whether a user can create another book in the current period.

        Args:
            user_id: UUID of the user.

        Returns:
            Dictionary with ``allowed`` (bool), ``books_remaining``,
            ``books_cap``, and ``tier``.
        """
        sub_status = await self.get_status(user_id)

        remaining = sub_status["books_remaining"]
        allowed = remaining > 0

        return {
            "allowed": allowed,
            "books_remaining": remaining,
            "books_cap": sub_status["books_cap"],
            "tier": sub_status["tier"],
        }

    async def decrement_book_count(
        self,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Decrement the book allowance by one after a book is created.

        This should be called after a book generation workflow completes
        successfully.

        Args:
            user_id: UUID of the user.

        Returns:
            Dictionary with ``books_remaining`` (updated count) and ``tier``.

        Raises:
            HTTPException: 400 if no books remain in the current period.
        """
        sub_stmt = (
            select(Subscription)
            .where(Subscription.user_id == user_id)
            .where(Subscription.status == "active")
            .order_by(Subscription.created_at.desc())
        )
        sub_result = await self._db.execute(sub_stmt)
        subscription: Subscription | None = sub_result.scalar_one_or_none()

        if subscription is None:
            # Free tier — check against free tier cap
            # For free tier we do not have a Subscription record,
            # so we rely on analytics/book count check.
            # Placeholder: allow one free book
            return {
                "books_remaining": 0,
                "tier": "free",
            }

        if (subscription.books_remaining_this_period or 0) <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No books remaining in the current billing period",
            )

        subscription.books_remaining_this_period = (
            (subscription.books_remaining_this_period or 0) - 1
        )
        await self._db.flush()
        await self._db.refresh(subscription)

        return {
            "books_remaining": subscription.books_remaining_this_period,
            "tier": subscription.tier,
        }

    async def get_tier_features(
        self,
        tier: str,
    ) -> dict[str, Any]:
        """Return the feature set for a subscription tier.

        Args:
            tier: One of ``"free"``, ``"monthly"``, ``"yearly"``.

        Returns:
            Feature dictionary for the requested tier.

        Raises:
            HTTPException: 400 if *tier* is not a valid tier name.
        """
        features = _TIER_FEATURES.get(tier)
        if features is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid tier '{tier}'. Must be one of: {sorted(_TIER_FEATURES.keys())}",
            )

        return {
            "tier": tier,
            "features": features,
        }
