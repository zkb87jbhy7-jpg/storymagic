"""Dream endpoints.

Spec ref: Ch8.17 - Dream Endpoints
  POST /api/v1/dreams — Save a dream
  GET  /api/v1/dreams — List dreams for a child
  POST /api/v1/dreams/{id}/create-book — Convert dream to book
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field

from app.dependencies import get_current_user
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/dreams", tags=["Dreams"])


# ── Request / Response Schemas (inline) ───────────────────────────────────


class DreamCreateRequest(BaseModel):
    """POST /api/v1/dreams"""
    child_id: uuid.UUID
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=5000)
    mood: str | None = Field(default=None, description="e.g. 'happy', 'adventurous', 'scary'")
    characters: list[str] = Field(default_factory=list, description="Characters in the dream")
    settings: list[str] = Field(default_factory=list, description="Locations in the dream")


class DreamResponse(BaseModel):
    """Dream response."""
    id: uuid.UUID
    child_id: uuid.UUID
    title: str
    description: str
    mood: str | None = None
    characters: list[str] = []
    settings: list[str] = []
    has_book: bool = False
    book_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime


class DreamToBookRequest(BaseModel):
    """POST /api/v1/dreams/{id}/create-book"""
    art_style: str | None = None
    page_count: int = Field(default=12, ge=8, le=32)
    include_voice: bool = False


class DreamToBookResponse(BaseModel):
    """Dream-to-book conversion response."""
    dream_id: uuid.UUID
    book_id: uuid.UUID
    status: str  # generating, ready
    message: str


# ── POST /dreams ──────────────────────────────────────────────────────────


@router.post(
    "",
    response_model=DreamResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save a dream",
)
async def create_dream(
    body: DreamCreateRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> DreamResponse:
    """Save a dream for a child.

    Spec ref: Ch8.17 — POST /api/v1/dreams
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, save dream to database.
    return DreamResponse(
        id=uuid.uuid4(),
        child_id=body.child_id,
        title=body.title,
        description=body.description,
        mood=body.mood,
        characters=body.characters,
        settings=body.settings,
        has_book=False,
        book_id=None,
        created_at=now,
        updated_at=now,
    )


# ── GET /dreams ───────────────────────────────────────────────────────────


@router.get(
    "",
    response_model=PaginatedResponse[DreamResponse],
    summary="List dreams",
)
async def list_dreams(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    child_id: uuid.UUID = Query(..., description="Child profile ID"),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
) -> PaginatedResponse[DreamResponse]:
    """List dreams for a child.

    Spec ref: Ch8.17 — GET /api/v1/dreams
    """
    # Placeholder: In production, query dreams filtered by child_id.
    return PaginatedResponse(
        data=[],
        total=0,
        page=page,
        per_page=per_page,
        total_pages=0,
        has_next=False,
        has_prev=False,
    )


# ── POST /dreams/{id}/create-book ────────────────────────────────────────


@router.post(
    "/{dream_id}/create-book",
    response_model=DreamToBookResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Convert dream to book",
)
async def create_book_from_dream(
    dream_id: uuid.UUID,
    body: DreamToBookRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> DreamToBookResponse:
    """Convert a saved dream into a personalized book.

    Spec ref: Ch8.17 — POST /api/v1/dreams/{id}/create-book
    """
    book_id = uuid.uuid4()
    # Placeholder: In production, trigger book generation pipeline
    # using the dream's narrative elements as input.
    return DreamToBookResponse(
        dream_id=dream_id,
        book_id=book_id,
        status="generating",
        message="Book generation from dream started",
    )
