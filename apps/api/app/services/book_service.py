"""Book service — creation, lifecycle management, and interactive features.

Handles book creation from prompts and templates, status transitions,
reading progress tracking, Living Book chapters, and approval flow.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.book import GeneratedBook
from app.models.child import ChildProfile
from app.models.living_book import LivingBook
from app.models.page import BookPage
from app.models.template import StoryTemplate

# Valid status transitions enforced by update_status
_VALID_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"generating"},
    "generating": {"preview", "draft"},
    "preview": {"approved", "draft"},
    "approved": {"ordered"},
    "ordered": {"printing"},
    "printing": {"shipped"},
}


class BookService:
    """Business logic for book creation, reading, and lifecycle."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    # ── Creation ────────────────────────────────────────────────────────

    async def create_from_prompt(
        self,
        *,
        user_id: uuid.UUID,
        child_profile_ids: list[uuid.UUID],
        free_prompt: str,
        illustration_style: str | None = None,
        mood_setting: str | None = None,
        is_bilingual: bool = False,
        secondary_language: str | None = None,
        voice_profile_id: uuid.UUID | None = None,
        page_count: int = 12,
        is_rhyming: bool = False,
        language: str = "he",
    ) -> GeneratedBook:
        """Create a new book from a free-form user prompt.

        Validates child ownership and queues the generation workflow.

        Args:
            user_id: Owning user UUID.
            child_profile_ids: List of child profile UUIDs to feature.
            free_prompt: Natural language description of the desired story.
            illustration_style: One of the supported illustration styles.
            mood_setting: Desired mood/tone for the book.
            is_bilingual: Whether to produce a bilingual edition.
            secondary_language: The second language code (if bilingual).
            voice_profile_id: Optional voice profile for narration.
            page_count: Target page count (8-24).
            is_rhyming: Whether to attempt rhyming text.
            language: Primary language code.

        Returns:
            The newly created :class:`GeneratedBook` in ``"draft"`` status.

        Raises:
            HTTPException: 400 if prompt is empty or page_count out of range.
            HTTPException: 403 if any child profile does not belong to *user_id*.
        """
        if not free_prompt or not free_prompt.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A story prompt is required",
            )

        if not (8 <= page_count <= 24):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Page count must be between 8 and 24",
            )

        await self._validate_child_ownership(user_id, child_profile_ids)

        book = GeneratedBook(
            user_id=user_id,
            child_profile_ids=child_profile_ids,
            free_prompt=free_prompt.strip(),
            illustration_style=illustration_style,
            mood_setting=mood_setting,
            creation_method="free_prompt",
            is_bilingual=is_bilingual,
            secondary_language=secondary_language,
            voice_profile_id=voice_profile_id,
            status="draft",
        )
        self._db.add(book)
        await self._db.flush()
        await self._db.refresh(book)

        # TODO: Dispatch Temporal book-generation workflow
        # workflow_id = await temporal_client.start_workflow(...)
        # book.generation_workflow_id = workflow_id

        return book

    async def create_from_template(
        self,
        *,
        user_id: uuid.UUID,
        child_profile_ids: list[uuid.UUID],
        template_id: uuid.UUID,
        illustration_style: str | None = None,
        mood_setting: str | None = None,
        is_bilingual: bool = False,
        secondary_language: str | None = None,
        voice_profile_id: uuid.UUID | None = None,
    ) -> GeneratedBook:
        """Create a book from an existing story template.

        Args:
            user_id: Owning user UUID.
            child_profile_ids: List of child profile UUIDs to feature.
            template_id: UUID of the marketplace template to use.
            illustration_style: Override the template's default style.
            mood_setting: Override the template's default mood.
            is_bilingual: Whether to produce a bilingual edition.
            secondary_language: The second language code (if bilingual).
            voice_profile_id: Optional voice profile for narration.

        Returns:
            The newly created :class:`GeneratedBook`.

        Raises:
            HTTPException: 404 if the template is not found or not published.
            HTTPException: 403 if child profiles don't belong to *user_id*.
        """
        stmt = select(StoryTemplate).where(StoryTemplate.id == template_id)
        result = await self._db.execute(stmt)
        template: StoryTemplate | None = result.scalar_one_or_none()

        if template is None or template.status != "published":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found or not yet published",
            )

        await self._validate_child_ownership(user_id, child_profile_ids)

        book = GeneratedBook(
            user_id=user_id,
            child_profile_ids=child_profile_ids,
            story_template_id=template_id,
            illustration_style=illustration_style or "classic_storybook",
            mood_setting=mood_setting,
            creation_method="template",
            is_bilingual=is_bilingual,
            secondary_language=secondary_language,
            voice_profile_id=voice_profile_id,
            status="draft",
        )
        self._db.add(book)
        await self._db.flush()
        await self._db.refresh(book)
        return book

    # ── Retrieval ───────────────────────────────────────────────────────

    async def get_by_id(
        self,
        book_id: uuid.UUID,
        *,
        user_id: uuid.UUID | None = None,
        load_pages: bool = False,
    ) -> GeneratedBook:
        """Fetch a book by primary key.

        Args:
            book_id: UUID of the book.
            user_id: If provided, verify ownership.
            load_pages: Eagerly load book pages.

        Returns:
            The matching :class:`GeneratedBook`.

        Raises:
            HTTPException: 404 if not found; 403 on ownership mismatch.
        """
        stmt = select(GeneratedBook).where(GeneratedBook.id == book_id)
        if load_pages:
            stmt = stmt.options(selectinload(GeneratedBook.pages))

        result = await self._db.execute(stmt)
        book: GeneratedBook | None = result.scalar_one_or_none()

        if book is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found",
            )

        if user_id is not None and book.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this book",
            )

        return book

    async def list_by_user(
        self,
        user_id: uuid.UUID,
        *,
        page: int = 1,
        page_size: int = 20,
        status_filter: str | None = None,
    ) -> dict[str, Any]:
        """Return paginated books belonging to *user_id*.

        Args:
            user_id: UUID of the owning user.
            page: 1-based page number.
            page_size: Number of items per page.
            status_filter: Optionally filter by book status.

        Returns:
            Paginated response dict with ``data``, ``total``, ``page``,
            ``page_size``, ``total_pages``, ``has_next``, ``has_prev``.
        """
        base = select(GeneratedBook).where(GeneratedBook.user_id == user_id)
        if status_filter:
            base = base.where(GeneratedBook.status == status_filter)

        # Count
        count_stmt = select(func.count()).select_from(base.subquery())
        total: int = (await self._db.execute(count_stmt)).scalar_one()

        # Fetch page
        stmt = (
            base.order_by(GeneratedBook.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self._db.execute(stmt)
        books = list(result.scalars().all())

        total_pages = max(1, (total + page_size - 1) // page_size)

        return {
            "data": books,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }

    # ── Status management ───────────────────────────────────────────────

    async def update_status(
        self,
        book_id: uuid.UUID,
        *,
        new_status: str,
        user_id: uuid.UUID | None = None,
    ) -> GeneratedBook:
        """Transition a book to a new status with validation.

        Args:
            book_id: UUID of the book.
            new_status: Target status string.
            user_id: If provided, verify ownership.

        Returns:
            The updated :class:`GeneratedBook`.

        Raises:
            HTTPException: 400 if the transition is invalid.
        """
        book = await self.get_by_id(book_id, user_id=user_id)
        current = book.status or "draft"

        allowed = _VALID_TRANSITIONS.get(current, set())
        if new_status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Cannot transition from '{current}' to '{new_status}'. "
                    f"Allowed transitions: {sorted(allowed)}"
                ),
            )

        book.status = new_status
        book.updated_at = datetime.now(timezone.utc)
        await self._db.flush()
        await self._db.refresh(book)
        return book

    async def approve(
        self,
        book_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
    ) -> GeneratedBook:
        """Parent approves a book in preview, moving it to ``"approved"`` status.

        Args:
            book_id: UUID of the book.
            user_id: UUID of the approving user (must be owner).

        Returns:
            The approved :class:`GeneratedBook`.
        """
        return await self.update_status(
            book_id, new_status="approved", user_id=user_id
        )

    # ── Interactive / reading ───────────────────────────────────────────

    async def get_interactive_data(
        self,
        book_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Return the interactive book data for the digital reader.

        Args:
            book_id: UUID of the book.
            user_id: UUID of the requesting user.

        Returns:
            Dictionary with ``book_id``, ``title``, ``pages`` (list of
            page dicts with text, illustrations, animations, interactive
            elements), and ``voice_narration_url``.
        """
        book = await self.get_by_id(book_id, user_id=user_id, load_pages=True)

        pages_data: list[dict[str, Any]] = []
        for page in sorted(book.pages, key=lambda p: p.page_number):
            pages_data.append({
                "page_number": page.page_number,
                "text_primary": page.text_primary,
                "text_secondary": page.text_secondary,
                "illustration_url": page.illustration_url,
                "layout_type": page.layout_type,
                "animation_preset": page.animation_preset,
                "interactive_elements": page.interactive_elements,
                "performance_markup": page.performance_markup,
                "alt_text": page.alt_text,
                "fun_facts": page.fun_facts,
                "reading_buddy_question": page.reading_buddy_question,
            })

        return {
            "book_id": str(book.id),
            "title": book.title,
            "illustration_style": book.illustration_style,
            "voice_narration_url": book.voice_narration_url,
            "is_bilingual": book.is_bilingual,
            "secondary_language": book.secondary_language,
            "parental_guide": book.parental_guide,
            "pages": pages_data,
        }

    async def get_read_progress(
        self,
        book_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Retrieve reading progress for a book.

        Placeholder implementation. In production this reads from Redis
        and/or the analytics events table.

        Args:
            book_id: UUID of the book.
            user_id: UUID of the requesting user.

        Returns:
            Dictionary with ``book_id``, ``current_page``,
            ``total_pages``, ``completion_percent``, ``last_read_at``.
        """
        book = await self.get_by_id(book_id, user_id=user_id)

        page_count_stmt = (
            select(func.count())
            .select_from(BookPage)
            .where(BookPage.book_id == book_id)
        )
        total_pages: int = (await self._db.execute(page_count_stmt)).scalar_one()

        # TODO: Read actual progress from Redis / analytics_events
        return {
            "book_id": str(book.id),
            "current_page": 1,
            "total_pages": total_pages,
            "completion_percent": 0.0,
            "last_read_at": None,
        }

    async def update_read_progress(
        self,
        book_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
        current_page: int,
    ) -> dict[str, Any]:
        """Update reading progress for a book.

        Args:
            book_id: UUID of the book.
            user_id: UUID of the requesting user.
            current_page: The page number the reader is on.

        Returns:
            Updated progress dictionary.
        """
        book = await self.get_by_id(book_id, user_id=user_id)

        page_count_stmt = (
            select(func.count())
            .select_from(BookPage)
            .where(BookPage.book_id == book_id)
        )
        total_pages: int = (await self._db.execute(page_count_stmt)).scalar_one()

        if current_page < 1 or (total_pages > 0 and current_page > total_pages):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"current_page must be between 1 and {total_pages}",
            )

        completion = (current_page / total_pages * 100) if total_pages > 0 else 0.0

        # TODO: Persist to Redis / analytics_events
        return {
            "book_id": str(book.id),
            "current_page": current_page,
            "total_pages": total_pages,
            "completion_percent": round(completion, 1),
            "last_read_at": datetime.now(timezone.utc).isoformat(),
        }

    # ── Living Book ─────────────────────────────────────────────────────

    async def toggle_living_book(
        self,
        book_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
        child_id: uuid.UUID,
        enable: bool = True,
    ) -> dict[str, Any]:
        """Enable or disable Living Book mode for a book.

        Args:
            book_id: UUID of the book.
            user_id: UUID of the requesting user.
            child_id: UUID of the child this living book tracks.
            enable: ``True`` to enable, ``False`` to disable.

        Returns:
            Dictionary with ``book_id``, ``is_living_book``, and
            ``living_book_id`` (if enabled).
        """
        book = await self.get_by_id(book_id, user_id=user_id)

        if enable and not book.is_living_book:
            book.is_living_book = True

            living = LivingBook(
                initial_book_id=book.id,
                child_id=child_id,
                user_id=user_id,
            )
            self._db.add(living)
            await self._db.flush()
            await self._db.refresh(living)

            book.updated_at = datetime.now(timezone.utc)
            await self._db.flush()

            return {
                "book_id": str(book.id),
                "is_living_book": True,
                "living_book_id": str(living.id),
            }

        if not enable and book.is_living_book:
            book.is_living_book = False
            book.updated_at = datetime.now(timezone.utc)

            # Deactivate living book record
            stmt = (
                select(LivingBook)
                .where(LivingBook.initial_book_id == book.id)
                .where(LivingBook.is_active.is_(True))
            )
            result = await self._db.execute(stmt)
            living_book: LivingBook | None = result.scalar_one_or_none()
            if living_book:
                living_book.is_active = False

            await self._db.flush()

        return {
            "book_id": str(book.id),
            "is_living_book": book.is_living_book or False,
            "living_book_id": None,
        }

    async def add_living_book_chapter(
        self,
        book_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
        chapter_title: str,
        chapter_prompt: str,
    ) -> dict[str, Any]:
        """Add a new chapter to a Living Book.

        Each chapter is stored as a JSONB entry in the ``chapters`` array
        on the :class:`LivingBook` record.

        Args:
            book_id: UUID of the parent book.
            user_id: UUID of the requesting user.
            chapter_title: Title for the new chapter.
            chapter_prompt: Creative prompt or description.

        Returns:
            Dictionary with ``living_book_id``, ``chapter_number``,
            and ``chapter_title``.

        Raises:
            HTTPException: 400 if the book is not a Living Book.
        """
        book = await self.get_by_id(book_id, user_id=user_id)

        if not book.is_living_book:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This book is not a Living Book",
            )

        stmt = (
            select(LivingBook)
            .where(LivingBook.initial_book_id == book.id)
            .where(LivingBook.is_active.is_(True))
        )
        result = await self._db.execute(stmt)
        living: LivingBook | None = result.scalar_one_or_none()

        if living is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Active Living Book record not found",
            )

        chapters: list[dict[str, Any]] = living.chapters or []
        chapter_number = len(chapters) + 1

        new_chapter: dict[str, Any] = {
            "chapter_number": chapter_number,
            "title": chapter_title,
            "prompt": chapter_prompt,
            "status": "draft",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        chapters.append(new_chapter)
        living.chapters = chapters

        await self._db.flush()
        await self._db.refresh(living)

        return {
            "living_book_id": str(living.id),
            "chapter_number": chapter_number,
            "chapter_title": chapter_title,
        }

    # ── Internal helpers ────────────────────────────────────────────────

    async def _validate_child_ownership(
        self,
        user_id: uuid.UUID,
        child_profile_ids: list[uuid.UUID],
    ) -> None:
        """Verify that all child profiles belong to the given user.

        Raises:
            HTTPException: 400 if the list is empty.
            HTTPException: 403 if any child profile belongs to a different user.
        """
        if not child_profile_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one child profile ID is required",
            )

        stmt = select(ChildProfile).where(
            ChildProfile.id.in_(child_profile_ids)
        )
        result = await self._db.execute(stmt)
        profiles = list(result.scalars().all())

        if len(profiles) != len(child_profile_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more child profiles not found",
            )

        for profile in profiles:
            if profile.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="One or more child profiles do not belong to you",
                )
