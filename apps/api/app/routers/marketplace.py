"""Marketplace endpoints.

Spec ref: Ch8.13 - Marketplace Endpoints
  GET  /api/v1/marketplace/templates — Search and filter templates
  GET  /api/v1/marketplace/templates/{id} — Template detail with reviews
  POST /api/v1/marketplace/templates/{id}/review — Write review
  POST /api/v1/marketplace/templates/{id}/report — Report template
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.dependencies import get_current_user
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])


# ── Request / Response Schemas (inline) ───────────────────────────────────


class MarketplaceTemplateResponse(BaseModel):
    """Marketplace template listing item."""
    id: uuid.UUID
    title: str
    description: str
    category: str
    age_range: str
    language: str
    price: float
    currency: str = "USD"
    rating: float
    reviews_count: int
    author_name: str
    author_id: uuid.UUID
    preview_url: str | None = None
    is_featured: bool = False
    created_at: datetime


class MarketplaceTemplateDetailResponse(MarketplaceTemplateResponse):
    """Template detail with reviews."""
    long_description: str | None = None
    sample_pages: list[dict[str, Any]] = []
    page_count: int = 12
    is_rhyming: bool = False
    themes: list[str] = []
    reviews: list[dict[str, Any]] = []


class ReviewCreateRequest(BaseModel):
    """POST /api/v1/marketplace/templates/{id}/review"""
    rating: int = Field(ge=1, le=5)
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=2000)


class ReviewResponse(BaseModel):
    """Review response."""
    id: uuid.UUID
    template_id: uuid.UUID
    user_id: uuid.UUID
    user_name: str
    rating: int
    title: str
    body: str
    created_at: datetime


class ReportCreateRequest(BaseModel):
    """POST /api/v1/marketplace/templates/{id}/report"""
    reason: str = Field(
        description="e.g. 'inappropriate_content', 'copyright_violation', 'spam', 'other'"
    )
    description: str = Field(min_length=1, max_length=2000)


class ReportResponse(BaseModel):
    """Report acknowledgment response."""
    id: uuid.UUID
    template_id: uuid.UUID
    status: str = "submitted"
    message: str = "Report submitted for review"


# ── GET /marketplace/templates ────────────────────────────────────────────


@router.get(
    "/templates",
    response_model=PaginatedResponse[MarketplaceTemplateResponse],
    summary="Search marketplace templates",
)
async def search_templates(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    q: str | None = Query(default=None, description="Search query"),
    category: str | None = Query(default=None),
    age_range: str | None = Query(default=None),
    language: str | None = Query(default=None),
    price_min: float | None = Query(default=None, ge=0),
    price_max: float | None = Query(default=None, ge=0),
    rating_min: float | None = Query(default=None, ge=0, le=5),
    sort_by: str | None = Query(default=None, description="'popular', 'newest', 'price_asc', 'price_desc', 'rating'"),
) -> PaginatedResponse[MarketplaceTemplateResponse]:
    """Search and filter marketplace templates.

    Spec ref: Ch8.13 — GET /api/v1/marketplace/templates
    Public endpoint (no auth required for browsing).
    """
    # Placeholder: In production, query templates with full-text search and filters.
    return PaginatedResponse(
        data=[],
        total=0,
        page=page,
        per_page=per_page,
        total_pages=0,
        has_next=False,
        has_prev=False,
    )


# ── GET /marketplace/templates/{id} ──────────────────────────────────────


@router.get(
    "/templates/{template_id}",
    response_model=MarketplaceTemplateDetailResponse,
    summary="Get marketplace template detail",
)
async def get_template_detail(
    template_id: uuid.UUID,
) -> MarketplaceTemplateDetailResponse:
    """Template detail with reviews.

    Spec ref: Ch8.13 — GET /api/v1/marketplace/templates/{id}
    Public endpoint.
    """
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Template not found",
    )


# ── POST /marketplace/templates/{id}/review ──────────────────────────────


@router.post(
    "/templates/{template_id}/review",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Write a review",
)
async def create_review(
    template_id: uuid.UUID,
    body: ReviewCreateRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ReviewResponse:
    """Write a review for a marketplace template.

    Spec ref: Ch8.13 — POST /api/v1/marketplace/templates/{id}/review
    Auth required.
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, insert review and update template rating average.
    return ReviewResponse(
        id=uuid.uuid4(),
        template_id=template_id,
        user_id=uuid.UUID(str(current_user["id"])),
        user_name=current_user.get("name", "User"),
        rating=body.rating,
        title=body.title,
        body=body.body,
        created_at=now,
    )


# ── POST /marketplace/templates/{id}/report ──────────────────────────────


@router.post(
    "/templates/{template_id}/report",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Report a template",
)
async def report_template(
    template_id: uuid.UUID,
    body: ReportCreateRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ReportResponse:
    """Report a marketplace template for inappropriate content.

    Spec ref: Ch8.13 — POST /api/v1/marketplace/templates/{id}/report
    Auth required.
    """
    # Placeholder: In production, create moderation report.
    return ReportResponse(
        id=uuid.uuid4(),
        template_id=template_id,
        status="submitted",
        message="Report submitted for review. Thank you for helping keep our community safe.",
    )
