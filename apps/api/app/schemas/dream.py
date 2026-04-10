"""Dream-to-book schemas.

Endpoints: /api/v1/dreams/*  (Chapter 8.17)
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from .book import IllustrationStyle, MoodSetting


# ── Create ────────────────────────────────────────────────────────────────────


class DreamCreate(BaseModel):
    """POST /api/v1/dreams — save a child's dream for later story creation."""

    child_id: uuid.UUID
    description: str = Field(min_length=1, max_length=5000)
    title: str | None = Field(default=None, max_length=200)
    mood: MoodSetting | None = None
    tags: list[str] = Field(default_factory=list, max_length=20)


# ── Response ──────────────────────────────────────────────────────────────────


class DreamResponse(BaseModel):
    """Returned by POST /api/v1/dreams and GET /api/v1/dreams."""

    id: uuid.UUID
    child_id: uuid.UUID
    user_id: uuid.UUID
    description: str
    title: str | None = None
    mood: MoodSetting | None = None
    tags: list[str] = Field(default_factory=list)
    book_id: uuid.UUID | None = Field(
        default=None,
        description="Set when the dream has been converted to a book",
    )
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Dream-to-Book ─────────────────────────────────────────────────────────────


class DreamToBookRequest(BaseModel):
    """POST /api/v1/dreams/{id}/create-book — convert a dream into a book."""

    illustration_style: IllustrationStyle | None = None
    mood_setting: MoodSetting | None = None
    is_bilingual: bool = False
    secondary_language: str | None = Field(default=None, max_length=5)
    voice_profile_id: uuid.UUID | None = None
    page_count: int | None = Field(default=None, ge=8, le=24)
    is_rhyming: bool = False
