"""LivingBook model - maps to the 'living_books' table."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Boolean, Date, ForeignKey, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.book import GeneratedBook
    from app.models.child import ChildProfile
    from app.models.user import User


class LivingBook(Base):
    __tablename__ = "living_books"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    initial_book_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("generated_books.id"), nullable=False
    )
    child_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("children_profiles.id"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    is_active: Mapped[Optional[bool]] = mapped_column(
        Boolean, server_default=text("true")
    )
    chapters: Mapped[Optional[list[dict[str, Any]]]] = mapped_column(
        JSONB, server_default=text("'[]'::jsonb")
    )
    next_reminder_date: Mapped[Optional[date]] = mapped_column(Date)
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    initial_book: Mapped[GeneratedBook] = relationship(back_populates="living_books")
    child: Mapped[ChildProfile] = relationship(back_populates="living_books")
    user: Mapped[User] = relationship(back_populates="living_books")

    def __repr__(self) -> str:
        return f"<LivingBook(id={self.id}, child_id={self.child_id})>"
