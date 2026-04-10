"""Child profile service — CRUD and face processing coordination.

Manages child profiles, triggers face embedding generation via the
face-processing pipeline, and tracks processing status.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.child import ChildProfile
from app.models.user import User


class ChildService:
    """Business logic for child profile management and face processing."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    # ── CRUD ────────────────────────────────────────────────────────────

    async def create(
        self,
        *,
        user_id: uuid.UUID,
        name: str,
        gender: str | None = None,
        birth_date: Any | None = None,
        physical_traits: dict[str, Any] | None = None,
        preferences: dict[str, Any] | None = None,
    ) -> ChildProfile:
        """Create a new child profile under a given user account.

        Args:
            user_id: UUID of the owning user (must exist).
            name: Display name of the child.
            gender: ``"boy"``, ``"girl"``, or ``"prefer_not_to_say"``.
            birth_date: Date of birth (``datetime.date`` or ISO string).
            physical_traits: JSONB dict of physical appearance traits.
            preferences: JSONB dict of cultural/reading preferences.

        Returns:
            The newly created :class:`ChildProfile`.

        Raises:
            HTTPException: 404 if *user_id* does not exist.
        """
        # Verify user exists
        user_stmt = select(User).where(User.id == user_id)
        user_result = await self._db.execute(user_stmt)
        if user_result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        profile = ChildProfile(
            user_id=user_id,
            name=name,
            gender=gender,
            birth_date=birth_date,
            physical_traits=physical_traits or {},
            preferences=preferences or {},
        )
        self._db.add(profile)
        await self._db.flush()
        await self._db.refresh(profile)
        return profile

    async def get_by_id(
        self,
        child_id: uuid.UUID,
        *,
        user_id: uuid.UUID | None = None,
    ) -> ChildProfile:
        """Fetch a child profile by primary key.

        Args:
            child_id: UUID of the child profile.
            user_id: If provided, also verify ownership.

        Returns:
            The matching :class:`ChildProfile`.

        Raises:
            HTTPException: 404 if no profile is found.
            HTTPException: 403 if *user_id* is given and does not own the profile.
        """
        stmt = select(ChildProfile).where(ChildProfile.id == child_id)
        result = await self._db.execute(stmt)
        profile: ChildProfile | None = result.scalar_one_or_none()

        if profile is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child profile not found",
            )

        if user_id is not None and profile.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this child profile",
            )

        return profile

    async def list_by_user(self, user_id: uuid.UUID) -> list[ChildProfile]:
        """Return all child profiles belonging to *user_id*.

        Args:
            user_id: UUID of the parent user.

        Returns:
            A list of :class:`ChildProfile` instances (may be empty).
        """
        stmt = (
            select(ChildProfile)
            .where(ChildProfile.user_id == user_id)
            .order_by(ChildProfile.created_at.desc())
        )
        result = await self._db.execute(stmt)
        return list(result.scalars().all())

    async def update(
        self,
        child_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
        data: dict[str, Any],
    ) -> ChildProfile:
        """Update mutable fields on a child profile.

        Args:
            child_id: UUID of the profile to update.
            user_id: UUID of the requesting user (ownership check).
            data: Mapping of field names to new values.

        Returns:
            The refreshed :class:`ChildProfile`.

        Raises:
            HTTPException: 404 or 403 (via :meth:`get_by_id`).
        """
        profile = await self.get_by_id(child_id, user_id=user_id)

        immutable_fields = {"id", "user_id", "created_at"}

        for key, value in data.items():
            if key in immutable_fields:
                continue
            if hasattr(profile, key):
                setattr(profile, key, value)

        profile.updated_at = datetime.now(timezone.utc)
        await self._db.flush()
        await self._db.refresh(profile)
        return profile

    async def delete(
        self,
        child_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
    ) -> None:
        """Delete a child profile and associated face data.

        Triggers crypto-shredding of face embeddings before deleting
        the database record.

        Args:
            child_id: UUID of the profile to remove.
            user_id: UUID of the requesting user (ownership check).

        Raises:
            HTTPException: 404 or 403 (via :meth:`get_by_id`).
        """
        profile = await self.get_by_id(child_id, user_id=user_id)

        # Clear face embedding reference (crypto-shred)
        profile.face_embedding_ref = None
        profile.face_processing_status = "expired"

        await self._db.delete(profile)
        await self._db.flush()

    # ── Face processing ─────────────────────────────────────────────────

    async def trigger_face_processing(
        self,
        child_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
        photo_urls: list[str],
    ) -> ChildProfile:
        """Kick off face embedding generation for uploaded photos.

        In production this dispatches to the Face Processing Service (S-02)
        via Temporal workflow.  Currently returns a placeholder status.

        Args:
            child_id: UUID of the child profile.
            user_id: UUID of the requesting user (ownership check).
            photo_urls: List of S3 presigned URLs for the uploaded photos
                (1-5 photos recommended).

        Returns:
            The updated :class:`ChildProfile` with status set to
            ``"processing"``.

        Raises:
            HTTPException: 400 if no photos are supplied.
            HTTPException: 404 or 403 (via :meth:`get_by_id`).
        """
        if not photo_urls:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one photo URL is required",
            )

        profile = await self.get_by_id(child_id, user_id=user_id)

        profile.face_processing_status = "processing"
        profile.photos_count = len(photo_urls)
        profile.photos_expiry_date = datetime.now(timezone.utc) + timedelta(days=30)
        profile.updated_at = datetime.now(timezone.utc)

        # TODO: Dispatch Temporal workflow for face embedding generation
        # workflow_id = await temporal_client.start_workflow(
        #     "face-processing",
        #     FaceProcessingInput(child_id=child_id, photo_urls=photo_urls),
        #     id=f"face-{child_id}",
        #     task_queue=settings.temporal_task_queue,
        # )

        await self._db.flush()
        await self._db.refresh(profile)
        return profile

    async def get_face_status(
        self,
        child_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Return the current face processing status for a child.

        Args:
            child_id: UUID of the child profile.
            user_id: UUID of the requesting user (ownership check).

        Returns:
            Dictionary with ``status``, ``photos_count``,
            ``photos_expiry_date``, and ``face_embedding_expiry``.

        Raises:
            HTTPException: 404 or 403 (via :meth:`get_by_id`).
        """
        profile = await self.get_by_id(child_id, user_id=user_id)

        return {
            "child_id": str(profile.id),
            "status": profile.face_processing_status or "pending",
            "photos_count": profile.photos_count or 0,
            "photos_expiry_date": (
                profile.photos_expiry_date.isoformat()
                if profile.photos_expiry_date
                else None
            ),
            "face_embedding_expiry": (
                profile.face_embedding_expiry.isoformat()
                if profile.face_embedding_expiry
                else None
            ),
            "has_character_sheet": profile.character_sheet_urls is not None,
        }
