"""Story endpoints.

Spec ref: Ch8.4 - Story Endpoints
  POST /api/v1/stories/generate — Generate story from prompt (SSE)
  POST /api/v1/stories/from-template — Generate story from template (SSE)
  GET  /api/v1/stories/templates — Browse templates (paginated)
  GET  /api/v1/stories/templates/{id} — Template detail with preview
  PUT  /api/v1/stories/{id}/edit — Edit page text or request rewrite
  POST /api/v1/stories/{id}/edit-conversational — NL editing
  POST /api/v1/stories/{id}/regenerate-page — Regenerate a page
"""

from __future__ import annotations

import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.dependencies import get_current_user, get_db
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/stories", tags=["Stories"])


# ── Request / Response Schemas (inline) ───────────────────────────────────


class StoryGenerateRequest(BaseModel):
    """POST /api/v1/stories/generate"""
    child_id: uuid.UUID
    prompt: str = Field(min_length=1, max_length=2000)
    language: str = Field(default="en", max_length=5)
    age_range: str | None = Field(default=None, description="e.g. '3-5', '6-8'")
    is_rhyming: bool = False
    page_count: int = Field(default=12, ge=8, le=32)


class StoryFromTemplateRequest(BaseModel):
    """POST /api/v1/stories/from-template"""
    template_id: uuid.UUID
    child_id: uuid.UUID
    customizations: dict[str, Any] | None = None


class TemplateResponse(BaseModel):
    """Template listing item."""
    id: uuid.UUID
    title: str
    description: str
    category: str
    age_range: str
    language: str
    price: float
    rating: float
    is_rhyming: bool
    preview_url: str | None = None
    created_at: datetime


class TemplateDetailResponse(TemplateResponse):
    """Template detail with additional preview data."""
    author_name: str | None = None
    page_count: int = 12
    sample_pages: list[dict[str, Any]] = []
    reviews_count: int = 0


class StoryEditRequest(BaseModel):
    """PUT /api/v1/stories/{id}/edit"""
    page_number: int | None = Field(default=None, ge=1, description="Specific page to edit")
    new_text: str | None = Field(default=None, max_length=5000)
    full_rewrite: bool = False


class ConversationalEditRequest(BaseModel):
    """POST /api/v1/stories/{id}/edit-conversational"""
    instruction: str = Field(min_length=1, max_length=2000, description="e.g. 'make the story funnier'")


class RegeneratePageRequest(BaseModel):
    """POST /api/v1/stories/{id}/regenerate-page"""
    page_number: int = Field(ge=1)
    regenerate_text: bool = True
    regenerate_illustration: bool = True


class StoryEditResponse(BaseModel):
    """Response from story edit operations."""
    story_id: uuid.UUID
    updated_pages: list[dict[str, Any]]
    message: str


# ── SSE helper ────────────────────────────────────────────────────────────


async def _sse_progress_stream(story_id: uuid.UUID, phase_count: int = 5) -> Any:
    """Generate a mock SSE progress stream for story generation."""
    phases = [
        "Analyzing prompt",
        "Generating narrative arc",
        "Writing pages",
        "Applying cultural sensitivity checks",
        "Finalizing story",
    ]
    for i, phase in enumerate(phases[:phase_count]):
        event_data = {
            "event_type": "progress",
            "phase": i + 1,
            "phase_name": phase,
            "progress_percent": ((i + 1) / phase_count) * 100,
            "message": f"Phase {i + 1}: {phase}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        yield f"data: {json.dumps(event_data)}\n\n"
        await asyncio.sleep(0.1)

    # Final complete event
    complete_data = {
        "event_type": "complete",
        "phase": phase_count,
        "phase_name": "Complete",
        "progress_percent": 100.0,
        "message": "Story generation complete",
        "data": {"story_id": str(story_id)},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    yield f"data: {json.dumps(complete_data)}\n\n"


# ── POST /stories/generate ────────────────────────────────────────────────


@router.post(
    "/generate",
    summary="Generate story from prompt (SSE)",
    response_class=StreamingResponse,
)
async def generate_story(
    body: StoryGenerateRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> StreamingResponse:
    """Generate a story from a free-form prompt via the Orchestrator pipeline.

    Spec ref: Ch8.4 — POST /api/v1/stories/generate
    Returns an SSE stream with progress updates.
    """
    story_id = uuid.uuid4()
    return StreamingResponse(
        _sse_progress_stream(story_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Story-ID": str(story_id),
        },
    )


# ── POST /stories/from-template ──────────────────────────────────────────


@router.post(
    "/from-template",
    summary="Generate story from template (SSE)",
    response_class=StreamingResponse,
)
async def generate_from_template(
    body: StoryFromTemplateRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> StreamingResponse:
    """Generate a story from a template ID plus child profile.

    Spec ref: Ch8.4 — POST /api/v1/stories/from-template
    Returns an SSE stream.
    """
    story_id = uuid.uuid4()
    return StreamingResponse(
        _sse_progress_stream(story_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Story-ID": str(story_id),
        },
    )


# ── GET /stories/templates ────────────────────────────────────────────────


@router.get(
    "/templates",
    response_model=PaginatedResponse[TemplateResponse],
    summary="Browse story templates",
)
async def list_templates(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    category: str | None = Query(default=None),
    age_range: str | None = Query(default=None),
    language: str | None = Query(default=None),
    price_min: float | None = Query(default=None, ge=0),
    price_max: float | None = Query(default=None, ge=0),
    rating_min: float | None = Query(default=None, ge=0, le=5),
    is_rhyming: bool | None = Query(default=None),
    sort_by: str | None = Query(default=None),
) -> PaginatedResponse[TemplateResponse]:
    """Browse templates with filters.

    Spec ref: Ch8.4 — GET /api/v1/stories/templates
    Supports: category, age_range, language, price_range, rating_min, is_rhyming, sort_by.
    """
    # Placeholder: In production, query the templates table with applied filters.
    return PaginatedResponse(
        data=[],
        total=0,
        page=page,
        per_page=per_page,
        total_pages=0,
        has_next=False,
        has_prev=False,
    )


# ── GET /stories/templates/{id} ──────────────────────────────────────────


@router.get(
    "/templates/{template_id}",
    response_model=TemplateDetailResponse,
    summary="Get template detail",
)
async def get_template(
    template_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> TemplateDetailResponse:
    """Get template detail with preview.

    Spec ref: Ch8.4 — GET /api/v1/stories/templates/{id}
    """
    # Placeholder: In production, query the templates table by ID.
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Template not found",
    )


# ── PUT /stories/{id}/edit ────────────────────────────────────────────────


@router.put(
    "/{story_id}/edit",
    response_model=StoryEditResponse,
    summary="Edit story page text",
)
async def edit_story(
    story_id: uuid.UUID,
    body: StoryEditRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> StoryEditResponse:
    """Edit specific page text or request a full rewrite.

    Spec ref: Ch8.4 — PUT /api/v1/stories/{id}/edit
    """
    # Placeholder: In production, apply the edit to the story pages.
    return StoryEditResponse(
        story_id=story_id,
        updated_pages=[],
        message="Edit applied successfully",
    )


# ── POST /stories/{id}/edit-conversational ────────────────────────────────


@router.post(
    "/{story_id}/edit-conversational",
    response_model=StoryEditResponse,
    summary="Natural language story editing",
)
async def edit_conversational(
    story_id: uuid.UUID,
    body: ConversationalEditRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> StoryEditResponse:
    """Natural language editing (e.g. 'make the story funnier').

    Spec ref: Ch8.4 — POST /api/v1/stories/{id}/edit-conversational
    Returns updated pages.
    """
    # Placeholder: In production, send instruction to AI for story rewrite.
    return StoryEditResponse(
        story_id=story_id,
        updated_pages=[],
        message=f"Conversational edit applied: {body.instruction}",
    )


# ── POST /stories/{id}/regenerate-page ────────────────────────────────────


@router.post(
    "/{story_id}/regenerate-page",
    response_model=StoryEditResponse,
    summary="Regenerate a specific page",
)
async def regenerate_page(
    story_id: uuid.UUID,
    body: RegeneratePageRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> StoryEditResponse:
    """Regenerate a specific page (text and/or illustration).

    Spec ref: Ch8.4 — POST /api/v1/stories/{id}/regenerate-page
    """
    # Placeholder: In production, trigger regeneration of the specified page.
    return StoryEditResponse(
        story_id=story_id,
        updated_pages=[],
        message=f"Page {body.page_number} regeneration started",
    )
