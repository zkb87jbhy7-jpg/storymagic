"""Common schemas shared across all API endpoints.

Maps to TypeScript: packages/shared-types/src/common.ts
"""

from __future__ import annotations

from enum import StrEnum
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


# ── Enumerations ──────────────────────────────────────────────────────────────


class Locale(StrEnum):
    HE = "he"
    EN = "en"
    AR = "ar"
    RU = "ru"
    FR = "fr"
    ES = "es"
    DE = "de"


class Currency(StrEnum):
    ILS = "ILS"
    USD = "USD"
    EUR = "EUR"


class SortOrder(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ErrorType(StrEnum):
    NETWORK_ERROR = "NetworkError"
    AI_GENERATION_ERROR = "AIGenerationError"
    PAYMENT_ERROR = "PaymentError"
    STORAGE_ERROR = "StorageError"
    VALIDATION_ERROR = "ValidationError"
    RATE_LIMIT_ERROR = "RateLimitError"


class SSEEventType(StrEnum):
    PROGRESS = "progress"
    PHASE_CHANGE = "phase_change"
    PAGE_COMPLETE = "page_complete"
    EARLY_PEEK = "early_peek"
    ERROR = "error"
    COMPLETE = "complete"


# ── Pagination ────────────────────────────────────────────────────────────────


class PaginationParams(BaseModel):
    """Query parameters for paginated list endpoints."""

    page: int = Field(default=1, ge=1, description="Page number (1-indexed)")
    per_page: int = Field(
        default=20, ge=1, le=100, alias="page_size", description="Items per page"
    )
    sort_by: str | None = Field(default=None, description="Field to sort by")
    sort_order: SortOrder = Field(default=SortOrder.DESC, description="Sort direction")

    model_config = ConfigDict(populate_by_name=True)


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper.

    Mirrors TypeScript ``PaginatedResponse<T>`` from shared-types.
    """

    data: list[T]
    total: int = Field(ge=0)
    page: int = Field(ge=1)
    per_page: int = Field(ge=1, alias="page_size")
    total_pages: int = Field(ge=0)
    has_next: bool
    has_prev: bool

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# ── Error / Success ──────────────────────────────────────────────────────────


class ErrorDetail(BaseModel):
    """Structured error body matching the TypeScript ``ErrorResponse.error``."""

    code: str
    message: str
    details: dict[str, object] | None = None
    retryable: bool = False
    retry_after_seconds: int | None = None


class ErrorResponse(BaseModel):
    """Standard API error envelope."""

    error: ErrorDetail


class SuccessResponse(BaseModel):
    """Lightweight acknowledgement response."""

    success: bool = True
    message: str = "OK"


# ── SSE Progress ──────────────────────────────────────────────────────────────


class SSEProgressEvent(BaseModel):
    """Server-Sent Events progress update during long-running generation."""

    event_type: SSEEventType
    phase: int = Field(ge=0, le=12)
    phase_name: str
    progress_percent: float = Field(ge=0.0, le=100.0)
    message: str
    data: dict[str, object] | None = None
    preview_url: str | None = None
    timestamp: str
