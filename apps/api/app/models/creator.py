"""Creator and CreatorTransaction models - maps to 'creators' and 'creator_transactions' tables."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Integer, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.book import GeneratedBook
    from app.models.template import StoryTemplate
    from app.models.user import User


class Creator(Base):
    __tablename__ = "creators"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    bio: Mapped[Optional[str]] = mapped_column(Text)
    bio_he: Mapped[Optional[str]] = mapped_column(Text)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    portfolio_links: Mapped[Optional[list[str]]] = mapped_column(
        ARRAY(String(500))
    )
    revenue_share_percent: Mapped[Optional[int]] = mapped_column(
        Integer, server_default=text("70")
    )
    total_earnings: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2), server_default=text("0")
    )
    pending_payout: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2), server_default=text("0")
    )
    stripe_connect_id: Mapped[Optional[str]] = mapped_column(String(255))
    status: Mapped[Optional[str]] = mapped_column(
        String(20), server_default=text("'pending'")
    )
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="creators")
    templates: Mapped[list[StoryTemplate]] = relationship(back_populates="creator")
    transactions: Mapped[list[CreatorTransaction]] = relationship(
        back_populates="creator"
    )

    def __repr__(self) -> str:
        return f"<Creator(id={self.id}, display_name={self.display_name!r})>"


class CreatorTransaction(Base):
    __tablename__ = "creator_transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    template_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("story_templates.id"), nullable=False
    )
    creator_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("creators.id"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    book_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("generated_books.id"), nullable=False
    )
    total_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    creator_share: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    platform_share: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    payout_status: Mapped[Optional[str]] = mapped_column(
        String(20), server_default=text("'pending'")
    )
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    template: Mapped[StoryTemplate] = relationship(
        back_populates="creator_transactions"
    )
    creator: Mapped[Creator] = relationship(back_populates="transactions")
    user: Mapped[User] = relationship()
    book: Mapped[GeneratedBook] = relationship(
        back_populates="creator_transactions"
    )

    def __repr__(self) -> str:
        return f"<CreatorTransaction(id={self.id}, amount={self.total_amount})>"
