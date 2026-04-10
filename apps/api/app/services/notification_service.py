"""Notification service — in-app and push notification management.

Creates, retrieves, and manages notifications for book generation
completion, birthday reminders, recommendations, and system alerts.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification

# Notification types used across the platform
NOTIFICATION_TYPES = {
    "book_ready",
    "book_generation_failed",
    "birthday_reminder",
    "book_of_week",
    "order_shipped",
    "order_delivered",
    "consent_received",
    "voice_ready",
    "subscription_renewal",
    "subscription_expiring",
    "gift_received",
    "system_announcement",
    "living_book_reminder",
    "payout_complete",
}


class NotificationService:
    """Business logic for notification delivery and management."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(
        self,
        *,
        user_id: uuid.UUID,
        notification_type: str,
        title: str,
        message: str,
        title_he: str | None = None,
        message_he: str | None = None,
        action_url: str | None = None,
        send_push: bool = False,
    ) -> Notification:
        """Create a new notification for a user.

        Args:
            user_id: UUID of the recipient user.
            notification_type: Type identifier (e.g. ``"book_ready"``).
            title: Notification title (English).
            message: Notification body (English).
            title_he: Notification title (Hebrew).
            message_he: Notification body (Hebrew).
            action_url: Deep-link URL to navigate on tap.
            send_push: Whether to also send a push notification.

        Returns:
            The newly created :class:`Notification`.

        Raises:
            HTTPException: 400 if *notification_type* is not recognised.
        """
        if notification_type not in NOTIFICATION_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown notification type '{notification_type}'",
            )

        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            title_he=title_he,
            message=message,
            message_he=message_he,
            action_url=action_url,
            is_read=False,
            is_push_sent=False,
        )
        self._db.add(notification)
        await self._db.flush()
        await self._db.refresh(notification)

        if send_push:
            await self.send_push(notification.id, user_id=user_id)

        return notification

    async def list_for_user(
        self,
        user_id: uuid.UUID,
        *,
        page: int = 1,
        page_size: int = 20,
        unread_only: bool = False,
    ) -> dict[str, Any]:
        """Return paginated notifications for a user.

        Args:
            user_id: UUID of the user.
            page: 1-based page number.
            page_size: Items per page.
            unread_only: If ``True``, only return unread notifications.

        Returns:
            Paginated response with ``data``, ``total``, ``unread_count``,
            and pagination metadata.
        """
        base = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            base = base.where(Notification.is_read.is_(False))

        # Total count for current filter
        count_stmt = select(func.count()).select_from(base.subquery())
        total: int = (await self._db.execute(count_stmt)).scalar_one()

        # Unread count (always computed regardless of filter)
        unread_stmt = (
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == user_id)
            .where(Notification.is_read.is_(False))
        )
        unread_count: int = (await self._db.execute(unread_stmt)).scalar_one()

        # Fetch page
        stmt = (
            base.order_by(Notification.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self._db.execute(stmt)
        notifications = list(result.scalars().all())

        total_pages = max(1, (total + page_size - 1) // page_size)

        return {
            "data": notifications,
            "total": total,
            "unread_count": unread_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }

    async def mark_read(
        self,
        notification_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
    ) -> Notification:
        """Mark a single notification as read.

        Args:
            notification_id: UUID of the notification.
            user_id: UUID of the requesting user (ownership check).

        Returns:
            The updated :class:`Notification`.

        Raises:
            HTTPException: 404 if the notification is not found.
            HTTPException: 403 if it does not belong to the user.
        """
        stmt = select(Notification).where(Notification.id == notification_id)
        result = await self._db.execute(stmt)
        notification: Notification | None = result.scalar_one_or_none()

        if notification is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found",
            )

        if notification.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this notification",
            )

        notification.is_read = True
        await self._db.flush()
        await self._db.refresh(notification)
        return notification

    async def mark_all_read(
        self,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Mark all unread notifications as read for a user.

        Args:
            user_id: UUID of the user.

        Returns:
            Dictionary with ``updated_count``.
        """
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id)
            .where(Notification.is_read.is_(False))
            .values(is_read=True)
        )
        result = await self._db.execute(stmt)

        return {"updated_count": result.rowcount}

    async def send_push(
        self,
        notification_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Send a push notification to the user's mobile device.

        In production this dispatches to FCM (Firebase Cloud Messaging)
        for Android and APNs for iOS.

        Args:
            notification_id: UUID of the notification.
            user_id: UUID of the target user.

        Returns:
            Dictionary with ``notification_id``, ``push_sent``, and
            ``message``.
        """
        stmt = select(Notification).where(Notification.id == notification_id)
        result = await self._db.execute(stmt)
        notification: Notification | None = result.scalar_one_or_none()

        if notification is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found",
            )

        if notification.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this notification",
            )

        # TODO: Integrate with FCM / APNs for real push delivery
        # push_result = await push_provider.send(
        #     user_id=user_id,
        #     title=notification.title,
        #     body=notification.message,
        #     data={"action_url": notification.action_url},
        # )

        notification.is_push_sent = True
        await self._db.flush()

        return {
            "notification_id": str(notification_id),
            "push_sent": True,
            "message": "Push notification queued for delivery",
        }
