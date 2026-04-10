"""BookPage model - maps to the 'book_pages' table."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import ForeignKey, Integer, String, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.book import GeneratedBook


class BookPage(Base):
    __tablename__ = "book_pages"
    __table_args__ = (
        UniqueConstraint("book_id", "page_number", name="uq_book_pages_book_id_page_number"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    book_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("generated_books.id", ondelete="CASCADE"), nullable=False
    )
    page_number: Mapped[int] = mapped_column(Integer, nullable=False)
    text_primary: Mapped[str] = mapped_column(Text, nullable=False)
    text_secondary: Mapped[Optional[str]] = mapped_column(Text)
    illustration_url: Mapped[Optional[str]] = mapped_column(String(500))
    illustration_thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500))
    illustration_print_url: Mapped[Optional[str]] = mapped_column(String(500))
    illustration_prompt: Mapped[Optional[str]] = mapped_column(Text)
    illustration_negative_prompt: Mapped[Optional[str]] = mapped_column(Text)
    layout_type: Mapped[Optional[str]] = mapped_column(String(50))
    animation_preset: Mapped[Optional[str]] = mapped_column(String(30))
    interactive_elements: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    performance_markup: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    alt_text: Mapped[Optional[str]] = mapped_column(Text)
    alt_text_secondary: Mapped[Optional[str]] = mapped_column(Text)
    fun_facts: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    reading_buddy_question: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    book: Mapped[GeneratedBook] = relationship(back_populates="pages")

    def __repr__(self) -> str:
        return f"<BookPage(id={self.id}, book_id={self.book_id}, page={self.page_number})>"
