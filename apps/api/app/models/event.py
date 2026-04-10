"""BookEvent model - maps to the 'book_events' partitioned table."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any, Optional

from sqlalchemy import Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models import Base


class BookEvent(Base):
    __tablename__ = "book_events"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    book_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    agent_name: Mapped[Optional[str]] = mapped_column(String(50))
    payload: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    quality_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2))
    latency_ms: Mapped[Optional[int]] = mapped_column(Integer)
    provider_id: Mapped[Optional[str]] = mapped_column(String(50))
    prompt_version_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True))
    error_details: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    timestamp: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    def __repr__(self) -> str:
        return f"<BookEvent(id={self.id}, type={self.event_type!r})>"
