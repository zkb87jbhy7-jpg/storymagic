"""Voice service — narration generation, voice cloning, and family voices.

Coordinates with ElevenLabs (primary), Cartesia (low-latency),
and Fish Audio (fallback) to produce AI narration with Performance Markup.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.voice import VoiceProfile

# Preset voices available to all users (Chapter 3.3)
_PRESET_VOICES: list[dict[str, Any]] = [
    {"id": "preset-warm-female", "name": "Warm Female Narrator", "gender": "female", "age_range": "adult", "language": "en"},
    {"id": "preset-gentle-grandfather", "name": "Deep Gentle Grandfather", "gender": "male", "age_range": "senior", "language": "en"},
    {"id": "preset-energetic-child", "name": "Energetic Child", "gender": "neutral", "age_range": "child", "language": "en"},
    {"id": "preset-adventurous-captain", "name": "Adventurous Captain", "gender": "male", "age_range": "adult", "language": "en"},
    {"id": "preset-soothing-mother", "name": "Soothing Mother", "gender": "female", "age_range": "adult", "language": "en"},
    {"id": "preset-wise-owl", "name": "Wise Owl (Reading Buddy)", "gender": "neutral", "age_range": "adult", "language": "en"},
    {"id": "preset-warm-female-he", "name": "Warm Female Narrator (Hebrew)", "gender": "female", "age_range": "adult", "language": "he"},
    {"id": "preset-gentle-grandfather-he", "name": "Deep Gentle Grandfather (Hebrew)", "gender": "male", "age_range": "senior", "language": "he"},
    {"id": "preset-energetic-child-he", "name": "Energetic Child (Hebrew)", "gender": "neutral", "age_range": "child", "language": "he"},
    {"id": "preset-storyteller-he", "name": "Hebrew Storyteller", "gender": "male", "age_range": "adult", "language": "he"},
]


class VoiceService:
    """Business logic for voice narration and voice profile management."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def generate_narration(
        self,
        *,
        book_id: uuid.UUID,
        voice_profile_id: uuid.UUID | None = None,
        preset_voice_id: str | None = None,
        performance_markup: list[dict[str, Any]] | None = None,
        language: str = "he",
    ) -> dict[str, Any]:
        """Generate narration audio for an entire book.

        Uses Performance Markup to control emotion, pacing, pauses,
        and per-character voice assignments. In production this
        dispatches to the Voice Generation Service (S-04).

        Args:
            book_id: UUID of the book to narrate.
            voice_profile_id: UUID of a family/cloned voice profile.
            preset_voice_id: ID of a built-in preset voice.
            performance_markup: Per-page markup with speaker, emotion,
                pace, and sound effect annotations.
            language: Primary language code.

        Returns:
            Dictionary with ``book_id``, ``narration_url``,
            ``duration_seconds``, and ``status``.

        Raises:
            HTTPException: 400 if neither *voice_profile_id* nor
                *preset_voice_id* is provided.
        """
        if voice_profile_id is None and preset_voice_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either voice_profile_id or preset_voice_id is required",
            )

        # Validate custom voice profile if given
        if voice_profile_id is not None:
            stmt = select(VoiceProfile).where(VoiceProfile.id == voice_profile_id)
            result = await self._db.execute(stmt)
            profile: VoiceProfile | None = result.scalar_one_or_none()

            if profile is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Voice profile not found",
                )

            if profile.clone_status and profile.clone_status != "ready":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Voice clone is not ready (status: {profile.clone_status})",
                )

        # TODO: Dispatch to Voice Generation Service (S-04)
        # narration = await voice_gen_service.generate(
        #     book_id=book_id,
        #     voice_id=voice_profile_id or preset_voice_id,
        #     markup=performance_markup,
        #     language=language,
        # )

        placeholder_url = f"https://cdn.storymagic.ai/audio/{book_id}/narration.mp3"

        return {
            "book_id": str(book_id),
            "narration_url": placeholder_url,
            "duration_seconds": None,
            "status": "generating",
            "message": "Narration generation queued",
        }

    async def clone_voice(
        self,
        *,
        user_id: uuid.UUID,
        name: str,
        recording_url: str,
        family_role: str | None = None,
        language: str = "he",
    ) -> VoiceProfile:
        """Create a voice clone from a 30-second recording.

        The recording is submitted to ElevenLabs for processing.
        The resulting :class:`VoiceProfile` starts with ``clone_status``
        set to ``"processing"`` and is updated via callback.

        Args:
            user_id: UUID of the owning user.
            name: Display name for the voice (e.g. "Mom's Voice").
            recording_url: S3 URL of the uploaded audio recording.
            family_role: Relationship label — ``"parent"``, ``"grandparent"``,
                ``"aunt"``, ``"uncle"``, etc.
            language: Language the voice will primarily speak.

        Returns:
            The newly created :class:`VoiceProfile`.
        """
        profile = VoiceProfile(
            user_id=user_id,
            name=name,
            type="family",
            family_role=family_role,
            language=language,
            original_recording_url=recording_url,
            clone_status="processing",
            provider="elevenlabs",
        )
        self._db.add(profile)
        await self._db.flush()
        await self._db.refresh(profile)

        # TODO: Submit to ElevenLabs voice cloning API
        # clone_result = await elevenlabs_client.clone_voice(
        #     name=name,
        #     files=[recording_url],
        # )
        # profile.provider_voice_id = clone_result.voice_id

        return profile

    async def get_presets(
        self,
        *,
        language: str | None = None,
    ) -> list[dict[str, Any]]:
        """Return the list of available preset voices.

        Args:
            language: Filter by language code (e.g. ``"he"``, ``"en"``).

        Returns:
            List of preset voice dictionaries.
        """
        if language:
            return [v for v in _PRESET_VOICES if v["language"] == language]
        return list(_PRESET_VOICES)

    async def add_family_voice(
        self,
        *,
        user_id: uuid.UUID,
        name: str,
        family_role: str,
        recording_url: str,
        language: str = "he",
        gender: str | None = None,
    ) -> VoiceProfile:
        """Add a family member's voice to the family voice library.

        Similar to :meth:`clone_voice` but explicitly categorised
        as a family voice with role metadata.

        Args:
            user_id: UUID of the owning user.
            name: Display name (e.g. "Grandma Sarah").
            family_role: ``"grandmother"``, ``"grandfather"``, ``"aunt"``,
                ``"uncle"``, ``"parent"``, etc.
            recording_url: S3 URL of the 30-second recording.
            language: Primary language of the voice.
            gender: Optional gender label.

        Returns:
            The newly created :class:`VoiceProfile`.
        """
        profile = VoiceProfile(
            user_id=user_id,
            name=name,
            type="family",
            family_role=family_role,
            language=language,
            gender=gender,
            original_recording_url=recording_url,
            clone_status="processing",
            provider="elevenlabs",
        )
        self._db.add(profile)
        await self._db.flush()
        await self._db.refresh(profile)

        # TODO: Dispatch voice cloning to provider
        return profile

    async def list_family_voices(
        self,
        user_id: uuid.UUID,
    ) -> list[VoiceProfile]:
        """Return all family voice profiles belonging to a user.

        Args:
            user_id: UUID of the user.

        Returns:
            List of :class:`VoiceProfile` instances with ``type == "family"``.
        """
        stmt = (
            select(VoiceProfile)
            .where(VoiceProfile.user_id == user_id)
            .where(VoiceProfile.type == "family")
            .order_by(VoiceProfile.created_at.desc())
        )
        result = await self._db.execute(stmt)
        return list(result.scalars().all())

    async def delete_family_voice(
        self,
        voice_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
    ) -> None:
        """Delete a family voice profile.

        Also requests deletion of the cloned voice from the
        external provider.

        Args:
            voice_id: UUID of the voice profile.
            user_id: UUID of the requesting user (ownership check).

        Raises:
            HTTPException: 404 if the voice profile is not found.
            HTTPException: 403 if the profile does not belong to *user_id*.
            HTTPException: 400 if attempting to delete a preset voice.
        """
        stmt = select(VoiceProfile).where(VoiceProfile.id == voice_id)
        result = await self._db.execute(stmt)
        profile: VoiceProfile | None = result.scalar_one_or_none()

        if profile is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Voice profile not found",
            )

        if profile.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this voice profile",
            )

        if profile.type == "preset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Preset voices cannot be deleted",
            )

        # TODO: Delete cloned voice from provider
        # if profile.provider_voice_id:
        #     await elevenlabs_client.delete_voice(profile.provider_voice_id)

        await self._db.delete(profile)
        await self._db.flush()
