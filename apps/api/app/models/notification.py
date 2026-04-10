"""Notification model - maps to the 'notifications' table."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, ForeignKey, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.user import User


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    type: Mapped[str] = mapped_column(String(30), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255))
    title_he: Mapped[Optional[str]] = mapped_column(String(255))
    message: Mapped[Optional[str]] = mapped_column(Text)
    message_he: Mapped[Optional[str]] = mapped_column(Text)
    action_url: Mapped[Optional[str]] = mapped_column(String(500))
    is_read: Mapped[Optional[bool]] = mapped_column(
        Boolean, server_default=text("false")
    )
    is_push_sent: Mapped[Optional[bool]] = mapped_column(
        Boolean, server_default=text("false")
    )
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    user: Mapped[User] = relationship(back_populates="notifications")

    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, type={self.type!r})>"
