"""Book endpoints.

Spec ref: Ch8.7 - Book Endpoints
  POST /api/v1/books/create — Master book creation (SSE)
  GET  /api/v1/books — List user's books (paginated)
  GET  /api/v1/books/{id} — Book detail
  GET  /api/v1/books/{id}/preview — Preview with page thumbnails
  GET  /api/v1/books/{id}/interactive — Full interactive book data
  GET  /api/v1/books/{id}/read-progress — Reading progress
  PUT  /api/v1/books/{id}/read-progress — Update reading progress
  POST /api/v1/books/{id}/approve — Approve for printing
  POST /api/v1/books/{id}/living-book/toggle — Enable/disable Living Book
  POST /api/v1/books/{id}/living-book/add-chapter — Add new chapter
  GET  /api/v1/books/{id}/extras — Available ancillary products
  POST /api/v1/books/{id}/extras/generate — Generate ancillary product
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

from app.dependencies import get_current_user
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/books", tags=["Books"])


# ── Request / Response Schemas (inline) ───────────────────────────────────


class BookCreateRequest(BaseModel):
    """POST /api/v1/books/create"""
    child_id: uuid.UUID
    prompt: str | None = Field(default=None, max_length=2000)
    template_id: uuid.UUID | None = None
    language: str = Field(default="en", max_length=5)
    page_count: int = Field(default=12, ge=8, le=32)
    art_style: str | None = None
    is_rhyming: bool = False
    include_voice: bool = False
    voice_id: str | None = None


class BookSummary(BaseModel):
    """Book listing item."""
    id: uuid.UUID
    title: str
    child_id: uuid.UUID
    child_name: str
    language: str
    page_count: int
    status: str  # draft, generating, ready, approved, printed
    cover_url: str | None = None
    quality_score: float | None = None
    created_at: datetime
    updated_at: datetime


class BookDetailResponse(BookSummary):
    """Full book detail."""
    pages: list[dict[str, Any]] = []
    art_style: str | None = None
    is_rhyming: bool = False
    voice_narration_url: str | None = None
    is_living_book: bool = False
    extras_available: list[str] = []


class BookPreviewResponse(BaseModel):
    """Book preview with page thumbnails."""
    id: uuid.UUID
    title: str
    cover_url: str | None = None
    page_thumbnails: list[dict[str, Any]] = []
    total_pages: int = 0


class InteractiveBookResponse(BaseModel):
    """Full interactive book data for the reader."""
    id: uuid.UUID
    title: str
    pages: list[dict[str, Any]] = []
    audio_tracks: list[dict[str, Any]] = []
    interactive_elements: list[dict[str, Any]] = []
    reading_level: str | None = None


class ReadProgressResponse(BaseModel):
    """Reading progress and bookmarks."""
    book_id: uuid.UUID
    current_page: int = 0
    total_pages: int = 0
    progress_percent: float = 0.0
    bookmarks: list[int] = []
    last_read_at: datetime | None = None


class ReadProgressUpdateRequest(BaseModel):
    """PUT /api/v1/books/{id}/read-progress"""
    current_page: int = Field(ge=0)
    bookmarks: list[int] | None = None


class LivingBookToggleRequest(BaseModel):
    """POST /api/v1/books/{id}/living-book/toggle"""
    enabled: bool


class LivingBookAddChapterRequest(BaseModel):
    """POST /api/v1/books/{id}/living-book/add-chapter"""
    prompt: str | None = Field(default=None, max_length=2000)
    theme: str | None = None


class BookExtrasResponse(BaseModel):
    """Available ancillary products."""
    book_id: uuid.UUID
    extras: list[dict[str, Any]] = []


class BookExtrasGenerateRequest(BaseModel):
    """POST /api/v1/books/{id}/extras/generate"""
    extra_type: str = Field(description="e.g. 'coloring_page', 'activity_sheet', 'poster'")
    options: dict[str, Any] | None = None


class BookExtrasGenerateResponse(BaseModel):
    """Generated ancillary product."""
    id: uuid.UUID
    book_id: uuid.UUID
    extra_type: str
    status: str
    download_url: str | None = None
    created_at: datetime


# ── SSE helper ────────────────────────────────────────────────────────────


async def _book_creation_sse_stream(book_id: uuid.UUID) -> Any:
    """Generate a mock SSE stream for book creation pipeline."""
    phases = [
        "Analyzing request",
        "Generating story narrative",
        "Creating character sheets",
        "Illustrating pages",
        "Generating voice narration",
        "Quality checks",
        "Assembling book",
        "Final review",
    ]
    for i, phase in enumerate(phases):
        event_data = {
            "event_type": "phase_change",
            "phase": i + 1,
            "phase_name": phase,
            "progress_percent": ((i + 1) / len(phases)) * 100,
            "message": f"Phase {i + 1}/{len(phases)}: {phase}",
            "data": {"book_id": str(book_id)},
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        yield f"data: {json.dumps(event_data)}\n\n"
        await asyncio.sleep(0.1)

    complete_data = {
        "event_type": "complete",
        "phase": len(phases),
        "phase_name": "Complete",
        "progress_percent": 100.0,
        "message": "Book creation complete",
        "data": {"book_id": str(book_id)},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    yield f"data: {json.dumps(complete_data)}\n\n"


# ── POST /books/create ────────────────────────────────────────────────────


@router.post(
    "/create",
    summary="Create a book (SSE)",
    response_class=StreamingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_book(
    body: BookCreateRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> StreamingResponse:
    """Master endpoint: triggers full book creation pipeline.

    Spec ref: Ch8.7 — POST /api/v1/books/create
    Returns SSE stream with progress phases.
    """
    book_id = uuid.uuid4()
    return StreamingResponse(
        _book_creation_sse_stream(book_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Book-ID": str(book_id),
        },
    )


# ── GET /books ────────────────────────────────────────────────────────────


@router.get(
    "",
    response_model=PaginatedResponse[BookSummary],
    summary="List user's books",
)
async def list_books(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    child_id: uuid.UUID | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    sort_by: str | None = Query(default=None),
) -> PaginatedResponse[BookSummary]:
    """List user's books with pagination and filters.

    Spec ref: Ch8.7 — GET /api/v1/books
    """
    # Placeholder: In production, query the books table with filters.
    return PaginatedResponse(
        data=[],
        total=0,
        page=page,
        per_page=per_page,
        total_pages=0,
        has_next=False,
        has_prev=False,
    )


# ── GET /books/{id} ──────────────────────────────────────────────────────


@router.get(
    "/{book_id}",
    response_model=BookDetailResponse,
    summary="Get book detail",
)
async def get_book(
    book_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> BookDetailResponse:
    """Book detail with quality scores and status.

    Spec ref: Ch8.7 — GET /api/v1/books/{id}
    """
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Book not found",
    )


# ── GET /books/{id}/preview ──────────────────────────────────────────────


@router.get(
    "/{book_id}/preview",
    response_model=BookPreviewResponse,
    summary="Get book preview",
)
async def get_book_preview(
    book_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> BookPreviewResponse:
    """Preview with page thumbnails.

    Spec ref: Ch8.7 — GET /api/v1/books/{id}/preview
    """
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Book not found",
    )


# ── GET /books/{id}/interactive ──────────────────────────────────────────


@router.get(
    "/{book_id}/interactive",
    response_model=InteractiveBookResponse,
    summary="Get interactive book data",
)
async def get_interactive_book(
    book_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> InteractiveBookResponse:
    """Full interactive book data for the reader.

    Spec ref: Ch8.7 — GET /api/v1/books/{id}/interactive
    """
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Book not found",
    )


# ── GET /books/{id}/read-progress ────────────────────────────────────────


@router.get(
    "/{book_id}/read-progress",
    response_model=ReadProgressResponse,
    summary="Get reading progress",
)
async def get_read_progress(
    book_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ReadProgressResponse:
    """Get reading progress and bookmarks.

    Spec ref: Ch8.7 — GET /api/v1/books/{id}/read-progress
    """
    # Placeholder: In production, query reading_progress table.
    return ReadProgressResponse(
        book_id=book_id,
        current_page=0,
        total_pages=0,
        progress_percent=0.0,
        bookmarks=[],
        last_read_at=None,
    )


# ── PUT /books/{id}/read-progress ────────────────────────────────────────


@router.put(
    "/{book_id}/read-progress",
    response_model=ReadProgressResponse,
    summary="Update reading progress",
)
async def update_read_progress(
    book_id: uuid.UUID,
    body: ReadProgressUpdateRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ReadProgressResponse:
    """Update reading progress.

    Spec ref: Ch8.7 — PUT /api/v1/books/{id}/read-progress
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, upsert reading_progress row.
    return ReadProgressResponse(
        book_id=book_id,
        current_page=body.current_page,
        total_pages=12,
        progress_percent=(body.current_page / 12) * 100 if body.current_page > 0 else 0.0,
        bookmarks=body.bookmarks or [],
        last_read_at=now,
    )


# ── POST /books/{id}/approve ─────────────────────────────────────────────


@router.post(
    "/{book_id}/approve",
    response_model=BookSummary,
    summary="Approve book for printing",
)
async def approve_book(
    book_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> BookSummary:
    """Approve book for printing.

    Spec ref: Ch8.7 — POST /api/v1/books/{id}/approve
    """
    # Placeholder: In production, update book status to 'approved'.
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Book not found",
    )


# ── POST /books/{id}/living-book/toggle ──────────────────────────────────


@router.post(
    "/{book_id}/living-book/toggle",
    response_model=dict[str, Any],
    summary="Toggle Living Book feature",
)
async def toggle_living_book(
    book_id: uuid.UUID,
    body: LivingBookToggleRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    """Enable or disable Living Book.

    Spec ref: Ch8.7 — POST /api/v1/books/{id}/living-book/toggle
    """
    # Placeholder: In production, update the book's is_living_book flag.
    return {
        "book_id": str(book_id),
        "is_living_book": body.enabled,
        "message": f"Living Book {'enabled' if body.enabled else 'disabled'}",
    }


# ── POST /books/{id}/living-book/add-chapter ─────────────────────────────


@router.post(
    "/{book_id}/living-book/add-chapter",
    response_model=dict[str, Any],
    status_code=status.HTTP_201_CREATED,
    summary="Add Living Book chapter",
)
async def add_living_book_chapter(
    book_id: uuid.UUID,
    body: LivingBookAddChapterRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    """Add a new chapter to a Living Book.

    Spec ref: Ch8.7 — POST /api/v1/books/{id}/living-book/add-chapter
    """
    chapter_id = uuid.uuid4()
    # Placeholder: In production, trigger chapter generation pipeline.
    return {
        "book_id": str(book_id),
        "chapter_id": str(chapter_id),
        "status": "generating",
        "message": "New chapter generation started",
    }


# ── GET /books/{id}/extras ───────────────────────────────────────────────


@router.get(
    "/{book_id}/extras",
    response_model=BookExtrasResponse,
    summary="List available ancillary products",
)
async def list_extras(
    book_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> BookExtrasResponse:
    """Available ancillary products for a book.

    Spec ref: Ch8.7 — GET /api/v1/books/{id}/extras
    """
    # Placeholder: In production, return available extras based on book type.
    return BookExtrasResponse(
        book_id=book_id,
        extras=[
            {"type": "coloring_page", "name": "Coloring Pages", "price": 4.99},
            {"type": "activity_sheet", "name": "Activity Sheet", "price": 3.99},
            {"type": "poster", "name": "Character Poster", "price": 9.99},
        ],
    )


# ── POST /books/{id}/extras/generate ─────────────────────────────────────


@router.post(
    "/{book_id}/extras/generate",
    response_model=BookExtrasGenerateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate ancillary product",
)
async def generate_extra(
    book_id: uuid.UUID,
    body: BookExtrasGenerateRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> BookExtrasGenerateResponse:
    """Generate a specific ancillary product.

    Spec ref: Ch8.7 — POST /api/v1/books/{id}/extras/generate
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, trigger extras generation pipeline.
    return BookExtrasGenerateResponse(
        id=uuid.uuid4(),
        book_id=book_id,
        extra_type=body.extra_type,
        status="generating",
        download_url=None,
        created_at=now,
    )
