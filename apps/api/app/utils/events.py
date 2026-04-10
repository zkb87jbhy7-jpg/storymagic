"""Append-only event logger for CQRS pattern.

Spec ref: Ch7.1 - CQRS with append-only event log.
Write operations create events in the event log AND update materialized state tables.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def log_event(
    db: AsyncSession,
    *,
    book_id: uuid.UUID,
    event_type: str,
    agent_name: str | None = None,
    payload: dict[str, Any] | None = None,
    quality_score: Decimal | None = None,
    latency_ms: int | None = None,
    provider_id: str | None = None,
    prompt_version_id: uuid.UUID | None = None,
    error_details: dict[str, Any] | None = None,
) -> uuid.UUID:
    """Log an event to the append-only book_events table."""
    event_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    await db.execute(
        text("""
            INSERT INTO book_events
                (id, book_id, event_type, agent_name, payload, quality_score,
                 latency_ms, provider_id, prompt_version_id, error_details, timestamp)
            VALUES
                (:id, :book_id, :event_type, :agent_name, :payload::jsonb, :quality_score,
                 :latency_ms, :provider_id, :prompt_version_id, :error_details::jsonb, :timestamp)
        """),
        {
            "id": event_id,
            "book_id": book_id,
            "event_type": event_type,
            "agent_name": agent_name,
            "payload": str(payload) if payload else None,
            "quality_score": quality_score,
            "latency_ms": latency_ms,
            "provider_id": provider_id,
            "prompt_version_id": prompt_version_id,
            "error_details": str(error_details) if error_details else None,
            "timestamp": now,
        },
    )
    return event_id
