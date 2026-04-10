"""Illustration endpoints.

Spec ref: Ch8.5 - Illustration Endpoints
  POST /api/v1/illustrations/generate — Generate all illustrations (SSE)
  POST /api/v1/illustrations/{id}/edit — Edit illustration via NL chat
  POST /api/v1/illustrations/{id}/regenerate — Full regeneration
  POST /api/v1/illustrations/{id}/repair — Targeted repair of anomaly
  GET  /api/v1/illustrations/{id}/status — Generation status
"""

from __future__ import annotations

import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.dependencies import get_current_user

router = APIRouter(prefix="/illustrations", tags=["Illustrations"])


# ── Request / Response Schemas (inline) ───────────────────────────────────


class IllustrationGenerateRequest(BaseModel):
    """POST /api/v1/illustrations/generate"""
    book_id: uuid.UUID
    style: str | None = Field(default=None, description="Illustration style override")
    art_style: str | None = Field(default=None, description="e.g. 'watercolor', 'digital'")


class IllustrationEditRequest(BaseModel):
    """POST /api/v1/illustrations/{id}/edit"""
    instruction: str = Field(min_length=1, max_length=2000, description="NL edit instruction")


class IllustrationRegenerateRequest(BaseModel):
    """POST /api/v1/illustrations/{id}/regenerate"""
    style_override: str | None = None
    preserve_composition: bool = False


class IllustrationRepairRequest(BaseModel):
    """POST /api/v1/illustrations/{id}/repair"""
    anomaly_type: str = Field(description="e.g. 'extra_fingers', 'face_distortion', 'color_mismatch'")
    region: dict[str, float] | None = Field(default=None, description="Bounding box of anomaly")


class IllustrationResponse(BaseModel):
    """Standard illustration response."""
    id: uuid.UUID
    book_id: uuid.UUID
    page_number: int
    image_url: str | None = None
    thumbnail_url: str | None = None
    status: str
    quality_score: float | None = None
    created_at: datetime
    updated_at: datetime


class IllustrationStatusResponse(BaseModel):
    """GET /api/v1/illustrations/{id}/status"""
    id: uuid.UUID
    status: str  # pending, processing, ready, failed
    progress_percent: float | None = None
    image_url: str | None = None
    error_message: str | None = None


# ── SSE helper ────────────────────────────────────────────────────────────


async def _illustration_sse_stream(book_id: uuid.UUID, page_count: int = 12) -> Any:
    """Generate a mock SSE stream for illustration generation."""
    for i in range(page_count):
        event_data = {
            "event_type": "page_complete" if i < page_count - 1 else "complete",
            "phase": i + 1,
            "phase_name": f"Illustrating page {i + 1}",
            "progress_percent": ((i + 1) / page_count) * 100,
            "message": f"Page {i + 1}/{page_count} illustration complete",
            "data": {"page_number": i + 1, "book_id": str(book_id)},
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        yield f"data: {json.dumps(event_data)}\n\n"
        await asyncio.sleep(0.1)


# ── POST /illustrations/generate ──────────────────────────────────────────


@router.post(
    "/generate",
    summary="Generate all illustrations for a book (SSE)",
    response_class=StreamingResponse,
)
async def generate_illustrations(
    body: IllustrationGenerateRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> StreamingResponse:
    """Generate all illustrations for a book.

    Spec ref: Ch8.5 — POST /api/v1/illustrations/generate
    Returns SSE stream with per-page progress.
    """
    return StreamingResponse(
        _illustration_sse_stream(body.book_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Book-ID": str(body.book_id),
        },
    )


# ── POST /illustrations/{id}/edit ─────────────────────────────────────────


@router.post(
    "/{illustration_id}/edit",
    response_model=IllustrationResponse,
    summary="Edit illustration via natural language",
)
async def edit_illustration(
    illustration_id: uuid.UUID,
    body: IllustrationEditRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> IllustrationResponse:
    """Edit specific illustration via natural language chat.

    Spec ref: Ch8.5 — POST /api/v1/illustrations/{id}/edit
    Returns updated illustration.
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, dispatch edit to ComfyUI pipeline.
    return IllustrationResponse(
        id=illustration_id,
        book_id=uuid.uuid4(),
        page_number=1,
        image_url=None,
        thumbnail_url=None,
        status="processing",
        quality_score=None,
        created_at=now,
        updated_at=now,
    )


# ── POST /illustrations/{id}/regenerate ───────────────────────────────────


@router.post(
    "/{illustration_id}/regenerate",
    response_model=IllustrationResponse,
    summary="Regenerate illustration",
)
async def regenerate_illustration(
    illustration_id: uuid.UUID,
    body: IllustrationRegenerateRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> IllustrationResponse:
    """Full regeneration of an illustration.

    Spec ref: Ch8.5 — POST /api/v1/illustrations/{id}/regenerate
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, trigger full re-generation via ComfyUI.
    return IllustrationResponse(
        id=illustration_id,
        book_id=uuid.uuid4(),
        page_number=1,
        image_url=None,
        thumbnail_url=None,
        status="processing",
        quality_score=None,
        created_at=now,
        updated_at=now,
    )


# ── POST /illustrations/{id}/repair ──────────────────────────────────────


@router.post(
    "/{illustration_id}/repair",
    response_model=IllustrationResponse,
    summary="Repair illustration anomaly",
)
async def repair_illustration(
    illustration_id: uuid.UUID,
    body: IllustrationRepairRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> IllustrationResponse:
    """Targeted repair of an illustration anomaly (e.g. extra fingers).

    Spec ref: Ch8.5 — POST /api/v1/illustrations/{id}/repair
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, use inpainting pipeline for targeted repair.
    return IllustrationResponse(
        id=illustration_id,
        book_id=uuid.uuid4(),
        page_number=1,
        image_url=None,
        thumbnail_url=None,
        status="processing",
        quality_score=None,
        created_at=now,
        updated_at=now,
    )


# ── GET /illustrations/{id}/status ────────────────────────────────────────


@router.get(
    "/{illustration_id}/status",
    response_model=IllustrationStatusResponse,
    summary="Get illustration generation status",
)
async def get_illustration_status(
    illustration_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> IllustrationStatusResponse:
    """Get generation status for an illustration (poll endpoint).

    Spec ref: Ch8.5 — GET /api/v1/illustrations/{id}/status
    """
    # Placeholder: In production, query status from DB or Temporal workflow.
    return IllustrationStatusResponse(
        id=illustration_id,
        status="pending",
        progress_percent=0.0,
        image_url=None,
        error_message=None,
    )
