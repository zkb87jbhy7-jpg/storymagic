"""GeneratedBook model - maps to the 'generated_books' table."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Boolean, ForeignKey, String, Text, text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.abuse_report import AbuseReport
    from app.models.creator import CreatorTransaction
    from app.models.dream import Dream
    from app.models.living_book import LivingBook
    from app.models.order import Order
    from app.models.page import BookPage
    from app.models.user import User


class GeneratedBook(Base):
    __tablename__ = "generated_books"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    child_profile_ids: Mapped[list[uuid.UUID]] = mapped_column(
        ARRAY(UUID(as_uuid=True)), nullable=False
    )
    story_template_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("story_templates.id")
    )
    free_prompt: Mapped[Optional[str]] = mapped_column(Text)
    title: Mapped[Optional[str]] = mapped_column(String(500))
    generated_story: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    illustration_style: Mapped[Optional[str]] = mapped_column(String(50))
    character_sheet_ref: Mapped[Optional[str]] = mapped_column(String(255))
    illustrations: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    voice_narration_url: Mapped[Optional[str]] = mapped_column(String(500))
    voice_profile_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True))
    interactive_book_data: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    print_ready_pdf_url: Mapped[Optional[str]] = mapped_column(String(500))
    digital_pdf_url: Mapped[Optional[str]] = mapped_column(String(500))
    parental_guide: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    quality_scores: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    status: Mapped[Optional[str]] = mapped_column(
        String(20), server_default=text("'draft'")
    )
    generation_workflow_id: Mapped[Optional[str]] = mapped_column(String(255))
    is_living_book: Mapped[Optional[bool]] = mapped_column(
        Boolean, server_default=text("false")
    )
    is_bilingual: Mapped[Optional[bool]] = mapped_column(
        Boolean, server_default=text("false")
    )
    secondary_language: Mapped[Optional[str]] = mapped_column(String(10))
    mood_setting: Mapped[Optional[str]] = mapped_column(String(30))
    creation_method: Mapped[Optional[str]] = mapped_column(String(20))
    co_creation_journey: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    book_dna_pattern: Mapped[Optional[str]] = mapped_column(String(500))
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="books")
    story_template: Mapped[Optional[StoryTemplate]] = relationship(
        back_populates="books"
    )
    pages: Mapped[list[BookPage]] = relationship(
        back_populates="book", cascade="all, delete-orphan"
    )
    orders: Mapped[list[Order]] = relationship(back_populates="book")
    living_books: Mapped[list[LivingBook]] = relationship(
        back_populates="initial_book"
    )
    dreams: Mapped[list[Dream]] = relationship(back_populates="book")
    creator_transactions: Mapped[list[CreatorTransaction]] = relationship(
        back_populates="book"
    )
    abuse_reports: Mapped[list[AbuseReport]] = relationship(
        back_populates="reported_book",
        foreign_keys="AbuseReport.reported_book_id",
    )

    def __repr__(self) -> str:
        return f"<GeneratedBook(id={self.id}, title={self.title!r})>"
