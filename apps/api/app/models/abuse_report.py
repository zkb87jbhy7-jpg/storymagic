"""AbuseReport model - maps to the 'abuse_reports' table."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.book import GeneratedBook
    from app.models.template import StoryTemplate
    from app.models.user import User


class AbuseReport(Base):
    __tablename__ = "abuse_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    reporter_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id")
    )
    reported_template_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("story_templates.id")
    )
    reported_book_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("generated_books.id")
    )
    reason: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[Optional[str]] = mapped_column(
        String(20), server_default=text("'pending'")
    )
    reviewed_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True))
    reviewed_at: Mapped[Optional[datetime]] = mapped_column()
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    reporter: Mapped[Optional[User]] = relationship(
        back_populates="abuse_reports",
        foreign_keys=[reporter_user_id],
    )
    reported_template: Mapped[Optional[StoryTemplate]] = relationship(
        back_populates="abuse_reports",
        foreign_keys=[reported_template_id],
    )
    reported_book: Mapped[Optional[GeneratedBook]] = relationship(
        back_populates="abuse_reports",
        foreign_keys=[reported_book_id],
    )

    def __repr__(self) -> str:
        return f"<AbuseReport(id={self.id}, reason={self.reason!r})>"
