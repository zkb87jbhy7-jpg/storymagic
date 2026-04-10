"""Referral model - maps to the 'referrals' table."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.user import User


class Referral(Base):
    __tablename__ = "referrals"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    referrer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    referred_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id")
    )
    referral_code: Mapped[str] = mapped_column(String(8), nullable=False)
    status: Mapped[Optional[str]] = mapped_column(
        String(20), server_default=text("'signed_up'")
    )
    reward_type: Mapped[Optional[str]] = mapped_column(String(30))
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    referrer: Mapped[User] = relationship(
        back_populates="referrals_made",
        foreign_keys=[referrer_id],
    )
    referred_user: Mapped[Optional[User]] = relationship(
        foreign_keys=[referred_user_id],
    )

    def __repr__(self) -> str:
        return f"<Referral(id={self.id}, code={self.referral_code!r})>"
