"""StoryTemplate model - maps to the 'story_templates' table."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.abuse_report import AbuseReport
    from app.models.book import GeneratedBook
    from app.models.creator import Creator, CreatorTransaction


class StoryTemplate(Base):
    __tablename__ = "story_templates"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    creator_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("creators.id")
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    title_he: Mapped[Optional[str]] = mapped_column(String(500))
    description: Mapped[Optional[str]] = mapped_column(Text)
    description_he: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    age_range_min: Mapped[Optional[int]] = mapped_column(
        Integer, server_default=text("2")
    )
    age_range_max: Mapped[Optional[int]] = mapped_column(
        Integer, server_default=text("10")
    )
    language: Mapped[Optional[str]] = mapped_column(
        String(10), server_default=text("'he'")
    )
    is_rhyming: Mapped[Optional[bool]] = mapped_column(
        Boolean, server_default=text("false")
    )
    scene_definitions: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    cover_image_url: Mapped[Optional[str]] = mapped_column(String(500))
    status: Mapped[Optional[str]] = mapped_column(
        String(20), server_default=text("'draft'")
    )
    rating: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(3, 2), server_default=text("0")
    )
    rating_count: Mapped[Optional[int]] = mapped_column(
        Integer, server_default=text("0")
    )
    purchase_count: Mapped[Optional[int]] = mapped_column(
        Integer, server_default=text("0")
    )
    price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2), server_default=text("0")
    )
    seo_metadata: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB, server_default=text("'{}'::jsonb")
    )
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    creator: Mapped[Optional[Creator]] = relationship(back_populates="templates")
    books: Mapped[list[GeneratedBook]] = relationship(back_populates="story_template")
    creator_transactions: Mapped[list[CreatorTransaction]] = relationship(
        back_populates="template"
    )
    abuse_reports: Mapped[list[AbuseReport]] = relationship(
        back_populates="reported_template",
        foreign_keys="AbuseReport.reported_template_id",
    )

    def __repr__(self) -> str:
        return f"<StoryTemplate(id={self.id}, title={self.title!r})>"
