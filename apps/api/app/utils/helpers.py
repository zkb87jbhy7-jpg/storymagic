"""Common utility helpers."""

from __future__ import annotations

import hashlib
import secrets
import string


def generate_referral_code(length: int = 8) -> str:
    """Generate a random referral code."""
    chars = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(chars) for _ in range(length))


def generate_redeem_code(length: int = 12) -> str:
    """Generate a random gift card redemption code."""
    chars = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(chars) for _ in range(length))


def generate_consent_token() -> str:
    """Generate a secure token for parental consent links."""
    return secrets.token_urlsafe(32)


def hash_for_idempotency(data: str) -> str:
    """Generate a hash for idempotency checks."""
    return hashlib.sha256(data.encode()).hexdigest()[:16]
