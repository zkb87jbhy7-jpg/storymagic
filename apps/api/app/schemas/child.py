"""Child profile schemas with JSONB sub-schemas for physical traits and preferences.

Endpoints: /api/v1/children/*  (Chapter 8.3)
Maps to TypeScript: packages/shared-types/src/child.ts
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Enumerations ──────────────────────────────────────────────────────────────


class Gender(StrEnum):
    BOY = "boy"
    GIRL = "girl"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class FaceProcessingStatus(StrEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"
    EXPIRED = "expired"


# ── JSONB Sub-schemas ─────────────────────────────────────────────────────────


class PhysicalTraits(BaseModel):
    """Physical traits stored in children_profiles.physical_traits JSONB."""

    wheelchair: bool = False
    glasses: bool = False
    hearing_aid: bool = False
    skin_tone: str = ""
    hair_color: str = ""
    hair_style: str = ""
    custom_notes: str = ""


class PhysicalTraitsUpdate(BaseModel):
    """Partial update for physical traits."""

    wheelchair: bool | None = None
    glasses: bool | None = None
    hearing_aid: bool | None = None
    skin_tone: str | None = None
    hair_color: str | None = None
    hair_style: str | None = None
    custom_notes: str | None = None


class ChildPreferences(BaseModel):
    """Preferences stored in children_profiles.preferences JSONB."""

    family_structure: str = ""
    cultural_prefs: list[str] = Field(default_factory=list)
    accessibility_needs: list[str] = Field(default_factory=list)
    reading_prefs: list[str] = Field(default_factory=list)
    dietary_restrictions: list[str] = Field(default_factory=list)
    modesty_concerns: bool = False
    holiday_preferences: list[str] = Field(default_factory=list)
    pronouns: str = ""


class ChildPreferencesUpdate(BaseModel):
    """Partial update for child preferences."""

    family_structure: str | None = None
    cultural_prefs: list[str] | None = None
    accessibility_needs: list[str] | None = None
    reading_prefs: list[str] | None = None
    dietary_restrictions: list[str] | None = None
    modesty_concerns: bool | None = None
    holiday_preferences: list[str] | None = None
    pronouns: str | None = None


class CharacterSheetUrls(BaseModel):
    """Character sheet images generated from face embedding."""

    front: str
    profile: str
    three_quarter: str
    back: str


# ── Create / Update ──────────────────────────────────────────────────────────


class ChildCreate(BaseModel):
    """POST /api/v1/children

    Photo upload is handled via multipart form; this schema covers
    the JSON metadata portion.
    """

    name: str = Field(min_length=1, max_length=100)
    gender: Gender | None = None
    birth_date: date | None = None
    physical_traits: PhysicalTraits | None = None
    preferences: ChildPreferences | None = None

    @field_validator("birth_date")
    @classmethod
    def validate_age_range(cls, v: date | None) -> date | None:
        """Ensure the child is between 2 and 10 years old."""
        if v is None:
            return v
        from datetime import date as _date

        today = _date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 2:
            raise ValueError("Child must be at least 2 years old")
        if age > 10:
            raise ValueError("Child must be at most 10 years old")
        return v


class ChildUpdate(BaseModel):
    """PUT /api/v1/children/{id}"""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    gender: Gender | None = None
    birth_date: date | None = None
    physical_traits: PhysicalTraitsUpdate | None = None
    preferences: ChildPreferencesUpdate | None = None

    @field_validator("birth_date")
    @classmethod
    def validate_age_range(cls, v: date | None) -> date | None:
        if v is None:
            return v
        from datetime import date as _date

        today = _date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 2:
            raise ValueError("Child must be at least 2 years old")
        if age > 10:
            raise ValueError("Child must be at most 10 years old")
        return v


# ── Response ──────────────────────────────────────────────────────────────────


class ChildResponse(BaseModel):
    """Full child profile returned by GET/POST/PUT endpoints."""

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    gender: Gender | None = None
    birth_date: date | None = None
    physical_traits: PhysicalTraits
    preferences: ChildPreferences
    face_embedding_ref: str | None = None
    character_sheet_urls: CharacterSheetUrls | None = None
    photos_expiry_date: datetime | None = None
    photos_count: int = 0
    face_processing_status: FaceProcessingStatus
    face_embedding_expiry: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FaceStatusResponse(BaseModel):
    """GET /api/v1/children/{id}/face-status — lightweight polling response."""

    child_id: uuid.UUID
    face_processing_status: FaceProcessingStatus
    character_sheet_urls: CharacterSheetUrls | None = None
    progress_percent: float | None = Field(default=None, ge=0.0, le=100.0)
    error_message: str | None = None

    model_config = ConfigDict(from_attributes=True)
