"""Voice narration schemas.

Endpoints: /api/v1/voice/*  (Chapter 8.6)
Maps to TypeScript: packages/shared-types/src/voice.ts
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field

from .page import PerformanceMarkup


# ── Enumerations ──────────────────────────────────────────────────────────────


class VoiceType(StrEnum):
    PRESET = "preset"
    FAMILY = "family"


class CloneStatus(StrEnum):
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


# ── Generate ──────────────────────────────────────────────────────────────────


class VoiceGenerateRequest(BaseModel):
    """POST /api/v1/voice/generate — generate narration for a book."""

    book_id: uuid.UUID
    voice_profile_id: uuid.UUID
    language: str = Field(default="en", max_length=5)
    performance_markup_overrides: list[PerformanceMarkup] | None = Field(
        default=None,
        description="Optional per-page overrides; if omitted the book's markup is used",
    )


class VoiceGenerateResponse(BaseModel):
    audio_url: str
    duration_seconds: float = Field(ge=0.0)
    book_id: uuid.UUID
    voice_profile_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


# ── Clone ─────────────────────────────────────────────────────────────────────


class VoiceCloneRequest(BaseModel):
    """POST /api/v1/voice/clone — upload recording for voice cloning.

    The actual audio file is sent via multipart form; this schema covers metadata.
    """

    name: str = Field(min_length=1, max_length=100)
    language: str = Field(default="en", max_length=5)


class VoiceCloneResponse(BaseModel):
    id: uuid.UUID
    name: str
    clone_status: CloneStatus
    estimated_ready_seconds: int | None = None

    model_config = ConfigDict(from_attributes=True)


# ── Presets ───────────────────────────────────────────────────────────────────


class VoicePresetResponse(BaseModel):
    """GET /api/v1/voice/presets"""

    id: uuid.UUID
    name: str
    type: VoiceType = VoiceType.PRESET
    language: str | None = None
    gender: str | None = None
    age_range: str | None = None
    preview_audio_url: str | None = None
    provider: str | None = None

    model_config = ConfigDict(from_attributes=True)


# ── Family Voice ──────────────────────────────────────────────────────────────


class FamilyVoiceCreate(BaseModel):
    """POST /api/v1/voice/family/record — save family member voice.

    The actual audio is multipart; this schema covers metadata.
    """

    name: str = Field(min_length=1, max_length=100)
    family_role: str = Field(
        min_length=1,
        max_length=50,
        description="e.g. 'grandma', 'uncle', 'mom'",
    )
    language: str = Field(default="en", max_length=5)


class FamilyVoiceResponse(BaseModel):
    """Returned by POST /api/v1/voice/family/record and GET /api/v1/voice/family."""

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    type: VoiceType = VoiceType.FAMILY
    family_role: str | None = None
    language: str | None = None
    gender: str | None = None
    preview_audio_url: str | None = None
    original_recording_url: str | None = None
    clone_status: CloneStatus | None = None
    quality_score: float | None = Field(default=None, ge=0.0, le=1.0)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
