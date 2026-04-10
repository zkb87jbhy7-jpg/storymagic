"""VoiceProfile model - maps to the 'voice_profiles' table."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Numeric, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.user import User


class VoiceProfile(Base):
    __tablename__ = "voice_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[Optional[str]] = mapped_column(String(20))
    family_role: Mapped[Optional[str]] = mapped_column(String(30))
    language: Mapped[Optional[str]] = mapped_column(String(10))
    gender: Mapped[Optional[str]] = mapped_column(String(20))
    age_range: Mapped[Optional[str]] = mapped_column(String(20))
    preview_audio_url: Mapped[Optional[str]] = mapped_column(String(500))
    original_recording_url: Mapped[Optional[str]] = mapped_column(String(500))
    clone_status: Mapped[Optional[str]] = mapped_column(String(20))
    provider: Mapped[Optional[str]] = mapped_column(String(30))
    provider_voice_id: Mapped[Optional[str]] = mapped_column(String(255))
    quality_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(3, 2))
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="voice_profiles")

    def __repr__(self) -> str:
        return f"<VoiceProfile(id={self.id}, name={self.name!r})>"
