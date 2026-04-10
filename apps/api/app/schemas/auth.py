"""Authentication schemas for register, login, token management, and parental consent.

Endpoints: POST /api/v1/auth/*  (Chapter 8.2)
"""

from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# ── Enumerations ──────────────────────────────────────────────────────────────


class VerificationMethod(StrEnum):
    """COPPA 2025 parental verification methods."""

    KNOWLEDGE_BASED = "knowledge_based"
    PAYMENT_BASED = "payment_based"
    ID_VERIFICATION = "id_verification"
    VIDEO_VERIFICATION = "video_verification"


# ── Registration ──────────────────────────────────────────────────────────────


class RegisterRequest(BaseModel):
    """POST /api/v1/auth/register"""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=1, max_length=200)
    language_preference: str = Field(default="en", max_length=5)
    parental_consent: bool = Field(
        ...,
        description="Acknowledgement of biometric data collection per COPPA 2025",
    )

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


# ── Login ─────────────────────────────────────────────────────────────────────


class LoginRequest(BaseModel):
    """POST /api/v1/auth/login"""

    email: EmailStr
    password: str = Field(min_length=1)


# ── Token ─────────────────────────────────────────────────────────────────────


class TokenResponse(BaseModel):
    """Returned by register, login, and refresh endpoints."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="Token lifetime in seconds")

    model_config = ConfigDict(from_attributes=True)


class RefreshRequest(BaseModel):
    """POST /api/v1/auth/refresh"""

    refresh_token: str


# ── Parental Consent (COPPA 2025) ────────────────────────────────────────────


class ParentalConsentRequest(BaseModel):
    """POST /api/v1/auth/verify-parent

    Verifiable Parental Consent with biometric data disclosure per COPPA 2025.
    """

    biometric_consent: bool = Field(
        ...,
        description="Consent for face template / faceprint processing",
    )
    data_retention_consent: bool = Field(
        ...,
        description="Consent for data retention policy (photos 30 days, embeddings 12 months)",
    )
    verification_method: VerificationMethod


# ── Password Reset ────────────────────────────────────────────────────────────


class ForgotPasswordRequest(BaseModel):
    """POST /api/v1/auth/forgot-password"""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """POST /api/v1/auth/reset-password"""

    token: str
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v
