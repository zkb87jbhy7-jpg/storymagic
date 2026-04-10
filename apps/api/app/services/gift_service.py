"""Gift service — gift card purchase, validation, and redemption.

Handles digital gift card creation with scheduled delivery,
unique redemption codes, and credit application.
"""

from __future__ import annotations

import secrets
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gift import GiftCard
from app.models.user import User

# Gift types and their associated credits (Chapter 3.13)
_GIFT_TYPES: dict[str, dict[str, Any]] = {
    "digital": {
        "price_usd": 9.99,
        "credits": {"digital_books": 1},
        "description": "One digital book creation experience",
    },
    "printed": {
        "price_usd": 34.99,
        "credits": {"digital_books": 1, "print_credits": 1},
        "description": "One printed book (hardcover)",
    },
    "experience": {
        "price_usd": 49.99,
        "credits": {"digital_books": 3, "print_credits": 1},
        "description": "Three digital books plus one print",
    },
}


def _generate_redeem_code() -> str:
    """Generate a unique 12-character alphanumeric redemption code."""
    return secrets.token_urlsafe(9)[:12].upper()


class GiftService:
    """Business logic for gift card lifecycle management."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def purchase(
        self,
        *,
        purchaser_id: uuid.UUID,
        gift_type: str,
        recipient_name: str | None = None,
        recipient_email: str | None = None,
        gift_message: str | None = None,
        delivery_date: date | None = None,
    ) -> GiftCard:
        """Purchase a new gift card.

        Creates a :class:`GiftCard` record with a unique redemption code.
        Payment is handled separately via the Payment Service.

        Args:
            purchaser_id: UUID of the buying user.
            gift_type: One of ``"digital"``, ``"printed"``, ``"experience"``.
            recipient_name: Display name of the gift recipient.
            recipient_email: Email to send the gift to.
            gift_message: Personal message from the purchaser.
            delivery_date: Scheduled delivery date (``None`` for immediate).

        Returns:
            The newly created :class:`GiftCard`.

        Raises:
            HTTPException: 400 if *gift_type* is invalid.
            HTTPException: 404 if the purchaser user does not exist.
        """
        if gift_type not in _GIFT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid gift type. Must be one of: {sorted(_GIFT_TYPES.keys())}",
            )

        # Verify purchaser exists
        user_stmt = select(User).where(User.id == purchaser_id)
        user_result = await self._db.execute(user_stmt)
        if user_result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchaser user not found",
            )

        gift_info = _GIFT_TYPES[gift_type]

        # Generate unique code (retry on collision)
        for _ in range(5):
            code = _generate_redeem_code()
            existing = await self._db.execute(
                select(GiftCard).where(GiftCard.redeem_code == code)
            )
            if existing.scalar_one_or_none() is None:
                break
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate unique redemption code",
            )

        gift = GiftCard(
            purchaser_id=purchaser_id,
            recipient_email=recipient_email,
            recipient_name=recipient_name,
            gift_type=gift_type,
            gift_message=gift_message,
            delivery_date=delivery_date,
            redeem_code=code,
            status="purchased",
            credits=gift_info["credits"],
            expires_at=datetime.now(timezone.utc) + timedelta(days=365),
        )
        self._db.add(gift)
        await self._db.flush()
        await self._db.refresh(gift)

        # TODO: If delivery_date is set, schedule email delivery
        # TODO: Create Stripe payment intent via PaymentService

        return gift

    async def validate_code(
        self,
        redeem_code: str,
    ) -> dict[str, Any]:
        """Validate a gift card redemption code without redeeming it.

        Args:
            redeem_code: The 12-character code to validate.

        Returns:
            Dictionary with ``valid`` (bool), ``gift_type``,
            ``credits``, ``status``, and ``expires_at``.

        Raises:
            HTTPException: 404 if the code does not exist.
        """
        stmt = select(GiftCard).where(GiftCard.redeem_code == redeem_code.upper().strip())
        result = await self._db.execute(stmt)
        gift: GiftCard | None = result.scalar_one_or_none()

        if gift is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Gift card code not found",
            )

        now = datetime.now(timezone.utc)
        is_expired = gift.expires_at is not None and gift.expires_at < now
        is_redeemed = gift.status == "redeemed"
        is_valid = not is_expired and not is_redeemed and gift.status == "purchased"

        return {
            "valid": is_valid,
            "gift_type": gift.gift_type,
            "credits": gift.credits,
            "status": gift.status,
            "recipient_name": gift.recipient_name,
            "expires_at": gift.expires_at.isoformat() if gift.expires_at else None,
            "reason": (
                "expired" if is_expired
                else "already_redeemed" if is_redeemed
                else None
            ),
        }

    async def redeem(
        self,
        *,
        redeem_code: str,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Redeem a gift card and apply its credits to a user account.

        Args:
            redeem_code: The 12-character redemption code.
            user_id: UUID of the redeeming user.

        Returns:
            Dictionary with ``gift_id``, ``credits_applied``,
            and ``message``.

        Raises:
            HTTPException: 400 if the code is already redeemed or expired.
            HTTPException: 404 if the code does not exist.
        """
        validation = await self.validate_code(redeem_code)
        if not validation["valid"]:
            reason = validation.get("reason", "unknown")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Gift card cannot be redeemed: {reason}",
            )

        stmt = select(GiftCard).where(GiftCard.redeem_code == redeem_code.upper().strip())
        result = await self._db.execute(stmt)
        gift: GiftCard = result.scalar_one()

        # Mark as redeemed
        gift.status = "redeemed"
        gift.redeemed_by_user_id = user_id

        # TODO: Apply credits to user account
        # - Increment digital book allowance
        # - Add print credits if applicable

        await self._db.flush()
        await self._db.refresh(gift)

        return {
            "gift_id": str(gift.id),
            "credits_applied": gift.credits,
            "message": "Gift card redeemed successfully",
        }
