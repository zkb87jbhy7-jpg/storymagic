"""Moderation service — content review queue, decisions, and enforcement.

Provides the admin moderation interface for reviewing AI-generated content,
marketplace templates, and user-reported issues. Supports the automated
content moderation pipeline (Chapter 3.6) and human review queue.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.book import GeneratedBook
from app.models.template import StoryTemplate

# Supported moderation actions
_VALID_ACTIONS = {
    "approve",
    "reject",
    "request_changes",
    "suspend",
    "escalate",
}

# Item types that can be moderated
_ITEM_TYPES = {
    "book",
    "template",
    "illustration",
    "voice",
    "report",
}


class ModerationService:
    """Business logic for content moderation and admin review."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_queue(
        self,
        *,
        item_type: str | None = None,
        status_filter: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict[str, Any]:
        """Return the moderation queue with items pending review.

        Combines pending templates, flagged books, and reported content
        into a unified queue ordered by submission time.

        Args:
            item_type: Filter by item type (``"book"``, ``"template"``,
                etc.). ``None`` returns all types.
            status_filter: Filter by moderation status (``"pending"``,
                ``"in_review"``, ``"escalated"``).
            page: 1-based page number.
            page_size: Items per page.

        Returns:
            Paginated response with ``data`` (list of queue items),
            ``total``, ``pending_count``, and pagination metadata.
        """
        items: list[dict[str, Any]] = []

        # Templates pending review
        if item_type is None or item_type == "template":
            template_status = "review"
            if status_filter == "pending":
                template_status = "review"

            template_stmt = (
                select(StoryTemplate)
                .where(StoryTemplate.status == template_status)
                .order_by(StoryTemplate.created_at.asc())
            )
            template_result = await self._db.execute(template_stmt)
            for template in template_result.scalars().all():
                items.append({
                    "item_id": str(template.id),
                    "item_type": "template",
                    "title": template.title,
                    "creator_id": str(template.creator_id) if template.creator_id else None,
                    "category": template.category,
                    "language": template.language,
                    "submitted_at": (
                        template.created_at.isoformat() if template.created_at else None
                    ),
                    "moderation_status": "pending",
                    "priority": "normal",
                })

        # Books flagged by quality pipeline
        if item_type is None or item_type == "book":
            flagged_stmt = (
                select(GeneratedBook)
                .where(GeneratedBook.status == "preview")
                .where(GeneratedBook.quality_scores.is_not(None))
                .order_by(GeneratedBook.created_at.asc())
            )
            flagged_result = await self._db.execute(flagged_stmt)
            for book in flagged_result.scalars().all():
                quality = book.quality_scores or {}
                overall_score = quality.get("overall", 100)

                # Only include books that need review (score below threshold)
                if overall_score < 75:
                    items.append({
                        "item_id": str(book.id),
                        "item_type": "book",
                        "title": book.title or "Untitled",
                        "user_id": str(book.user_id),
                        "quality_score": overall_score,
                        "creation_method": book.creation_method,
                        "submitted_at": (
                            book.created_at.isoformat() if book.created_at else None
                        ),
                        "moderation_status": "pending",
                        "priority": "high" if overall_score < 50 else "normal",
                    })

        # Sort by submission time
        items.sort(key=lambda x: x.get("submitted_at") or "")

        total = len(items)
        pending_count = sum(1 for i in items if i["moderation_status"] == "pending")

        # Paginate
        start = (page - 1) * page_size
        end = start + page_size
        page_items = items[start:end]

        total_pages = max(1, (total + page_size - 1) // page_size)

        return {
            "data": page_items,
            "total": total,
            "pending_count": pending_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }

    async def review_item(
        self,
        item_id: uuid.UUID,
        *,
        item_type: str,
    ) -> dict[str, Any]:
        """Retrieve detailed information about a moderation queue item.

        Args:
            item_id: UUID of the item to review.
            item_type: One of ``"book"``, ``"template"``.

        Returns:
            Detailed dictionary with full item data for the reviewer.

        Raises:
            HTTPException: 400 if *item_type* is not supported.
            HTTPException: 404 if the item is not found.
        """
        if item_type not in _ITEM_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid item type. Must be one of: {sorted(_ITEM_TYPES)}",
            )

        if item_type == "template":
            stmt = select(StoryTemplate).where(StoryTemplate.id == item_id)
            result = await self._db.execute(stmt)
            template: StoryTemplate | None = result.scalar_one_or_none()

            if template is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Template not found",
                )

            return {
                "item_id": str(template.id),
                "item_type": "template",
                "title": template.title,
                "title_he": template.title_he,
                "description": template.description,
                "description_he": template.description_he,
                "category": template.category,
                "age_range": f"{template.age_range_min}-{template.age_range_max}",
                "language": template.language,
                "is_rhyming": template.is_rhyming,
                "scene_count": (
                    len(template.scene_definitions)
                    if isinstance(template.scene_definitions, list)
                    else 0
                ),
                "scene_definitions": template.scene_definitions,
                "cover_image_url": template.cover_image_url,
                "price": float(template.price or 0),
                "creator_id": str(template.creator_id) if template.creator_id else None,
                "status": template.status,
                "created_at": (
                    template.created_at.isoformat() if template.created_at else None
                ),
            }

        if item_type == "book":
            stmt = select(GeneratedBook).where(GeneratedBook.id == item_id)
            result = await self._db.execute(stmt)
            book: GeneratedBook | None = result.scalar_one_or_none()

            if book is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Book not found",
                )

            return {
                "item_id": str(book.id),
                "item_type": "book",
                "title": book.title,
                "user_id": str(book.user_id),
                "creation_method": book.creation_method,
                "free_prompt": book.free_prompt,
                "illustration_style": book.illustration_style,
                "mood_setting": book.mood_setting,
                "quality_scores": book.quality_scores,
                "status": book.status,
                "is_bilingual": book.is_bilingual,
                "created_at": (
                    book.created_at.isoformat() if book.created_at else None
                ),
            }

        # Fallback for other item types (illustration, voice, report)
        return {
            "item_id": str(item_id),
            "item_type": item_type,
            "message": f"Detailed review for {item_type} items is not yet implemented",
        }

    async def take_action(
        self,
        item_id: uuid.UUID,
        *,
        item_type: str,
        action: str,
        reviewer_notes: str | None = None,
        reviewer_user_id: uuid.UUID | None = None,
    ) -> dict[str, Any]:
        """Take a moderation action on a queue item.

        Args:
            item_id: UUID of the item.
            item_type: ``"book"`` or ``"template"``.
            action: One of ``"approve"``, ``"reject"``,
                ``"request_changes"``, ``"suspend"``, ``"escalate"``.
            reviewer_notes: Optional notes from the reviewer.
            reviewer_user_id: UUID of the admin performing the action.

        Returns:
            Dictionary with ``item_id``, ``action_taken``,
            ``new_status``, and ``reviewed_at``.

        Raises:
            HTTPException: 400 if *action* is invalid.
            HTTPException: 404 if the item is not found.
        """
        if action not in _VALID_ACTIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid action. Must be one of: {sorted(_VALID_ACTIONS)}",
            )

        new_status: str

        if item_type == "template":
            stmt = select(StoryTemplate).where(StoryTemplate.id == item_id)
            result = await self._db.execute(stmt)
            template: StoryTemplate | None = result.scalar_one_or_none()

            if template is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Template not found",
                )

            if action == "approve":
                template.status = "published"
                new_status = "published"
            elif action == "reject":
                template.status = "draft"
                new_status = "rejected"
            elif action == "request_changes":
                template.status = "draft"
                new_status = "changes_requested"
            elif action == "suspend":
                template.status = "suspended"
                new_status = "suspended"
            else:  # escalate
                new_status = "escalated"

            await self._db.flush()

        elif item_type == "book":
            stmt = select(GeneratedBook).where(GeneratedBook.id == item_id)
            result = await self._db.execute(stmt)
            book: GeneratedBook | None = result.scalar_one_or_none()

            if book is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Book not found",
                )

            if action == "approve":
                book.status = "preview"
                new_status = "approved"
            elif action == "reject":
                book.status = "draft"
                new_status = "rejected"
            elif action == "suspend":
                book.status = "draft"
                new_status = "suspended"
            else:
                new_status = action

            book.updated_at = datetime.now(timezone.utc)
            await self._db.flush()

        else:
            new_status = action

        # TODO: Log moderation action to audit trail
        # await audit_log.record(
        #     action="moderation_action",
        #     item_id=item_id,
        #     item_type=item_type,
        #     action_taken=action,
        #     reviewer_id=reviewer_user_id,
        #     notes=reviewer_notes,
        # )

        return {
            "item_id": str(item_id),
            "item_type": item_type,
            "action_taken": action,
            "new_status": new_status,
            "reviewer_notes": reviewer_notes,
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
            "reviewed_by": str(reviewer_user_id) if reviewer_user_id else None,
        }
