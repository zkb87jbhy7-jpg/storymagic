"""Story template schemas with full filter support.

Endpoints: /api/v1/stories/templates/*, /api/v1/marketplace/templates/*  (Chapters 8.4 & 8.13)
Maps to TypeScript: packages/shared-types/src/template.ts
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Enumerations ──────────────────────────────────────────────────────────────


class TemplateStatus(StrEnum):
    DRAFT = "draft"
    REVIEW = "review"
    PUBLISHED = "published"
    SUSPENDED = "suspended"


class TemplateSortBy(StrEnum):
    RATING = "rating"
    POPULARITY = "popularity"
    NEWEST = "newest"
    PRICE_ASC = "price_asc"
    PRICE_DESC = "price_desc"


# ── Sub-schemas ───────────────────────────────────────────────────────────────


class SceneInteractiveElement(BaseModel):
    type: str
    content: str


class SceneDefinition(BaseModel):
    """Individual scene within a template."""

    scene_number: int = Field(ge=1)
    text: str
    illustration_hint: str
    animation_preset: str | None = None
    interactive_elements: list[SceneInteractiveElement] | None = None
    placeholder_markers: list[str] = Field(default_factory=list)


class SEOMetadata(BaseModel):
    title: str = ""
    description: str = ""
    tags: list[str] = Field(default_factory=list)
    og_image: str | None = None
    structured_data: dict[str, object] | None = None


class SEOMetadataUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    tags: list[str] | None = None
    og_image: str | None = None
    structured_data: dict[str, object] | None = None


# ── Filter ────────────────────────────────────────────────────────────────────


class TemplateFilter(BaseModel):
    """GET /api/v1/stories/templates — query params (Chapter 8.4).

    All fields are optional; acts as a multi-criteria filter.
    """

    category: str | None = None
    age_range_min: int | None = Field(default=None, ge=2, le=10)
    age_range_max: int | None = Field(default=None, ge=2, le=10)
    language: str | None = None
    price_min: float | None = Field(default=None, ge=0.0)
    price_max: float | None = None
    rating_min: float | None = Field(default=None, ge=0.0, le=5.0)
    is_rhyming: bool | None = None
    sort_by: TemplateSortBy = TemplateSortBy.POPULARITY
    # Pagination delegated to PaginationParams but included here for convenience
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)

    @field_validator("age_range_max")
    @classmethod
    def max_gte_min(cls, v: int | None, info: object) -> int | None:
        data = getattr(info, "data", {})
        age_min = data.get("age_range_min")
        if v is not None and age_min is not None and v < age_min:
            raise ValueError("age_range_max must be >= age_range_min")
        return v


# ── Create / Update ──────────────────────────────────────────────────────────


class TemplateCreate(BaseModel):
    """POST /api/v1/stories/templates (or /api/v1/creators/templates)"""

    title: str = Field(min_length=1, max_length=200)
    title_he: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    description_he: str | None = Field(default=None, max_length=2000)
    category: str = Field(min_length=1, max_length=100)
    age_range_min: int = Field(default=2, ge=2, le=10)
    age_range_max: int = Field(default=10, ge=2, le=10)
    language: str = Field(default="en", max_length=5)
    is_rhyming: bool = False
    scene_definitions: list[SceneDefinition] = Field(min_length=1)
    cover_image_url: str | None = None
    price: float = Field(default=0.0, ge=0.0)
    seo_metadata: SEOMetadata | None = None

    @field_validator("age_range_max")
    @classmethod
    def max_gte_min(cls, v: int, info: object) -> int:
        data = getattr(info, "data", {})
        age_min = data.get("age_range_min", 2)
        if v < age_min:
            raise ValueError("age_range_max must be >= age_range_min")
        return v


class TemplateUpdate(BaseModel):
    """PUT /api/v1/creators/templates/{id}"""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    title_he: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    description_he: str | None = Field(default=None, max_length=2000)
    category: str | None = None
    age_range_min: int | None = Field(default=None, ge=2, le=10)
    age_range_max: int | None = Field(default=None, ge=2, le=10)
    language: str | None = Field(default=None, max_length=5)
    is_rhyming: bool | None = None
    scene_definitions: list[SceneDefinition] | None = None
    cover_image_url: str | None = None
    price: float | None = Field(default=None, ge=0.0)
    seo_metadata: SEOMetadataUpdate | None = None


# ── Response ──────────────────────────────────────────────────────────────────


class TemplateResponse(BaseModel):
    """Full template representation."""

    id: uuid.UUID
    creator_id: uuid.UUID | None = None
    title: str
    title_he: str | None = None
    description: str | None = None
    description_he: str | None = None
    category: str
    age_range_min: int
    age_range_max: int
    language: str
    is_rhyming: bool
    scene_definitions: list[SceneDefinition]
    cover_image_url: str | None = None
    status: TemplateStatus
    rating: float = 0.0
    rating_count: int = 0
    purchase_count: int = 0
    price: float = 0.0
    seo_metadata: SEOMetadata
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Marketplace extras ────────────────────────────────────────────────────────


class TemplateReviewCreate(BaseModel):
    """POST /api/v1/marketplace/templates/{id}/review"""

    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)


class TemplateReportCreate(BaseModel):
    """POST /api/v1/marketplace/templates/{id}/report"""

    reason: str = Field(min_length=1, max_length=500)
    details: str | None = Field(default=None, max_length=2000)
