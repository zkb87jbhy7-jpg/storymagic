"""Creator service — marketplace applications, templates, analytics, and payouts.

Supports the Creator Marketplace (Feature F-06) where content creators
build and sell story templates with a 70/30 revenue split.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.creator import Creator, CreatorTransaction
from app.models.template import StoryTemplate
from app.models.user import User


class CreatorService:
    """Business logic for the creator marketplace."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def apply(
        self,
        *,
        user_id: uuid.UUID,
        display_name: str,
        bio: str | None = None,
        bio_he: str | None = None,
        avatar_url: str | None = None,
        portfolio_links: list[str] | None = None,
    ) -> Creator:
        """Submit an application to become a marketplace creator.

        The application starts in ``"pending"`` status and must be
        approved by an admin before the creator can publish templates.

        Args:
            user_id: UUID of the applying user.
            display_name: Public display name in the marketplace.
            bio: English biography.
            bio_he: Hebrew biography.
            avatar_url: URL to the creator's avatar image.
            portfolio_links: List of portfolio or social media URLs.

        Returns:
            The newly created :class:`Creator` record.

        Raises:
            HTTPException: 404 if the user does not exist.
            HTTPException: 409 if the user already has a creator profile.
        """
        # Verify user exists
        user_stmt = select(User).where(User.id == user_id)
        user_result = await self._db.execute(user_stmt)
        if user_result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Check for existing application
        existing_stmt = select(Creator).where(Creator.user_id == user_id)
        existing_result = await self._db.execute(existing_stmt)
        if existing_result.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You already have a creator application",
            )

        creator = Creator(
            user_id=user_id,
            display_name=display_name,
            bio=bio,
            bio_he=bio_he,
            avatar_url=avatar_url,
            portfolio_links=portfolio_links or [],
            status="pending",
        )
        self._db.add(creator)
        await self._db.flush()
        await self._db.refresh(creator)
        return creator

    async def create_template(
        self,
        *,
        creator_id: uuid.UUID,
        title: str,
        title_he: str | None = None,
        description: str | None = None,
        description_he: str | None = None,
        category: str,
        age_range_min: int = 2,
        age_range_max: int = 10,
        language: str = "he",
        is_rhyming: bool = False,
        scene_definitions: list[dict[str, Any]],
        cover_image_url: str | None = None,
        price: Decimal = Decimal("0"),
        seo_metadata: dict[str, Any] | None = None,
    ) -> StoryTemplate:
        """Create a new story template in the marketplace.

        Templates start in ``"draft"`` status. The creator must submit
        for review before publication.

        Args:
            creator_id: UUID of the creator.
            title: Template title (English).
            title_he: Template title (Hebrew).
            description: English description.
            description_he: Hebrew description.
            category: Category slug — ``"adventure"``, ``"friendship"``,
                ``"learning"``, ``"bedtime"``, ``"holidays"``, etc.
            age_range_min: Minimum target age.
            age_range_max: Maximum target age.
            language: Primary language code.
            is_rhyming: Whether the template uses rhyming.
            scene_definitions: List of scene definition dicts.
            cover_image_url: URL to the cover thumbnail.
            price: Template price in USD.
            seo_metadata: SEO metadata dict.

        Returns:
            The newly created :class:`StoryTemplate`.

        Raises:
            HTTPException: 404 if the creator is not found.
            HTTPException: 403 if the creator is not approved.
        """
        creator = await self._get_active_creator(creator_id)

        if not scene_definitions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one scene definition is required",
            )

        template = StoryTemplate(
            creator_id=creator.id,
            title=title,
            title_he=title_he,
            description=description,
            description_he=description_he,
            category=category,
            age_range_min=age_range_min,
            age_range_max=age_range_max,
            language=language,
            is_rhyming=is_rhyming,
            scene_definitions=scene_definitions,
            cover_image_url=cover_image_url,
            price=price,
            seo_metadata=seo_metadata or {},
            status="draft",
        )
        self._db.add(template)
        await self._db.flush()
        await self._db.refresh(template)
        return template

    async def update_template(
        self,
        template_id: uuid.UUID,
        *,
        creator_id: uuid.UUID,
        data: dict[str, Any],
    ) -> StoryTemplate:
        """Update a story template owned by the creator.

        Only templates in ``"draft"`` or ``"suspended"`` status
        can be edited. Published templates must be unpublished first.

        Args:
            template_id: UUID of the template to update.
            creator_id: UUID of the creator (ownership check).
            data: Mapping of field names to new values.

        Returns:
            The updated :class:`StoryTemplate`.

        Raises:
            HTTPException: 404 if the template is not found.
            HTTPException: 403 if the creator does not own the template.
            HTTPException: 400 if the template is published.
        """
        stmt = select(StoryTemplate).where(StoryTemplate.id == template_id)
        result = await self._db.execute(stmt)
        template: StoryTemplate | None = result.scalar_one_or_none()

        if template is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found",
            )

        if template.creator_id != creator_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not own this template",
            )

        if template.status == "published":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Published templates cannot be edited. Unpublish first.",
            )

        immutable_fields = {"id", "creator_id", "created_at", "purchase_count", "rating", "rating_count"}

        for key, value in data.items():
            if key in immutable_fields:
                continue
            if hasattr(template, key):
                setattr(template, key, value)

        await self._db.flush()
        await self._db.refresh(template)
        return template

    async def get_analytics(
        self,
        creator_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Return analytics for a creator's marketplace presence.

        Args:
            creator_id: UUID of the creator.

        Returns:
            Dictionary with ``creator_id``, ``total_templates``,
            ``total_sales``, ``total_earnings``, ``pending_payout``,
            and ``templates`` list with per-template stats.
        """
        creator = await self._get_active_creator(creator_id)

        # Count templates
        template_stmt = (
            select(StoryTemplate)
            .where(StoryTemplate.creator_id == creator_id)
            .order_by(StoryTemplate.created_at.desc())
        )
        template_result = await self._db.execute(template_stmt)
        templates = list(template_result.scalars().all())

        # Aggregate transaction data
        tx_stmt = (
            select(
                func.count(CreatorTransaction.id).label("total_sales"),
                func.coalesce(func.sum(CreatorTransaction.creator_share), 0).label("total_earned"),
            )
            .where(CreatorTransaction.creator_id == creator_id)
        )
        tx_result = await self._db.execute(tx_stmt)
        tx_row = tx_result.one()

        template_stats = [
            {
                "template_id": str(t.id),
                "title": t.title,
                "status": t.status,
                "purchase_count": t.purchase_count or 0,
                "rating": float(t.rating or 0),
                "rating_count": t.rating_count or 0,
                "price": float(t.price or 0),
            }
            for t in templates
        ]

        return {
            "creator_id": str(creator_id),
            "display_name": creator.display_name,
            "status": creator.status,
            "total_templates": len(templates),
            "total_sales": tx_row.total_sales,
            "total_earnings": float(tx_row.total_earned),
            "pending_payout": float(creator.pending_payout or 0),
            "revenue_share_percent": creator.revenue_share_percent or 70,
            "templates": template_stats,
        }

    async def request_payout(
        self,
        creator_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Request a payout of accumulated earnings.

        Payouts are processed via Stripe Connect to the creator's
        connected account.

        Args:
            creator_id: UUID of the creator.

        Returns:
            Dictionary with ``creator_id``, ``payout_amount``,
            ``currency``, and ``status``.

        Raises:
            HTTPException: 400 if there are no pending earnings or
                no Stripe Connect account is linked.
        """
        creator = await self._get_active_creator(creator_id)

        pending = creator.pending_payout or Decimal("0")
        if pending <= Decimal("0"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No pending earnings to pay out",
            )

        if not creator.stripe_connect_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please link your Stripe Connect account before requesting a payout",
            )

        # TODO: Create Stripe Transfer via Stripe Connect API
        # transfer = stripe.Transfer.create(
        #     amount=int(pending * 100),
        #     currency="usd",
        #     destination=creator.stripe_connect_id,
        # )

        payout_amount = float(pending)
        creator.pending_payout = Decimal("0")
        await self._db.flush()
        await self._db.refresh(creator)

        return {
            "creator_id": str(creator_id),
            "payout_amount": payout_amount,
            "currency": "USD",
            "status": "processing",
        }

    # ── Internal helpers ────────────────────────��───────────────────────

    async def _get_active_creator(self, creator_id: uuid.UUID) -> Creator:
        """Fetch a creator and verify they are active.

        Raises:
            HTTPException: 404 if not found; 403 if not approved.
        """
        stmt = select(Creator).where(Creator.id == creator_id)
        result = await self._db.execute(stmt)
        creator: Creator | None = result.scalar_one_or_none()

        if creator is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Creator not found",
            )

        if creator.status not in ("approved", "active"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Creator account is not active (status: {creator.status})",
            )

        return creator
