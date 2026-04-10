"""Gift endpoints.

Spec ref: Ch8.15 - Gift Endpoints
  POST /api/v1/gifts/purchase — Purchase gift card
  GET  /api/v1/gifts/redeem/{code} — Validate gift card
  POST /api/v1/gifts/redeem/{code} — Complete redemption
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.dependencies import get_current_user

router = APIRouter(prefix="/gifts", tags=["Gifts"])


# ── Request / Response Schemas (inline) ───────────────────────────────────


class GiftPurchaseRequest(BaseModel):
    """POST /api/v1/gifts/purchase"""
    amount: float = Field(ge=5.0, le=500.0)
    currency: str = Field(default="USD", max_length=3)
    recipient_email: str | None = Field(default=None, description="Optional email to send gift to")
    recipient_name: str | None = Field(default=None, max_length=200)
    sender_name: str | None = Field(default=None, max_length=200)
    personal_message: str | None = Field(default=None, max_length=500)


class GiftPurchaseResponse(BaseModel):
    """Gift card purchase response."""
    id: uuid.UUID
    code: str
    amount: float
    currency: str
    recipient_email: str | None = None
    status: str  # active, redeemed, expired
    expires_at: datetime | None = None
    created_at: datetime


class GiftRedeemInfoResponse(BaseModel):
    """GET /api/v1/gifts/redeem/{code} — gift card validation info."""
    code: str
    amount: float
    currency: str
    status: str  # active, redeemed, expired
    sender_name: str | None = None
    personal_message: str | None = None
    expires_at: datetime | None = None


class GiftRedeemRequest(BaseModel):
    """POST /api/v1/gifts/redeem/{code}"""
    apply_to_account: bool = True


class GiftRedeemResponse(BaseModel):
    """Gift card redemption response."""
    code: str
    amount_applied: float
    currency: str
    new_account_balance: float
    message: str


# ── POST /gifts/purchase ─────────────────────────────────────────────────


@router.post(
    "/purchase",
    response_model=GiftPurchaseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Purchase gift card",
)
async def purchase_gift(
    body: GiftPurchaseRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> GiftPurchaseResponse:
    """Purchase a gift card.

    Spec ref: Ch8.15 — POST /api/v1/gifts/purchase
    """
    from app.utils.helpers import generate_redeem_code

    now = datetime.now(timezone.utc)
    code = generate_redeem_code()

    # Placeholder: In production, create gift card record and process payment.
    return GiftPurchaseResponse(
        id=uuid.uuid4(),
        code=code,
        amount=body.amount,
        currency=body.currency,
        recipient_email=body.recipient_email,
        status="active",
        expires_at=None,
        created_at=now,
    )


# ── GET /gifts/redeem/{code} ─────────────────────────────────────────────


@router.get(
    "/redeem/{code}",
    response_model=GiftRedeemInfoResponse,
    summary="Validate gift card",
)
async def validate_gift(
    code: str,
) -> GiftRedeemInfoResponse:
    """Validate and get gift card details before redemption.

    Spec ref: Ch8.15 — GET /api/v1/gifts/redeem/{code}
    """
    # Placeholder: In production, look up gift card by code.
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Gift card not found or expired",
    )


# ── POST /gifts/redeem/{code} ────────────────────────────────────────────


@router.post(
    "/redeem/{code}",
    response_model=GiftRedeemResponse,
    summary="Redeem gift card",
)
async def redeem_gift(
    code: str,
    body: GiftRedeemRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> GiftRedeemResponse:
    """Complete gift card redemption, applying the balance to the user's account.

    Spec ref: Ch8.15 — POST /api/v1/gifts/redeem/{code}
    """
    # Placeholder: In production, validate code, mark as redeemed,
    # and credit user's account balance.
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Gift card not found or already redeemed",
    )
