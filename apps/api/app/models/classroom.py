"""Classroom and ClassroomStudent models - maps to 'classrooms' and 'classroom_students' tables."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.user import User


class Classroom(Base):
    __tablename__ = "classrooms"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    teacher_user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    school_name: Mapped[Optional[str]] = mapped_column(String(255))
    grade_name: Mapped[Optional[str]] = mapped_column(String(100))
    student_count: Mapped[Optional[int]] = mapped_column(Integer)
    subscription_tier: Mapped[Optional[str]] = mapped_column(
        String(20), server_default=text("'free'")
    )
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    teacher: Mapped[User] = relationship(back_populates="classrooms")
    students: Mapped[list[ClassroomStudent]] = relationship(
        back_populates="classroom", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Classroom(id={self.id}, school={self.school_name!r})>"


class ClassroomStudent(Base):
    __tablename__ = "classroom_students"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    classroom_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False
    )
    first_name: Mapped[str] = mapped_column(String(255), nullable=False)
    age: Mapped[Optional[int]] = mapped_column(Integer)
    consent_status: Mapped[Optional[str]] = mapped_column(
        String(20), server_default=text("'pending'")
    )
    consent_parent_email: Mapped[Optional[str]] = mapped_column(String(255))
    consent_token: Mapped[Optional[str]] = mapped_column(String(255), unique=True)
    consent_date: Mapped[Optional[datetime]] = mapped_column()
    has_photos: Mapped[Optional[bool]] = mapped_column(
        Boolean, server_default=text("false")
    )
    face_embedding_ref: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    classroom: Mapped[Classroom] = relationship(back_populates="students")

    def __repr__(self) -> str:
        return f"<ClassroomStudent(id={self.id}, name={self.first_name!r})>"
