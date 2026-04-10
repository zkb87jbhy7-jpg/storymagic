"""Book schemas for creation, response, preview, interactive data, and editing.

Endpoints: /api/v1/books/*  and  /api/v1/stories/*  (Chapters 8.4 & 8.7)
Maps to TypeScript: packages/shared-types/src/book.ts
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


# ── Enumerations ──────────────────────────────────────────────────────────────


class BookStatus(StrEnum):
    DRAFT = "draft"
    GENERATING = "generating"
    PREVIEW = "preview"
    APPROVED = "approved"
    ORDERED = "ordered"
    PRINTING = "printing"
    SHIPPED = "shipped"


class CreationMethod(StrEnum):
    FREE_PROMPT = "free_prompt"
    TEMPLATE = "template"
    CO_CREATION = "co_creation"
    DREAM = "dream"
    REMIX = "remix"


class MoodSetting(StrEnum):
    ADVENTUROUS = "adventurous"
    CALM = "calm"
    FUNNY = "funny"
    SCARY = "scary"
    EDUCATIONAL = "educational"
    BEDTIME = "bedtime"
    EMPOWERING = "empowering"
    EMOTIONAL = "emotional"


class IllustrationStyle(StrEnum):
    WATERCOLOR = "watercolor"
    COMIC_BOOK = "comic_book"
    PIXAR_3D = "3d_pixar"
    RETRO_VINTAGE = "retro_vintage"
    MINIMALIST = "minimalist"
    OIL_PAINTING = "oil_painting"
    FANTASY = "fantasy"
    MANGA = "manga"
    CLASSIC_STORYBOOK = "classic_storybook"
    WHIMSICAL = "whimsical"


# ── Quality sub-schemas ───────────────────────────────────────────────────────


class PageQualityScore(BaseModel):
    page: int
    text_score: float = Field(ge=0.0, le=1.0)
    illustration_score: float = Field(ge=0.0, le=1.0)
    likeness_score: float = Field(ge=0.0, le=1.0)


class QualityScores(BaseModel):
    overall: float = Field(ge=0.0, le=1.0)
    per_page: list[PageQualityScore] = Field(default_factory=list)
    consistency_score: float = Field(ge=0.0, le=1.0)


# ── Illustration entry ────────────────────────────────────────────────────────


class BookIllustrationEntry(BaseModel):
    url: str
    thumbnail_url: str
    print_url: str


# ── Parental guide ────────────────────────────────────────────────────────────


class ParentalGuideActivity(BaseModel):
    activity: str
    materials: list[str] = Field(default_factory=list)


class ParentalGuideData(BaseModel):
    summary: str
    educational_value: str
    discussion_questions: list[str] = Field(default_factory=list)
    activities: list[ParentalGuideActivity] = Field(default_factory=list)
    emotional_notes: list[str] = Field(default_factory=list)


# ── Co-creation ───────────────────────────────────────────────────────────────


class CoCreationStep(BaseModel):
    step: int
    question: str
    child_response: str
    timestamp: str


# ── Reading progress ──────────────────────────────────────────────────────────


class ReadingProgress(BaseModel):
    book_id: uuid.UUID
    current_page: int = Field(ge=0)
    total_pages: int = Field(ge=0)
    bookmarks: list[int] = Field(default_factory=list)
    last_read_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class ReadingProgressUpdate(BaseModel):
    current_page: int = Field(ge=0)
    bookmarks: list[int] | None = None


# ── Create ────────────────────────────────────────────────────────────────────


class BookCreate(BaseModel):
    """POST /api/v1/books/create

    Supports both free-prompt and template-based creation.
    Exactly one of ``free_prompt`` or ``story_template_id`` should be provided.
    """

    child_profile_ids: list[uuid.UUID] = Field(min_length=1, max_length=4)
    story_template_id: uuid.UUID | None = None
    free_prompt: str | None = Field(default=None, max_length=2000)
    illustration_style: IllustrationStyle | None = None
    mood_setting: MoodSetting | None = None
    creation_method: CreationMethod
    is_bilingual: bool = False
    secondary_language: str | None = Field(default=None, max_length=5)
    voice_profile_id: uuid.UUID | None = None
    page_count: int | None = Field(default=None, ge=8, le=24)
    is_rhyming: bool = False
    language: str = Field(default="en", max_length=5)


# ── Response ──────────────────────────────────────────────────────────────────


class BookResponse(BaseModel):
    """Full book representation returned by detail endpoints."""

    id: uuid.UUID
    user_id: uuid.UUID
    child_profile_ids: list[uuid.UUID]
    story_template_id: uuid.UUID | None = None
    free_prompt: str | None = None
    title: str | None = None
    generated_story: dict[str, object] | None = None
    illustration_style: IllustrationStyle | None = None
    character_sheet_ref: str | None = None
    illustrations: dict[int, BookIllustrationEntry] | None = None
    voice_narration_url: str | None = None
    voice_profile_id: uuid.UUID | None = None
    interactive_book_data: dict[str, object] | None = None
    print_ready_pdf_url: str | None = None
    digital_pdf_url: str | None = None
    parental_guide: ParentalGuideData | None = None
    quality_scores: QualityScores | None = None
    status: BookStatus
    generation_workflow_id: str | None = None
    is_living_book: bool = False
    is_bilingual: bool = False
    secondary_language: str | None = None
    mood_setting: MoodSetting | None = None
    creation_method: CreationMethod | None = None
    co_creation_journey: list[CoCreationStep] | None = None
    book_dna_pattern: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Preview ───────────────────────────────────────────────────────────────────


class PageThumbnail(BaseModel):
    page_number: int
    thumbnail_url: str
    text_preview: str


class BookPreview(BaseModel):
    """GET /api/v1/books/{id}/preview"""

    id: uuid.UUID
    title: str | None = None
    illustration_style: IllustrationStyle | None = None
    status: BookStatus
    cover_thumbnail_url: str | None = None
    page_thumbnails: list[PageThumbnail] = Field(default_factory=list)
    total_pages: int = 0
    quality_scores: QualityScores | None = None

    model_config = ConfigDict(from_attributes=True)


# ── Interactive book data ─────────────────────────────────────────────────────


class InteractiveBookData(BaseModel):
    """GET /api/v1/books/{id}/interactive — full data for the reader."""

    id: uuid.UUID
    title: str
    pages: list[dict[str, object]] = Field(
        default_factory=list,
        description="Full page data with text, illustrations, animations, interactive elements",
    )
    voice_narration_url: str | None = None
    parental_guide: ParentalGuideData | None = None
    is_bilingual: bool = False
    secondary_language: str | None = None
    total_pages: int = 0

    model_config = ConfigDict(from_attributes=True)


# ── Edit ──────────────────────────────────────────────────────────────────────


class BookEditRequest(BaseModel):
    """PUT /api/v1/stories/{id}/edit — edit a specific page."""

    page_number: int = Field(ge=1)
    new_text: str | None = Field(default=None, max_length=5000)
    request_illustration_regeneration: bool = False
    full_rewrite: bool = False


class ConversationalEditRequest(BaseModel):
    """POST /api/v1/stories/{id}/edit-conversational

    Natural-language editing, e.g. "make the story funnier".
    """

    instruction: str = Field(min_length=1, max_length=2000)
    scope: str = Field(
        default="full",
        description="'full' for whole book, or 'page:<n>' for a specific page",
    )


# ── Living Book ───────────────────────────────────────────────────────────────


class LivingBookToggle(BaseModel):
    """POST /api/v1/books/{id}/living-book/toggle"""

    enabled: bool


class LivingBookAddChapter(BaseModel):
    """POST /api/v1/books/{id}/living-book/add-chapter"""

    prompt: str = Field(min_length=1, max_length=2000)
    mood_setting: MoodSetting | None = None


# ── Extras / Ancillary ────────────────────────────────────────────────────────


class BookExtraType(StrEnum):
    COLORING_PAGES = "coloring_pages"
    ACTIVITY_BOOK = "activity_book"
    POSTER = "poster"
    STICKER_SHEET = "sticker_sheet"


class BookExtraGenerateRequest(BaseModel):
    """POST /api/v1/books/{id}/extras/generate"""

    extra_type: BookExtraType


class BookExtraResponse(BaseModel):
    extra_type: BookExtraType
    url: str
    thumbnail_url: str | None = None
    status: str = "ready"

    model_config = ConfigDict(from_attributes=True)
