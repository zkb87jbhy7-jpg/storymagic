"""User service — authentication, CRUD, and token management.

Handles user registration, login, profile management, JWT generation,
and password hashing via bcrypt.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from fastapi import HTTPException, status
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.models.user import User


class UserService:
    """Business logic for user accounts and authentication."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._settings: Settings = get_settings()

    # ── Password helpers ────────────────────────────────────────────────

    @staticmethod
    def hash_password(plain_password: str) -> str:
        """Hash a plain-text password using bcrypt.

        Args:
            plain_password: The raw password string to hash.

        Returns:
            A bcrypt hash string suitable for storage.
        """
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a plain-text password against a stored bcrypt hash.

        Args:
            plain_password: The raw password to check.
            hashed_password: The stored bcrypt hash.

        Returns:
            ``True`` if the password matches, ``False`` otherwise.
        """
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )

    # ── Token helpers ───────────────────────────────────────────────────

    def generate_tokens(self, user_id: uuid.UUID) -> dict[str, Any]:
        """Generate an access / refresh token pair for *user_id*.

        Args:
            user_id: UUID of the authenticated user.

        Returns:
            Dictionary with ``access_token``, ``refresh_token``,
            ``token_type``, and ``expires_in`` (seconds).
        """
        now = datetime.now(timezone.utc)

        access_payload: dict[str, Any] = {
            "sub": str(user_id),
            "type": "access",
            "iat": now,
            "exp": now + timedelta(minutes=self._settings.jwt_expiration_minutes),
        }
        access_token: str = jwt.encode(
            access_payload,
            self._settings.jwt_secret,
            algorithm=self._settings.jwt_algorithm,
        )

        refresh_payload: dict[str, Any] = {
            "sub": str(user_id),
            "type": "refresh",
            "iat": now,
            "exp": now + timedelta(days=self._settings.jwt_refresh_expiration_days),
        }
        refresh_token: str = jwt.encode(
            refresh_payload,
            self._settings.jwt_secret,
            algorithm=self._settings.jwt_algorithm,
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": self._settings.jwt_expiration_minutes * 60,
        }

    async def refresh_token(self, refresh_token: str) -> dict[str, Any]:
        """Validate a refresh token and issue a new token pair.

        Args:
            refresh_token: The JWT refresh token.

        Returns:
            A new token dictionary (same shape as :meth:`generate_tokens`).

        Raises:
            HTTPException: 401 if the token is invalid, expired,
                or the user no longer exists.
        """
        try:
            payload: dict[str, Any] = jwt.decode(
                refresh_token,
                self._settings.jwt_secret,
                algorithms=[self._settings.jwt_algorithm],
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

        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token payload missing subject",
            )

        user = await self.get_by_id(uuid.UUID(user_id_str))
        return self.generate_tokens(user.id)

    # ── CRUD ────────────────────────────────────────────────────────────

    async def create_user(
        self,
        *,
        email: str,
        password: str,
        name: str,
        phone: str | None = None,
        language_preference: str = "he",
        currency_preference: str = "ILS",
        onboarding_type: str = "guided",
        timezone: str = "Asia/Jerusalem",
    ) -> User:
        """Register a new user account.

        Args:
            email: Unique email address.
            password: Plain-text password (will be hashed before storage).
            name: Display name.
            phone: Optional phone number.
            language_preference: ISO language code (default ``"he"``).
            currency_preference: ISO 4217 currency code (default ``"ILS"``).
            onboarding_type: One of ``quick``, ``creative``, ``guided``.
            timezone: IANA timezone string.

        Returns:
            The newly created :class:`User` instance.

        Raises:
            HTTPException: 409 if *email* is already registered.
        """
        existing = await self.get_by_email(email, raise_on_missing=False)
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists",
            )

        user = User(
            email=email.lower().strip(),
            password_hash=self.hash_password(password),
            name=name,
            phone=phone,
            language_preference=language_preference,
            currency_preference=currency_preference,
            onboarding_type=onboarding_type,
            timezone=timezone,
        )
        self._db.add(user)
        await self._db.flush()
        await self._db.refresh(user)
        return user

    async def get_by_email(
        self,
        email: str,
        *,
        raise_on_missing: bool = True,
    ) -> User | None:
        """Look up a user by email address.

        Args:
            email: The email to search for (case-insensitive).
            raise_on_missing: If ``True`` (default), raise 404 when the
                user is not found.

        Returns:
            The matching :class:`User`, or ``None`` when
            *raise_on_missing* is ``False`` and no user is found.

        Raises:
            HTTPException: 404 when the user is not found and
                *raise_on_missing* is ``True``.
        """
        stmt = select(User).where(User.email == email.lower().strip())
        result = await self._db.execute(stmt)
        user: User | None = result.scalar_one_or_none()

        if user is None and raise_on_missing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    async def get_by_id(self, user_id: uuid.UUID) -> User:
        """Fetch a user by primary key.

        Args:
            user_id: UUID of the user.

        Returns:
            The matching :class:`User`.

        Raises:
            HTTPException: 404 when no user exists with this ID.
        """
        stmt = select(User).where(User.id == user_id)
        result = await self._db.execute(stmt)
        user: User | None = result.scalar_one_or_none()

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    async def update(
        self,
        user_id: uuid.UUID,
        *,
        data: dict[str, Any],
    ) -> User:
        """Update mutable fields on a user profile.

        Only the keys present in *data* are applied. The ``password_hash``,
        ``id``, ``email``, ``created_at``, and ``encryption_key_ref`` fields
        are silently ignored to prevent accidental overwrites.

        Args:
            user_id: UUID of the user to update.
            data: Mapping of field names to new values.

        Returns:
            The refreshed :class:`User` instance.

        Raises:
            HTTPException: 404 if the user does not exist.
        """
        user = await self.get_by_id(user_id)

        immutable_fields = {
            "id",
            "email",
            "password_hash",
            "created_at",
            "encryption_key_ref",
            "referral_code",
        }

        for key, value in data.items():
            if key in immutable_fields:
                continue
            if hasattr(user, key):
                setattr(user, key, value)

        user.updated_at = datetime.now(timezone.utc)
        await self._db.flush()
        await self._db.refresh(user)
        return user

    async def delete(self, user_id: uuid.UUID) -> None:
        """Soft-delete a user by marking the account as deactivated.

        For GDPR crypto-shredding the encryption key reference is cleared,
        rendering all encrypted child data permanently unreadable.

        Args:
            user_id: UUID of the user to delete.

        Raises:
            HTTPException: 404 if the user does not exist.
        """
        user = await self.get_by_id(user_id)
        # Crypto-shred: wipe the encryption key reference
        user.encryption_key_ref = "DELETED"
        user.updated_at = datetime.now(timezone.utc)
        await self._db.delete(user)
        await self._db.flush()
