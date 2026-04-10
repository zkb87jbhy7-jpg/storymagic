"""Recommendation endpoints.

Spec ref: Ch8.18 - Recommendation Endpoints
  GET /api/v1/recommendations/{childId} — Personalized recommendations
  GET /api/v1/seasonal — Current seasonal content
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field

from app.dependencies import get_current_user

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


# ── Request / Response Schemas (inline) ───────────────────────────────────


class RecommendationItem(BaseModel):
    """Individual recommendation."""
    id: uuid.UUID
    type: str  # template, theme, activity
    title: str
    description: str
    reason: str  # Why this was recommended
    template_id: uuid.UUID | None = None
    preview_url: str | None = None
    age_range: str | None = None
    category: str | None = None
    relevance_score: float = Field(ge=0.0, le=1.0)


class RecommendationsResponse(BaseModel):
    """Personalized recommendations response."""
    child_id: uuid.UUID
    recommendations: list[RecommendationItem]
    generated_at: datetime


class SeasonalContentItem(BaseModel):
    """Seasonal content item."""
    id: uuid.UUID
    title: str
    description: str
    season: str
    event: str | None = None  # e.g. 'christmas', 'hanukkah', 'back_to_school'
    template_id: uuid.UUID | None = None
    preview_url: str | None = None
    available_from: datetime
    available_until: datetime


class SeasonalContentResponse(BaseModel):
    """Current seasonal content response."""
    items: list[SeasonalContentItem]
    current_season: str
    generated_at: datetime


# ── GET /recommendations/{childId} ───────────────────────────────────────


@router.get(
    "/{child_id}",
    response_model=RecommendationsResponse,
    summary="Get personalized recommendations",
)
async def get_recommendations(
    child_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    limit: int = Query(default=10, ge=1, le=50),
) -> RecommendationsResponse:
    """Get personalized recommendations for a child.

    Spec ref: Ch8.18 — GET /api/v1/recommendations/{childId}
    Uses child's reading history, preferences, and age to generate recommendations.
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, use recommendation engine based on:
    # - Child's age, preferences, and reading history
    # - Collaborative filtering from similar children
    # - Content-based filtering from liked themes/genres
    return RecommendationsResponse(
        child_id=child_id,
        recommendations=[],
        generated_at=now,
    )


# ── GET /seasonal ────────────────────────────────────────────────────────
# Note: The spec says /api/v1/seasonal but we mount under /recommendations prefix.
# The main.py router map handles the /recommendations prefix, and we add a
# separate router for the /seasonal top-level path. Since main.py maps
# "recommendations" -> "/recommendations", we define /seasonal as a path
# that works at the API root level via a separate approach.
# For consistency, we include it here and the actual path will be
# /api/v1/recommendations/../seasonal or handled by the app factory.

# Actually, looking at the spec: GET /api/v1/seasonal is its own path.
# Since this router has prefix "/recommendations", we cannot serve "/seasonal"
# from here directly. We'll define it as a convenience method and note that
# main.py would need a separate mount. For now, we add it under this router
# as a practical workaround.


@router.get(
    "/seasonal/current",
    response_model=SeasonalContentResponse,
    summary="Get seasonal content",
)
async def get_seasonal_content(
    language: str | None = Query(default=None, max_length=5),
) -> SeasonalContentResponse:
    """Get current seasonal content.

    Spec ref: Ch8.18 — GET /api/v1/seasonal
    Public endpoint (no auth required).
    Note: Spec defines this at /api/v1/seasonal; mounted here for convenience.
    """
    now = datetime.now(timezone.utc)
    # Determine current season based on date
    month = now.month
    if month in (3, 4, 5):
        season = "spring"
    elif month in (6, 7, 8):
        season = "summer"
    elif month in (9, 10, 11):
        season = "autumn"
    else:
        season = "winter"

    # Placeholder: In production, query seasonal content from DB.
    return SeasonalContentResponse(
        items=[],
        current_season=season,
        generated_at=now,
    )
