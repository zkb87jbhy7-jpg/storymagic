"""Order model - maps to the 'orders' table."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Date, ForeignKey, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.book import GeneratedBook
    from app.models.user import User


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    book_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("generated_books.id"), nullable=False
    )
    order_type: Mapped[str] = mapped_column(String(20), nullable=False)
    dedication_text: Mapped[Optional[str]] = mapped_column(Text)
    dedication_handwritten_url: Mapped[Optional[str]] = mapped_column(String(500))
    print_options: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    payment_status: Mapped[Optional[str]] = mapped_column(
        String(20), server_default=text("'pending'")
    )
    payment_provider: Mapped[Optional[str]] = mapped_column(
        String(20), server_default=text("'stripe'")
    )
    stripe_session_id: Mapped[Optional[str]] = mapped_column(String(255))
    stripe_payment_intent_id: Mapped[Optional[str]] = mapped_column(String(255))
    shipping_address: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    shipping_method: Mapped[Optional[str]] = mapped_column(String(20))
    tracking_number: Mapped[Optional[str]] = mapped_column(String(255))
    tracking_url: Mapped[Optional[str]] = mapped_column(String(500))
    print_provider: Mapped[Optional[str]] = mapped_column(String(20))
    external_order_id: Mapped[Optional[str]] = mapped_column(String(255))
    estimated_delivery: Mapped[Optional[date]] = mapped_column(Date)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[Optional[str]] = mapped_column(
        String(3), server_default=text("'ILS'")
    )
    soft_proof_url: Mapped[Optional[str]] = mapped_column(String(500))
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="orders")
    book: Mapped[GeneratedBook] = relationship(back_populates="orders")

    def __repr__(self) -> str:
        return f"<Order(id={self.id}, type={self.order_type!r}, status={self.payment_status!r})>"
