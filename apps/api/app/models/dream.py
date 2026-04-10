"""Dream model - maps to the 'dreams' table."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.book import GeneratedBook
    from app.models.child import ChildProfile
    from app.models.user import User


class Dream(Base):
    __tablename__ = "dreams"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    child_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("children_profiles.id"), nullable=False
    )
    transcript: Mapped[str] = mapped_column(Text, nullable=False)
    emotion: Mapped[Optional[str]] = mapped_column(String(30))
    emotion_intensity: Mapped[Optional[Decimal]] = mapped_column(Numeric(3, 1))
    illustration_url: Mapped[Optional[str]] = mapped_column(String(500))
    book_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("generated_books.id")
    )
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="dreams")
    child: Mapped[ChildProfile] = relationship(back_populates="dreams")
    book: Mapped[Optional[GeneratedBook]] = relationship(back_populates="dreams")

    def __repr__(self) -> str:
        return f"<Dream(id={self.id}, emotion={self.emotion!r})>"
