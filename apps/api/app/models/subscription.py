"""Subscription model - maps to the 'subscriptions' table."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.user import User


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    tier: Mapped[str] = mapped_column(String(20), nullable=False)
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(String(255))
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(255))
    status: Mapped[Optional[str]] = mapped_column(
        String(20), server_default=text("'active'")
    )
    current_period_start: Mapped[Optional[datetime]] = mapped_column()
    current_period_end: Mapped[Optional[datetime]] = mapped_column()
    books_remaining_this_period: Mapped[Optional[int]] = mapped_column(
        Integer, server_default=text("0")
    )
    books_cap_per_period: Mapped[Optional[int]] = mapped_column(
        Integer, server_default=text("2")
    )
    free_prints_remaining: Mapped[Optional[int]] = mapped_column(
        Integer, server_default=text("0")
    )
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="subscriptions")

    def __repr__(self) -> str:
        return f"<Subscription(id={self.id}, tier={self.tier!r}, status={self.status!r})>"
