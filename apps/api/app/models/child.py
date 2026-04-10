"""ChildProfile model - maps to the 'children_profiles' table."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Date, ForeignKey, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.dream import Dream
    from app.models.living_book import LivingBook
    from app.models.user import User


class ChildProfile(Base):
    __tablename__ = "children_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    gender: Mapped[Optional[str]] = mapped_column(String(30))
    birth_date: Mapped[Optional[date]] = mapped_column(Date)
    physical_traits: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB, server_default=text("'{}'::jsonb")
    )
    preferences: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB, server_default=text("'{}'::jsonb")
    )
    face_embedding_ref: Mapped[Optional[str]] = mapped_column(String(255))
    character_sheet_urls: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    photos_expiry_date: Mapped[Optional[datetime]] = mapped_column()
    photos_count: Mapped[Optional[int]] = mapped_column(
        Integer, server_default=text("0")
    )
    face_processing_status: Mapped[Optional[str]] = mapped_column(
        String(20), server_default=text("'pending'")
    )
    face_embedding_expiry: Mapped[Optional[datetime]] = mapped_column()
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="children")
    living_books: Mapped[list[LivingBook]] = relationship(back_populates="child")
    dreams: Mapped[list[Dream]] = relationship(back_populates="child")

    def __repr__(self) -> str:
        return f"<ChildProfile(id={self.id}, name={self.name!r})>"
