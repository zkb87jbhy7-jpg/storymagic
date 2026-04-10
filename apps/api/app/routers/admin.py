"""Admin endpoints.

Spec ref: Ch8.19 - Admin Endpoints
  GET  /api/v1/admin/prompts — List all prompt versions
  POST /api/v1/admin/prompts/{key}/version — Create new prompt version
  POST /api/v1/admin/prompts/{key}/test — Run test suite against prompt
  POST /api/v1/admin/prompts/{key}/promote — Promote to active
  POST /api/v1/admin/prompts/{key}/rollback — Rollback to previous version
  GET  /api/v1/admin/analytics — Admin analytics dashboard
  GET  /api/v1/admin/quality-dashboard — AI quality metrics dashboard
  GET  /api/v1/admin/moderation-queue — Content moderation queue
  POST /api/v1/admin/moderation/{id}/action — Take moderation action
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.dependencies import get_current_admin
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── Request / Response Schemas (inline) ───────────────────────────────────


class PromptVersionResponse(BaseModel):
    """Prompt version item."""
    id: uuid.UUID
    key: str
    version: int
    content: str
    is_active: bool
    test_score: float | None = None
    created_by: uuid.UUID | None = None
    created_at: datetime
    promoted_at: datetime | None = None


class PromptVersionCreateRequest(BaseModel):
    """POST /api/v1/admin/prompts/{key}/version"""
    content: str = Field(min_length=1, max_length=50000)
    description: str | None = Field(default=None, max_length=500)


class PromptTestRequest(BaseModel):
    """POST /api/v1/admin/prompts/{key}/test"""
    version_id: uuid.UUID | None = Field(default=None, description="Test specific version or latest")
    test_cases: list[dict[str, Any]] | None = Field(
        default=None, description="Custom test cases; uses default suite if omitted"
    )


class PromptTestResponse(BaseModel):
    """Prompt test results."""
    key: str
    version_id: uuid.UUID
    total_tests: int
    passed: int
    failed: int
    score: float
    results: list[dict[str, Any]]
    duration_ms: int


class PromptPromoteResponse(BaseModel):
    """Prompt promotion result."""
    key: str
    version_id: uuid.UUID
    previous_active_version: int | None = None
    new_active_version: int
    message: str


class AnalyticsDashboardResponse(BaseModel):
    """Admin analytics dashboard data."""
    total_users: int
    active_users_30d: int
    total_books_created: int
    books_created_30d: int
    total_orders: int
    revenue_30d: float
    revenue_currency: str = "USD"
    subscription_breakdown: dict[str, int] = {}
    top_templates: list[dict[str, Any]] = []
    conversion_rate: float = 0.0
    churn_rate_30d: float = 0.0
    generated_at: datetime


class QualityDashboardResponse(BaseModel):
    """AI quality metrics dashboard."""
    average_story_quality: float
    average_illustration_quality: float
    average_voice_quality: float
    consistency_score: float
    anomaly_rate: float
    quality_trend_30d: list[dict[str, Any]] = []
    provider_performance: list[dict[str, Any]] = []
    top_failure_reasons: list[dict[str, Any]] = []
    generated_at: datetime


class ModerationItem(BaseModel):
    """Content moderation queue item."""
    id: uuid.UUID
    content_type: str  # book, template, review, report
    content_id: uuid.UUID
    reason: str
    severity: str  # low, medium, high, critical
    status: str  # pending, in_review, resolved, dismissed
    reported_by: uuid.UUID | None = None
    created_at: datetime
    preview: dict[str, Any] | None = None


class ModerationActionRequest(BaseModel):
    """POST /api/v1/admin/moderation/{id}/action"""
    action: str = Field(description="'approve', 'reject', 'flag', 'remove', 'ban_user'")
    reason: str | None = Field(default=None, max_length=1000)
    notify_user: bool = True


class ModerationActionResponse(BaseModel):
    """Moderation action result."""
    id: uuid.UUID
    action: str
    status: str
    message: str
    actioned_by: uuid.UUID
    actioned_at: datetime


# ── GET /admin/prompts ────────────────────────────────────────────────────


@router.get(
    "/prompts",
    response_model=list[PromptVersionResponse],
    summary="List all prompt versions",
)
async def list_prompts(
    current_admin: Annotated[dict[str, Any], Depends(get_current_admin)],
    key: str | None = Query(default=None, description="Filter by prompt key"),
) -> list[PromptVersionResponse]:
    """List all prompt versions.

    Spec ref: Ch8.19 — GET /api/v1/admin/prompts
    Admin only.
    """
    # Placeholder: In production, query prompt_versions table.
    return []


# ── POST /admin/prompts/{key}/version ────────────────────────────────────


@router.post(
    "/prompts/{key}/version",
    response_model=PromptVersionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new prompt version",
)
async def create_prompt_version(
    key: str,
    body: PromptVersionCreateRequest,
    current_admin: Annotated[dict[str, Any], Depends(get_current_admin)],
) -> PromptVersionResponse:
    """Create a new version of a prompt.

    Spec ref: Ch8.19 — POST /api/v1/admin/prompts/{key}/version
    Admin only.
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, insert new prompt version.
    return PromptVersionResponse(
        id=uuid.uuid4(),
        key=key,
        version=1,
        content=body.content,
        is_active=False,
        test_score=None,
        created_by=uuid.UUID(str(current_admin["id"])),
        created_at=now,
        promoted_at=None,
    )


# ── POST /admin/prompts/{key}/test ───────────────────────────────────────


@router.post(
    "/prompts/{key}/test",
    response_model=PromptTestResponse,
    summary="Test prompt version",
)
async def test_prompt(
    key: str,
    body: PromptTestRequest,
    current_admin: Annotated[dict[str, Any], Depends(get_current_admin)],
) -> PromptTestResponse:
    """Run the test suite against a prompt version.

    Spec ref: Ch8.19 — POST /api/v1/admin/prompts/{key}/test
    Admin only.
    """
    version_id = body.version_id or uuid.uuid4()
    # Placeholder: In production, run eval suite against the prompt version.
    return PromptTestResponse(
        key=key,
        version_id=version_id,
        total_tests=0,
        passed=0,
        failed=0,
        score=0.0,
        results=[],
        duration_ms=0,
    )


# ── POST /admin/prompts/{key}/promote ────────────────────────────────────


@router.post(
    "/prompts/{key}/promote",
    response_model=PromptPromoteResponse,
    summary="Promote prompt to active",
)
async def promote_prompt(
    key: str,
    current_admin: Annotated[dict[str, Any], Depends(get_current_admin)],
    version_id: uuid.UUID = Query(..., description="Version to promote"),
) -> PromptPromoteResponse:
    """Promote a prompt version to active.

    Spec ref: Ch8.19 — POST /api/v1/admin/prompts/{key}/promote
    Admin only.
    """
    # Placeholder: In production, set the specified version as active
    # and deactivate the current active version.
    return PromptPromoteResponse(
        key=key,
        version_id=version_id,
        previous_active_version=None,
        new_active_version=1,
        message=f"Prompt '{key}' promoted successfully",
    )


# ── POST /admin/prompts/{key}/rollback ───────────────────────────────────


@router.post(
    "/prompts/{key}/rollback",
    response_model=PromptPromoteResponse,
    summary="Rollback prompt to previous version",
)
async def rollback_prompt(
    key: str,
    current_admin: Annotated[dict[str, Any], Depends(get_current_admin)],
) -> PromptPromoteResponse:
    """Rollback a prompt to the previous active version.

    Spec ref: Ch8.19 — POST /api/v1/admin/prompts/{key}/rollback
    Admin only.
    """
    # Placeholder: In production, revert to the previously active version.
    return PromptPromoteResponse(
        key=key,
        version_id=uuid.uuid4(),
        previous_active_version=2,
        new_active_version=1,
        message=f"Prompt '{key}' rolled back successfully",
    )


# ── GET /admin/analytics ─────────────────────────────────────────────────


@router.get(
    "/analytics",
    response_model=AnalyticsDashboardResponse,
    summary="Admin analytics dashboard",
)
async def get_analytics(
    current_admin: Annotated[dict[str, Any], Depends(get_current_admin)],
) -> AnalyticsDashboardResponse:
    """Admin analytics dashboard with key business metrics.

    Spec ref: Ch8.19 — GET /api/v1/admin/analytics
    Admin only.
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, aggregate metrics from database.
    return AnalyticsDashboardResponse(
        total_users=0,
        active_users_30d=0,
        total_books_created=0,
        books_created_30d=0,
        total_orders=0,
        revenue_30d=0.0,
        revenue_currency="USD",
        subscription_breakdown={"free": 0, "monthly": 0, "yearly": 0},
        top_templates=[],
        conversion_rate=0.0,
        churn_rate_30d=0.0,
        generated_at=now,
    )


# ── GET /admin/quality-dashboard ──────────────────────────────────────────


@router.get(
    "/quality-dashboard",
    response_model=QualityDashboardResponse,
    summary="AI quality metrics dashboard",
)
async def get_quality_dashboard(
    current_admin: Annotated[dict[str, Any], Depends(get_current_admin)],
) -> QualityDashboardResponse:
    """AI quality metrics dashboard showing generation quality trends.

    Spec ref: Ch8.19 — GET /api/v1/admin/quality-dashboard
    Admin only.
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, aggregate quality metrics from book_events.
    return QualityDashboardResponse(
        average_story_quality=0.0,
        average_illustration_quality=0.0,
        average_voice_quality=0.0,
        consistency_score=0.0,
        anomaly_rate=0.0,
        quality_trend_30d=[],
        provider_performance=[],
        top_failure_reasons=[],
        generated_at=now,
    )


# ── GET /admin/moderation-queue ──────────────────────────────────────────


@router.get(
    "/moderation-queue",
    response_model=PaginatedResponse[ModerationItem],
    summary="Content moderation queue",
)
async def get_moderation_queue(
    current_admin: Annotated[dict[str, Any], Depends(get_current_admin)],
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    status_filter: str | None = Query(default=None, alias="status"),
    severity: str | None = Query(default=None),
) -> PaginatedResponse[ModerationItem]:
    """Content moderation queue.

    Spec ref: Ch8.19 — GET /api/v1/admin/moderation-queue
    Admin only.
    """
    # Placeholder: In production, query moderation queue with filters.
    return PaginatedResponse(
        data=[],
        total=0,
        page=page,
        per_page=per_page,
        total_pages=0,
        has_next=False,
        has_prev=False,
    )


# ── POST /admin/moderation/{id}/action ───────────────────────────────────


@router.post(
    "/moderation/{item_id}/action",
    response_model=ModerationActionResponse,
    summary="Take moderation action",
)
async def take_moderation_action(
    item_id: uuid.UUID,
    body: ModerationActionRequest,
    current_admin: Annotated[dict[str, Any], Depends(get_current_admin)],
) -> ModerationActionResponse:
    """Take a moderation action on a queued item.

    Spec ref: Ch8.19 — POST /api/v1/admin/moderation/{id}/action
    Admin only.
    """
    valid_actions = {"approve", "reject", "flag", "remove", "ban_user"}
    if body.action not in valid_actions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid action. Must be one of: {', '.join(sorted(valid_actions))}",
        )

    now = datetime.now(timezone.utc)
    # Placeholder: In production, apply the moderation action.
    return ModerationActionResponse(
        id=item_id,
        action=body.action,
        status="resolved",
        message=f"Moderation action '{body.action}' applied successfully",
        actioned_by=uuid.UUID(str(current_admin["id"])),
        actioned_at=now,
    )
