"""Recommendation and seasonal content schemas.

Endpoints: /api/v1/recommendations/*, /api/v1/seasonal  (Chapter 8.18)
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from .book import IllustrationStyle, MoodSetting


# ── Recommendation ────────────────────────────────────────────────────────────


class RecommendedTemplate(BaseModel):
    """Single template recommendation with relevance scoring."""

    template_id: uuid.UUID
    title: str
    category: str
    illustration_style: IllustrationStyle | None = None
    cover_image_url: str | None = None
    rating: float = 0.0
    price: float = 0.0
    relevance_score: float = Field(ge=0.0, le=1.0)
    reason: str = Field(
        description="Human-readable explanation, e.g. 'Based on recent bedtime stories'",
    )


class RecommendedPrompt(BaseModel):
    """Suggested free-form prompt for story creation."""

    prompt: str
    mood_setting: MoodSetting | None = None
    category: str
    reason: str


class RecommendationResponse(BaseModel):
    """GET /api/v1/recommendations/{childId}"""

    child_id: uuid.UUID
    templates: list[RecommendedTemplate] = Field(default_factory=list)
    suggested_prompts: list[RecommendedPrompt] = Field(default_factory=list)
    based_on_reading_history: bool = False
    based_on_preferences: bool = False
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Seasonal Content ──────────────────────────────────────────────────────────


class SeasonalTemplate(BaseModel):
    """Template highlighted for a seasonal event."""

    template_id: uuid.UUID
    title: str
    category: str
    cover_image_url: str | None = None
    price: float = 0.0
    seasonal_tag: str


class SeasonalContent(BaseModel):
    """GET /api/v1/seasonal"""

    season: str = Field(description="e.g. 'spring', 'hanukkah', 'back_to_school'")
    title: str
    description: str | None = None
    banner_image_url: str | None = None
    templates: list[SeasonalTemplate] = Field(default_factory=list)
    suggested_prompts: list[RecommendedPrompt] = Field(default_factory=list)
    start_date: datetime | None = None
    end_date: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
