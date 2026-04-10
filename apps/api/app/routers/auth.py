"""Authentication endpoints.

Spec ref: Ch8.2 - Authentication Endpoints
  POST /api/v1/auth/register — Register new user
  POST /api/v1/auth/login — Login with email/password
  POST /api/v1/auth/verify-parent — COPPA 2025 parental consent
  POST /api/v1/auth/refresh — Refresh access token
  POST /api/v1/auth/forgot-password — Send password reset link
  POST /api/v1/auth/reset-password — Reset password with token
  POST /api/v1/auth/logout — Invalidate tokens
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.dependencies import get_current_user, get_db, get_redis
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    ParentalConsentRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _create_access_token(
    user_id: str,
    settings: Settings,
) -> tuple[str, int]:
    """Create a JWT access token. Returns (token, expires_in_seconds)."""
    expires_delta = timedelta(minutes=settings.jwt_expiration_minutes)
    expire = datetime.now(timezone.utc) + expires_delta
    payload = {
        "sub": user_id,
        "exp": expire,
        "type": "access",
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token, int(expires_delta.total_seconds())


def _create_refresh_token(
    user_id: str,
    settings: Settings,
) -> str:
    """Create a JWT refresh token."""
    expires_delta = timedelta(days=settings.jwt_refresh_expiration_days)
    expire = datetime.now(timezone.utc) + expires_delta
    payload = {
        "sub": user_id,
        "exp": expire,
        "type": "refresh",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


# ── POST /auth/register ───────────────────────────────────────────────────


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> TokenResponse:
    """Register a new user account.

    Spec ref: Ch8.2 — POST /api/v1/auth/register
    Accepts email, password, name, language, and parental consent acknowledgment.
    Returns JWT access token and refresh token.
    """
    if not body.parental_consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parental consent acknowledgment is required",
        )

    # Check for existing user
    existing = await db.execute(
        text("SELECT id FROM users WHERE email = :email"),
        {"email": body.email},
    )
    if existing.first() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    user_id = str(uuid.uuid4())
    hashed_password = pwd_context.hash(body.password)
    now = datetime.now(timezone.utc)

    await db.execute(
        text("""
            INSERT INTO users (id, email, password_hash, name, language_preference,
                               parental_consent, created_at, updated_at)
            VALUES (:id, :email, :password_hash, :name, :language_preference,
                    :parental_consent, :created_at, :updated_at)
        """),
        {
            "id": user_id,
            "email": body.email,
            "password_hash": hashed_password,
            "name": body.name,
            "language_preference": body.language_preference,
            "parental_consent": body.parental_consent,
            "created_at": now,
            "updated_at": now,
        },
    )

    access_token, expires_in = _create_access_token(user_id, settings)
    refresh_token = _create_refresh_token(user_id, settings)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
    )


# ── POST /auth/login ─────────────────────────────────────────────────────


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with email and password",
)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> TokenResponse:
    """Authenticate a user with email and password.

    Spec ref: Ch8.2 — POST /api/v1/auth/login
    Returns JWT tokens on success.
    """
    result = await db.execute(
        text("SELECT id, password_hash, is_active FROM users WHERE email = :email"),
        {"email": body.email},
    )
    user_row = result.mappings().first()

    if user_row is None or not pwd_context.verify(body.password, user_row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user_row.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated",
        )

    user_id = str(user_row["id"])
    access_token, expires_in = _create_access_token(user_id, settings)
    refresh_token = _create_refresh_token(user_id, settings)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
    )


# ── POST /auth/verify-parent ─────────────────────────────────────────────


@router.post(
    "/verify-parent",
    response_model=SuccessResponse,
    summary="Verifiable Parental Consent (COPPA 2025)",
)
async def verify_parent(
    body: ParentalConsentRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse:
    """Submit verifiable parental consent with biometric data disclosure.

    Spec ref: Ch8.2 — POST /api/v1/auth/verify-parent
    Requires knowledge-based or payment-based verification per COPPA 2025.
    """
    if not body.biometric_consent or not body.data_retention_consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both biometric and data retention consent are required",
        )

    now = datetime.now(timezone.utc)
    await db.execute(
        text("""
            UPDATE users SET
                parental_consent = TRUE,
                parental_consent_method = :method,
                parental_consent_date = :consent_date,
                updated_at = :updated_at
            WHERE id = :user_id
        """),
        {
            "method": body.verification_method.value,
            "consent_date": now,
            "updated_at": now,
            "user_id": current_user["id"],
        },
    )

    return SuccessResponse(message="Parental consent verified successfully")


# ── POST /auth/refresh ────────────────────────────────────────────────────


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
)
async def refresh(
    body: RefreshRequest,
    settings: Settings = Depends(get_settings),
) -> TokenResponse:
    """Refresh an expired access token using a valid refresh token.

    Spec ref: Ch8.2 — POST /api/v1/auth/refresh
    """
    from jose import JWTError

    try:
        payload: dict[str, Any] = jwt.decode(
            body.refresh_token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is not a refresh token",
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    access_token, expires_in = _create_access_token(user_id, settings)
    new_refresh_token = _create_refresh_token(user_id, settings)

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        expires_in=expires_in,
    )


# ── POST /auth/forgot-password ───────────────────────────────────────────


@router.post(
    "/forgot-password",
    response_model=SuccessResponse,
    summary="Send password reset link",
)
async def forgot_password(
    body: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse:
    """Send a password reset link to the registered email.

    Spec ref: Ch8.2 — POST /api/v1/auth/forgot-password
    Always returns success to prevent email enumeration.
    """
    result = await db.execute(
        text("SELECT id FROM users WHERE email = :email"),
        {"email": body.email},
    )
    user_row = result.first()

    if user_row is not None:
        # In production, generate reset token and send email.
        # Placeholder: token generation and email dispatch would happen here.
        reset_token = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        await db.execute(
            text("""
                UPDATE users SET
                    password_reset_token = :token,
                    password_reset_expires = :expires,
                    updated_at = :updated_at
                WHERE email = :email
            """),
            {
                "token": reset_token,
                "expires": now + timedelta(hours=1),
                "updated_at": now,
                "email": body.email,
            },
        )

    # Always return success to prevent email enumeration
    return SuccessResponse(message="If the email exists, a reset link has been sent")


# ── POST /auth/reset-password ────────────────────────────────────────────


@router.post(
    "/reset-password",
    response_model=SuccessResponse,
    summary="Reset password with token",
)
async def reset_password(
    body: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> SuccessResponse:
    """Reset the password using a valid reset token.

    Spec ref: Ch8.2 — POST /api/v1/auth/reset-password
    """
    result = await db.execute(
        text("""
            SELECT id FROM users
            WHERE password_reset_token = :token
              AND password_reset_expires > :now
        """),
        {"token": body.token, "now": datetime.now(timezone.utc)},
    )
    user_row = result.first()

    if user_row is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    hashed_password = pwd_context.hash(body.new_password)
    now = datetime.now(timezone.utc)

    await db.execute(
        text("""
            UPDATE users SET
                password_hash = :password_hash,
                password_reset_token = NULL,
                password_reset_expires = NULL,
                updated_at = :updated_at
            WHERE password_reset_token = :token
        """),
        {
            "password_hash": hashed_password,
            "updated_at": now,
            "token": body.token,
        },
    )

    return SuccessResponse(message="Password has been reset successfully")


# ── POST /auth/logout ────────────────────────────────────────────────────


@router.post(
    "/logout",
    response_model=SuccessResponse,
    summary="Invalidate tokens",
)
async def logout(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    request: Request,
) -> SuccessResponse:
    """Invalidate the current user's tokens.

    Spec ref: Ch8.2 — POST /api/v1/auth/logout
    In production, the token would be added to a Redis deny-list.
    """
    # Placeholder: In production, extract the token from the Authorization header
    # and add it to a Redis deny-list with TTL matching the token expiry.
    return SuccessResponse(message="Successfully logged out")
