"""GiftCard model - maps to the 'gift_cards' table."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Date, ForeignKey, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.user import User


class GiftCard(Base):
    __tablename__ = "gift_cards"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    purchaser_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    recipient_email: Mapped[Optional[str]] = mapped_column(String(255))
    recipient_name: Mapped[Optional[str]] = mapped_column(String(255))
    gift_type: Mapped[Optional[str]] = mapped_column(String(20))
    gift_message: Mapped[Optional[str]] = mapped_column(Text)
    delivery_date: Mapped[Optional[date]] = mapped_column(Date)
    redeem_code: Mapped[str] = mapped_column(
        String(12), unique=True, nullable=False
    )
    status: Mapped[Optional[str]] = mapped_column(
        String(20), server_default=text("'purchased'")
    )
    stripe_payment_id: Mapped[Optional[str]] = mapped_column(String(255))
    credits: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    redeemed_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True)
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column()
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    purchaser: Mapped[User] = relationship(
        back_populates="gift_cards_purchased",
        foreign_keys=[purchaser_id],
    )

    def __repr__(self) -> str:
        return f"<GiftCard(id={self.id}, code={self.redeem_code!r})>"
