"""PromptVersion and PromptTestCase models - maps to 'prompt_versions' and 'prompt_test_cases' tables."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import Integer, String, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models import Base


class PromptVersion(Base):
    __tablename__ = "prompt_versions"
    __table_args__ = (
        UniqueConstraint("prompt_key", "version", name="uq_prompt_versions_key_version"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    prompt_key: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    variables: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String(100)))
    status: Mapped[Optional[str]] = mapped_column(
        String(20), server_default=text("'draft'")
    )
    test_results: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    ab_test_traffic_percent: Mapped[Optional[int]] = mapped_column(
        Integer, server_default=text("0")
    )
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True))
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    def __repr__(self) -> str:
        return f"<PromptVersion(id={self.id}, key={self.prompt_key!r}, v={self.version})>"


class PromptTestCase(Base):
    __tablename__ = "prompt_test_cases"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    prompt_key: Mapped[str] = mapped_column(String(100), nullable=False)
    input_variables: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    expected_traits: Mapped[list[str]] = mapped_column(
        ARRAY(String(100)), nullable=False
    )
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    def __repr__(self) -> str:
        return f"<PromptTestCase(id={self.id}, key={self.prompt_key!r})>"
