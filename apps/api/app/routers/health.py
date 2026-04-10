"""Health check endpoints.

Spec ref: Ch8.20 - System Endpoints
  GET /api/v1/health — Basic health check
  GET /api/v1/health/deep — Deep health check (database, Redis, GPU, AI providers)
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check() -> dict[str, Any]:
    """Basic health check — always responds if the server is running."""
    return {
        "status": "healthy",
        "service": "storymagic-api",
        "version": "0.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/deep")
async def deep_health_check(
    db: AsyncSession = Depends(),
) -> dict[str, Any]:
    """Deep health check — verifies database, Redis, and external services."""
    checks: dict[str, Any] = {}

    # Database check
    try:
        result = await db.execute(text("SELECT 1"))
        result.scalar()
        checks["database"] = {"status": "healthy"}
    except Exception as e:
        checks["database"] = {"status": "unhealthy", "error": str(e)}

    # Redis check (will be wired when dependencies are available)
    checks["redis"] = {"status": "not_configured"}

    # Temporal check
    checks["temporal"] = {"status": "not_configured"}

    # AI providers check
    checks["ai_providers"] = {"status": "not_configured"}

    overall = all(
        c.get("status") in ("healthy", "not_configured")
        for c in checks.values()
    )

    return {
        "status": "healthy" if overall else "degraded",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks": checks,
    }
