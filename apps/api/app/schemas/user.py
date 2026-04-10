"""User profile schemas.

Endpoints: GET/PUT /api/v1/users/me  (implied by Chapter 8)
Maps to TypeScript: packages/shared-types/src/user.ts
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ── Enumerations ──────────────────────────────────────────────────────────────


class SubscriptionTier(StrEnum):
    FREE = "free"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class OnboardingType(StrEnum):
    QUICK = "quick"
    CREATIVE = "creative"
    GUIDED = "guided"


class FontSize(StrEnum):
    NORMAL = "normal"
    LARGE = "large"
    XL = "xl"


# ── Sub-schemas ───────────────────────────────────────────────────────────────


class AccessibilityPrefs(BaseModel):
    """User accessibility preferences (JSONB column)."""

    dyslexia_mode: bool = False
    adhd_mode: bool = False
    autism_mode: bool = False
    font_size: FontSize = FontSize.NORMAL
    high_contrast: bool = False
    reduced_motion: bool = False


class AccessibilityPrefsUpdate(BaseModel):
    """Partial update for accessibility preferences."""

    dyslexia_mode: bool | None = None
    adhd_mode: bool | None = None
    autism_mode: bool | None = None
    font_size: FontSize | None = None
    high_contrast: bool | None = None
    reduced_motion: bool | None = None


# ── Response ──────────────────────────────────────────────────────────────────


class UserResponse(BaseModel):
    """Public user representation.  Never includes password_hash or encryption_key_ref."""

    id: uuid.UUID
    email: EmailStr
    name: str
    phone: str | None = None
    language_preference: str
    currency_preference: str
    subscription_tier: SubscriptionTier
    accessibility_prefs: AccessibilityPrefs
    onboarding_type: OnboardingType
    referral_code: str
    referred_by: str | None = None
    timezone: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Update ────────────────────────────────────────────────────────────────────


class UserUpdate(BaseModel):
    """PUT /api/v1/users/me — partial update."""

    name: str | None = Field(default=None, min_length=1, max_length=200)
    phone: str | None = None
    language_preference: str | None = Field(default=None, max_length=5)
    currency_preference: str | None = Field(default=None, max_length=3)
    subscription_tier: SubscriptionTier | None = None
    accessibility_prefs: AccessibilityPrefsUpdate | None = None
    onboarding_type: OnboardingType | None = None
    timezone: str | None = None
