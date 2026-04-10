"""Analytics service — event tracking, dashboards, and quality metrics.

Records user and system events, provides aggregated dashboard data,
and exposes quality metrics for the AI generation pipeline.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.book import GeneratedBook
from app.models.event import BookEvent
from app.models.order import Order
from app.models.user import User


class AnalyticsService:
    """Business logic for event tracking and analytics dashboards."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def track_event(
        self,
        *,
        event_name: str,
        user_id: uuid.UUID | None = None,
        session_id: str | None = None,
        properties: dict[str, Any] | None = None,
        locale: str | None = None,
        device_type: str | None = None,
        page_url: str | None = None,
    ) -> dict[str, Any]:
        """Record an analytics event.

        Events are stored in the ``analytics_events`` table (or
        ``book_events`` for book-specific events) and used for
        recommendations, quality scoring, and business dashboards.

        Args:
            event_name: Identifier for the event (e.g.
                ``"book_creation_started"``, ``"page_read"``,
                ``"illustration_tapped"``).
            user_id: UUID of the acting user (``None`` for anonymous).
            session_id: Client session identifier.
            properties: Arbitrary key-value metadata.
            locale: User's locale code.
            device_type: ``"web"``, ``"ios"``, ``"android"``.
            page_url: URL of the page where the event fired.

        Returns:
            Dictionary with ``event_id`` and ``tracked_at``.
        """
        # For book-specific events, use the BookEvent model
        book_events = {
            "book_generation_started",
            "book_generation_completed",
            "book_generation_failed",
            "agent_step_completed",
            "quality_check_completed",
        }

        if event_name in book_events and properties and "book_id" in properties:
            book_event = BookEvent(
                book_id=uuid.UUID(properties["book_id"]),
                event_type=event_name,
                agent_name=properties.get("agent_name"),
                payload=properties,
                quality_score=properties.get("quality_score"),
                latency_ms=properties.get("latency_ms"),
                provider_id=properties.get("provider_id"),
            )
            self._db.add(book_event)
            await self._db.flush()
            await self._db.refresh(book_event)

            return {
                "event_id": str(book_event.id),
                "tracked_at": (
                    book_event.timestamp.isoformat()
                    if book_event.timestamp
                    else datetime.now(timezone.utc).isoformat()
                ),
            }

        # For general analytics events, use raw SQL insertion
        # (the analytics_events table may use time-based partitioning)
        event_id = uuid.uuid4()
        now = datetime.now(timezone.utc)

        await self._db.execute(
            text("""
                INSERT INTO analytics_events
                    (id, event_name, user_id, session_id, properties,
                     locale, device_type, page_url, timestamp)
                VALUES
                    (:id, :event_name, :user_id, :session_id, :properties::jsonb,
                     :locale, :device_type, :page_url, :timestamp)
            """),
            {
                "id": event_id,
                "event_name": event_name,
                "user_id": user_id,
                "session_id": session_id,
                "properties": str(properties) if properties else "{}",
                "locale": locale,
                "device_type": device_type,
                "page_url": page_url,
                "timestamp": now,
            },
        )

        return {
            "event_id": str(event_id),
            "tracked_at": now.isoformat(),
        }

    async def get_dashboard_data(
        self,
        *,
        days: int = 30,
    ) -> dict[str, Any]:
        """Return aggregated business metrics for the admin dashboard.

        Args:
            days: Look-back window in days (default 30).

        Returns:
            Dictionary with ``period_days``, ``users``, ``books``,
            ``orders``, and ``revenue`` sections.
        """
        since = datetime.now(timezone.utc) - timedelta(days=days)

        # Total users
        total_users: int = (
            await self._db.execute(select(func.count(User.id)))
        ).scalar_one()

        # New users in period
        new_users: int = (
            await self._db.execute(
                select(func.count(User.id)).where(User.created_at >= since)
            )
        ).scalar_one()

        # Total books
        total_books: int = (
            await self._db.execute(select(func.count(GeneratedBook.id)))
        ).scalar_one()

        # Books created in period
        new_books: int = (
            await self._db.execute(
                select(func.count(GeneratedBook.id)).where(
                    GeneratedBook.created_at >= since
                )
            )
        ).scalar_one()

        # Books by status
        status_counts_stmt = (
            select(
                GeneratedBook.status,
                func.count(GeneratedBook.id).label("count"),
            )
            .group_by(GeneratedBook.status)
        )
        status_result = await self._db.execute(status_counts_stmt)
        books_by_status = {
            row.status: row.count for row in status_result.all()
        }

        # Total orders and revenue
        total_orders: int = (
            await self._db.execute(select(func.count(Order.id)))
        ).scalar_one()

        orders_in_period: int = (
            await self._db.execute(
                select(func.count(Order.id)).where(Order.created_at >= since)
            )
        ).scalar_one()

        revenue_stmt = (
            select(func.coalesce(func.sum(Order.total_amount), 0))
            .where(Order.payment_status == "paid")
            .where(Order.created_at >= since)
        )
        revenue_in_period = float(
            (await self._db.execute(revenue_stmt)).scalar_one()
        )

        total_revenue_stmt = select(
            func.coalesce(func.sum(Order.total_amount), 0)
        ).where(Order.payment_status == "paid")
        total_revenue = float(
            (await self._db.execute(total_revenue_stmt)).scalar_one()
        )

        return {
            "period_days": days,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "users": {
                "total": total_users,
                "new_in_period": new_users,
            },
            "books": {
                "total": total_books,
                "new_in_period": new_books,
                "by_status": books_by_status,
            },
            "orders": {
                "total": total_orders,
                "in_period": orders_in_period,
            },
            "revenue": {
                "total_usd": total_revenue,
                "in_period_usd": revenue_in_period,
            },
        }

    async def get_quality_dashboard(
        self,
        *,
        days: int = 7,
    ) -> dict[str, Any]:
        """Return AI quality metrics for the quality dashboard.

        Aggregates quality scores, agent latencies, and error rates
        from the ``book_events`` table.

        Args:
            days: Look-back window in days (default 7).

        Returns:
            Dictionary with ``period_days``, ``generation_stats``,
            ``quality_scores``, ``agent_performance``, and ``error_rates``.
        """
        since = datetime.now(timezone.utc) - timedelta(days=days)

        # Generation counts
        gen_started: int = (
            await self._db.execute(
                select(func.count(BookEvent.id))
                .where(BookEvent.event_type == "book_generation_started")
                .where(BookEvent.timestamp >= since)
            )
        ).scalar_one()

        gen_completed: int = (
            await self._db.execute(
                select(func.count(BookEvent.id))
                .where(BookEvent.event_type == "book_generation_completed")
                .where(BookEvent.timestamp >= since)
            )
        ).scalar_one()

        gen_failed: int = (
            await self._db.execute(
                select(func.count(BookEvent.id))
                .where(BookEvent.event_type == "book_generation_failed")
                .where(BookEvent.timestamp >= since)
            )
        ).scalar_one()

        # Average quality scores
        avg_quality_stmt = (
            select(func.avg(BookEvent.quality_score))
            .where(BookEvent.quality_score.is_not(None))
            .where(BookEvent.timestamp >= since)
        )
        avg_quality = (await self._db.execute(avg_quality_stmt)).scalar_one()

        # Per-agent latency
        agent_perf_stmt = (
            select(
                BookEvent.agent_name,
                func.avg(BookEvent.latency_ms).label("avg_latency_ms"),
                func.count(BookEvent.id).label("invocations"),
                func.avg(BookEvent.quality_score).label("avg_quality"),
            )
            .where(BookEvent.agent_name.is_not(None))
            .where(BookEvent.timestamp >= since)
            .group_by(BookEvent.agent_name)
        )
        agent_result = await self._db.execute(agent_perf_stmt)
        agent_performance = [
            {
                "agent_name": row.agent_name,
                "avg_latency_ms": round(float(row.avg_latency_ms or 0), 1),
                "invocations": row.invocations,
                "avg_quality": round(float(row.avg_quality or 0), 2),
            }
            for row in agent_result.all()
        ]

        # Provider error rates
        error_stmt = (
            select(
                BookEvent.provider_id,
                func.count(BookEvent.id).label("total"),
                func.count(BookEvent.error_details).label("errors"),
            )
            .where(BookEvent.provider_id.is_not(None))
            .where(BookEvent.timestamp >= since)
            .group_by(BookEvent.provider_id)
        )
        error_result = await self._db.execute(error_stmt)
        error_rates = [
            {
                "provider": row.provider_id,
                "total_calls": row.total,
                "error_count": row.errors,
                "error_rate": round(row.errors / max(row.total, 1) * 100, 2),
            }
            for row in error_result.all()
        ]

        success_rate = (
            round(gen_completed / max(gen_started, 1) * 100, 1) if gen_started else 0
        )

        return {
            "period_days": days,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "generation_stats": {
                "started": gen_started,
                "completed": gen_completed,
                "failed": gen_failed,
                "success_rate_percent": success_rate,
            },
            "quality_scores": {
                "average": round(float(avg_quality or 0), 2),
            },
            "agent_performance": agent_performance,
            "error_rates": error_rates,
        }
