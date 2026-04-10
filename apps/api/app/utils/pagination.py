"""Pagination utilities for database queries.

Spec ref: Ch8.1 - All list endpoints are paginated.
"""

from __future__ import annotations

from typing import Any, Generic, Sequence, TypeVar

from pydantic import BaseModel
from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")


class PaginatedResult(BaseModel, Generic[T]):
    """Generic paginated response."""

    items: list[T]
    total: int
    page: int
    per_page: int
    has_next: bool


async def paginate(
    db: AsyncSession,
    query: Select[Any],
    page: int = 1,
    per_page: int = 20,
) -> tuple[Sequence[Any], int]:
    """Execute a paginated query, returning (items, total_count).

    Args:
        db: Async database session
        query: SQLAlchemy select query
        page: Page number (1-indexed)
        per_page: Items per page

    Returns:
        Tuple of (items, total_count)
    """
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Fetch page
    offset = (page - 1) * per_page
    paginated_query = query.offset(offset).limit(per_page)
    result = await db.execute(paginated_query)
    items = result.scalars().all()

    return items, total
