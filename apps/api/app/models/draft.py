"""UserDraft model - maps to the 'user_drafts' table."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import ForeignKey, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.user import User


class UserDraft(Base):
    __tablename__ = "user_drafts"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    draft_type: Mapped[str] = mapped_column(String(30), nullable=False)
    step: Mapped[Optional[int]] = mapped_column(Integer)
    data: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    expires_at: Mapped[Optional[datetime]] = mapped_column()
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="drafts")

    def __repr__(self) -> str:
        return f"<UserDraft(id={self.id}, type={self.draft_type!r})>"
