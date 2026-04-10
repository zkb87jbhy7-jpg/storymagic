"""Referral endpoints.

Spec ref: Ch8.16 - Referral Endpoints
  GET  /api/v1/referral/status — Referral statistics
  POST /api/v1/referral/share — Log share event
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field

from app.dependencies import get_current_user

router = APIRouter(prefix="/referral", tags=["Referral"])


# ── Request / Response Schemas (inline) ───────────────────────────────────


class ReferralStatusResponse(BaseModel):
    """Referral statistics for the authenticated user."""
    user_id: uuid.UUID
    referral_code: str
    referral_link: str
    total_referrals: int
    successful_referrals: int
    pending_referrals: int
    total_credits_earned: float
    available_credits: float
    currency: str = "USD"
    referral_history: list[dict[str, Any]] = []


class ShareEventRequest(BaseModel):
    """POST /api/v1/referral/share"""
    channel: str = Field(
        description="Share channel: 'email', 'whatsapp', 'facebook', 'twitter', 'copy_link', 'sms'"
    )
    recipient_email: str | None = Field(default=None, description="Recipient email if applicable")


class ShareEventResponse(BaseModel):
    """Share event logging response."""
    id: uuid.UUID
    channel: str
    referral_code: str
    referral_link: str
    message: str


# ── GET /referral/status ──────────────────────────────────────────────────


@router.get(
    "/status",
    response_model=ReferralStatusResponse,
    summary="Get referral statistics",
)
async def get_referral_status(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ReferralStatusResponse:
    """Get referral statistics for the authenticated user.

    Spec ref: Ch8.16 — GET /api/v1/referral/status
    """
    user_id = uuid.UUID(str(current_user["id"]))
    referral_code = current_user.get("referral_code", "PLACEHOLDER")

    # Placeholder: In production, aggregate referral stats from database.
    return ReferralStatusResponse(
        user_id=user_id,
        referral_code=referral_code,
        referral_link=f"https://storymagic.app/ref/{referral_code}",
        total_referrals=0,
        successful_referrals=0,
        pending_referrals=0,
        total_credits_earned=0.0,
        available_credits=0.0,
        currency="USD",
        referral_history=[],
    )


# ── POST /referral/share ─────────────────────────────────────────────────


@router.post(
    "/share",
    response_model=ShareEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log share event",
)
async def log_share_event(
    body: ShareEventRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ShareEventResponse:
    """Log a share event for analytics.

    Spec ref: Ch8.16 — POST /api/v1/referral/share
    """
    referral_code = current_user.get("referral_code", "PLACEHOLDER")

    # Placeholder: In production, log the share event for analytics tracking.
    return ShareEventResponse(
        id=uuid.uuid4(),
        channel=body.channel,
        referral_code=referral_code,
        referral_link=f"https://storymagic.app/ref/{referral_code}",
        message=f"Share event logged via {body.channel}",
    )
