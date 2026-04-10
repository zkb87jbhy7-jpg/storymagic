"""Classroom Edition schemas for schools and educators.

Endpoints: /api/v1/classroom/*  (Chapter 8.14)
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .book import BookStatus, IllustrationStyle, MoodSetting


# ── Register ──────────────────────────────────────────────────────────────────


class ClassroomCreate(BaseModel):
    """POST /api/v1/classroom/register"""

    school_name: str = Field(min_length=1, max_length=300)
    teacher_name: str = Field(min_length=1, max_length=200)
    teacher_email: EmailStr
    grade_level: str = Field(min_length=1, max_length=50)
    class_name: str | None = Field(default=None, max_length=100)
    student_count: int = Field(ge=1, le=100)
    language: str = Field(default="en", max_length=5)


class ClassroomResponse(BaseModel):
    id: uuid.UUID
    school_name: str
    teacher_name: str
    teacher_email: str
    grade_level: str
    class_name: str | None = None
    student_count: int
    language: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Students ──────────────────────────────────────────────────────────────────


class StudentInfo(BaseModel):
    """Single student entry within a batch add."""

    name: str = Field(min_length=1, max_length=100)
    parent_email: EmailStr


class StudentAdd(BaseModel):
    """POST /api/v1/classroom/students — batch add students."""

    classroom_id: uuid.UUID
    students: list[StudentInfo] = Field(min_length=1, max_length=100)


class StudentResponse(BaseModel):
    id: uuid.UUID
    classroom_id: uuid.UUID
    name: str
    parent_email: str
    consent_status: str = "pending"
    consent_token: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Parental Consent ──────────────────────────────────────────────────────────


class ConsentSubmit(BaseModel):
    """POST /api/v1/classroom/consent/{token}"""

    parent_name: str = Field(min_length=1, max_length=200)
    consent_given: bool
    biometric_consent: bool = False
    data_retention_consent: bool = False
    signature: str | None = Field(
        default=None,
        description="Digital signature or typed name as consent proof",
    )


class ConsentPageResponse(BaseModel):
    """GET /api/v1/classroom/consent/{token} — renders consent page data."""

    student_name: str
    school_name: str
    teacher_name: str
    classroom_name: str | None = None
    data_collection_details: str
    already_submitted: bool = False

    model_config = ConfigDict(from_attributes=True)


# ── Class Book ────────────────────────────────────────────────────────────────


class ClassBookCreate(BaseModel):
    """POST /api/v1/classroom/create-book"""

    classroom_id: uuid.UUID
    title: str = Field(min_length=1, max_length=200)
    prompt: str = Field(min_length=1, max_length=2000)
    illustration_style: IllustrationStyle | None = None
    mood_setting: MoodSetting | None = None
    include_all_students: bool = True
    student_ids: list[uuid.UUID] | None = Field(
        default=None,
        description="Specific students to include (when include_all_students is False)",
    )
    is_rhyming: bool = False
    language: str = Field(default="en", max_length=5)


# ── Dashboard ─────────────────────────────────────────────────────────────────


class StudentDashboardEntry(BaseModel):
    student_id: uuid.UUID
    student_name: str
    consent_status: str
    books_created: int = 0


class ClassBookEntry(BaseModel):
    book_id: uuid.UUID
    title: str | None = None
    status: BookStatus
    created_at: datetime


class ClassroomDashboard(BaseModel):
    """GET /api/v1/classroom/dashboard"""

    classroom_id: uuid.UUID
    school_name: str
    teacher_name: str
    grade_level: str
    class_name: str | None = None
    total_students: int
    consented_students: int
    pending_consent: int
    students: list[StudentDashboardEntry] = Field(default_factory=list)
    books: list[ClassBookEntry] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
