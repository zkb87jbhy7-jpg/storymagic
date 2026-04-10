"""Voice endpoints.

Spec ref: Ch8.6 - Voice Endpoints
  POST   /api/v1/voice/generate — Generate voice narration
  POST   /api/v1/voice/clone — Upload recording for voice cloning
  GET    /api/v1/voice/presets — List preset voices
  POST   /api/v1/voice/family/record — Save family voice recording
  GET    /api/v1/voice/family — List family voice profiles
  DELETE /api/v1/voice/family/{id} — Delete family voice profile
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field

from app.dependencies import get_current_user

router = APIRouter(prefix="/voice", tags=["Voice"])


# ── Request / Response Schemas (inline) ───────────────────────────────────


class VoiceGenerateRequest(BaseModel):
    """POST /api/v1/voice/generate"""
    book_id: uuid.UUID
    voice_id: str | None = Field(default=None, description="Preset or cloned voice ID")
    language: str = Field(default="en", max_length=5)
    speed: float = Field(default=1.0, ge=0.5, le=2.0)
    use_performance_markup: bool = True


class VoiceGenerateResponse(BaseModel):
    """Voice narration generation response."""
    id: uuid.UUID
    book_id: uuid.UUID
    audio_url: str | None = None
    duration_seconds: float | None = None
    status: str  # pending, processing, ready, failed
    created_at: datetime


class VoiceCloneRequest(BaseModel):
    """POST /api/v1/voice/clone — metadata portion."""
    name: str = Field(min_length=1, max_length=100)
    language: str = Field(default="en", max_length=5)


class VoiceCloneResponse(BaseModel):
    """Voice clone status response."""
    id: uuid.UUID
    name: str
    status: str  # pending, processing, ready, failed
    estimated_ready_at: datetime | None = None
    created_at: datetime


class VoicePresetResponse(BaseModel):
    """Preset voice with preview."""
    id: str
    name: str
    language: str
    gender: str
    age_group: str  # child, teen, adult, elderly
    preview_url: str
    description: str | None = None


class FamilyVoiceRecordRequest(BaseModel):
    """POST /api/v1/voice/family/record — metadata portion."""
    name: str = Field(min_length=1, max_length=100, description="e.g. 'Mom', 'Grandpa'")
    relationship: str = Field(min_length=1, max_length=50)


class FamilyVoiceResponse(BaseModel):
    """Family voice profile response."""
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    relationship: str
    status: str  # pending, processing, ready, failed
    audio_url: str | None = None
    created_at: datetime


# ── POST /voice/generate ──────────────────────────────────────────────────


@router.post(
    "/generate",
    response_model=VoiceGenerateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate voice narration for a book",
)
async def generate_voice(
    body: VoiceGenerateRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> VoiceGenerateResponse:
    """Generate voice narration for a book with Performance Markup.

    Spec ref: Ch8.6 — POST /api/v1/voice/generate
    Returns audio URL when complete.
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, dispatch to ElevenLabs/Cartesia pipeline.
    return VoiceGenerateResponse(
        id=uuid.uuid4(),
        book_id=body.book_id,
        audio_url=None,
        duration_seconds=None,
        status="processing",
        created_at=now,
    )


# ── POST /voice/clone ────────────────────────────────────────────────────


@router.post(
    "/clone",
    response_model=VoiceCloneResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload recording for voice cloning",
)
async def clone_voice(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    recording: UploadFile = File(..., description="Audio recording for voice cloning"),
    name: str = "My Voice",
    language: str = "en",
) -> VoiceCloneResponse:
    """Upload a recording for voice cloning.

    Spec ref: Ch8.6 — POST /api/v1/voice/clone
    Returns clone status.
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, upload audio to voice provider and start cloning.
    return VoiceCloneResponse(
        id=uuid.uuid4(),
        name=name,
        status="processing",
        estimated_ready_at=None,
        created_at=now,
    )


# ── GET /voice/presets ────────────────────────────────────────────────────


@router.get(
    "/presets",
    response_model=list[VoicePresetResponse],
    summary="List available preset voices",
)
async def list_presets(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> list[VoicePresetResponse]:
    """List available preset voices with previews.

    Spec ref: Ch8.6 — GET /api/v1/voice/presets
    """
    # Placeholder: In production, fetch from voice provider catalog or DB cache.
    return [
        VoicePresetResponse(
            id="preset_warm_female",
            name="Warm Storyteller",
            language="en",
            gender="female",
            age_group="adult",
            preview_url="/static/voice-previews/warm-storyteller.mp3",
            description="A warm, nurturing voice perfect for bedtime stories",
        ),
        VoicePresetResponse(
            id="preset_playful_male",
            name="Playful Narrator",
            language="en",
            gender="male",
            age_group="adult",
            preview_url="/static/voice-previews/playful-narrator.mp3",
            description="An energetic, playful voice for adventure stories",
        ),
    ]


# ── POST /voice/family/record ────────────────────────────────────────────


@router.post(
    "/family/record",
    response_model=FamilyVoiceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save family member voice recording",
)
async def record_family_voice(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    recording: UploadFile = File(..., description="Family member voice recording"),
    name: str = "Family Voice",
    relationship: str = "parent",
) -> FamilyVoiceResponse:
    """Save a family member voice recording.

    Spec ref: Ch8.6 — POST /api/v1/voice/family/record
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, upload to voice provider for processing.
    return FamilyVoiceResponse(
        id=uuid.uuid4(),
        user_id=uuid.UUID(str(current_user["id"])),
        name=name,
        relationship=relationship,
        status="processing",
        audio_url=None,
        created_at=now,
    )


# ── GET /voice/family ────────────────────────────────────────────────────


@router.get(
    "/family",
    response_model=list[FamilyVoiceResponse],
    summary="List family voice profiles",
)
async def list_family_voices(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> list[FamilyVoiceResponse]:
    """List all family voice profiles for the authenticated user.

    Spec ref: Ch8.6 — GET /api/v1/voice/family
    """
    # Placeholder: In production, query the family_voices table.
    return []


# ── DELETE /voice/family/{id} ─────────────────────────────────────────────


@router.delete(
    "/family/{voice_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete family voice profile",
)
async def delete_family_voice(
    voice_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> None:
    """Delete a family voice profile.

    Spec ref: Ch8.6 — DELETE /api/v1/voice/family/{id}
    """
    # Placeholder: In production, delete from DB and voice provider.
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Family voice profile not found",
    )
