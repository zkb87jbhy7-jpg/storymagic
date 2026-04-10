"""Book page schemas.

Endpoints: /api/v1/stories/{id}/regenerate-page, page responses within book detail
Maps to TypeScript: packages/shared-types/src/page.ts
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


# ── Enumerations ──────────────────────────────────────────────────────────────


class LayoutType(StrEnum):
    FULL_ILLUSTRATION_TEXT_OVERLAY = "full_illustration_text_overlay"
    TOP_ILLUSTRATION_BOTTOM_TEXT = "top_illustration_bottom_text"
    SIDE_BY_SIDE = "side_by_side"
    FULL_SPREAD = "full_spread"
    TEXT_ONLY_DECORATIVE_BORDER = "text_only_decorative_border"


class AnimationPreset(StrEnum):
    FALLING_LEAVES = "falling_leaves"
    TWINKLING_STARS = "twinkling_stars"
    FLOATING_BUBBLES = "floating_bubbles"
    GENTLE_RAIN = "gentle_rain"
    SNOWFALL = "snowfall"
    FIREFLIES = "fireflies"


class InteractiveElementType(StrEnum):
    TAPPABLE = "tappable"
    SEARCH_AND_FIND = "search_and_find"
    QUIZ = "quiz"


class SpeakerEmotion(StrEnum):
    HAPPY = "happy"
    SCARED = "scared"
    WHISPERING = "whispering"
    SHOUTING = "shouting"
    SINGING = "singing"
    BRAVE = "brave"
    GENTLE = "gentle"


class Pace(StrEnum):
    SLOW = "slow"
    NORMAL = "normal"
    FAST = "fast"


class ReadingBuddyQuestionType(StrEnum):
    POINTING = "pointing"
    PREDICTION = "prediction"
    ANALYTICAL = "analytical"


# ── JSONB Sub-schemas ─────────────────────────────────────────────────────────


class InteractiveElementPosition(BaseModel):
    x: float
    y: float
    w: float
    h: float


class InteractiveElement(BaseModel):
    type: InteractiveElementType
    position: InteractiveElementPosition
    content: str
    sound_effect: str | None = None


class PerformanceMarkup(BaseModel):
    """Voice narration markup for a page."""

    speaker: str
    emotion: SpeakerEmotion
    pace: Pace = Pace.NORMAL
    pause_before: float = 0.0
    pause_after: float = 0.0
    emphasized_words: list[int] = Field(default_factory=list)
    sound_effect: str | None = None


class ReadingBuddyQuestion(BaseModel):
    question: str
    type: ReadingBuddyQuestionType
    answer_hint: str


# ── Response ──────────────────────────────────────────────────────────────────


class PageResponse(BaseModel):
    """Full page representation within a book."""

    id: uuid.UUID
    book_id: uuid.UUID
    page_number: int
    text_primary: str
    text_secondary: str | None = None
    illustration_url: str | None = None
    illustration_thumbnail_url: str | None = None
    illustration_print_url: str | None = None
    illustration_prompt: str | None = None
    illustration_negative_prompt: str | None = None
    layout_type: LayoutType | None = None
    animation_preset: AnimationPreset | None = None
    interactive_elements: list[InteractiveElement] | None = None
    performance_markup: PerformanceMarkup | None = None
    alt_text: str | None = None
    alt_text_secondary: str | None = None
    fun_facts: list[str] | None = None
    reading_buddy_question: ReadingBuddyQuestion | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Edit / Regenerate ─────────────────────────────────────────────────────────


class PageEditRequest(BaseModel):
    """Edit a specific page's text or request illustration regeneration."""

    text_primary: str | None = Field(default=None, max_length=5000)
    text_secondary: str | None = Field(default=None, max_length=5000)
    layout_type: LayoutType | None = None
    regenerate_illustration: bool = False


class PageRegenerateRequest(BaseModel):
    """POST /api/v1/stories/{id}/regenerate-page"""

    page_number: int = Field(ge=1)
    regenerate_text: bool = False
    regenerate_illustration: bool = True
    text_guidance: str | None = Field(
        default=None,
        max_length=1000,
        description="Optional instruction for text regeneration",
    )
    illustration_guidance: str | None = Field(
        default=None,
        max_length=1000,
        description="Optional instruction for illustration regeneration",
    )
