"""Classroom endpoints.

Spec ref: Ch8.14 - Classroom Endpoints
  POST /api/v1/classroom/register — Register classroom
  POST /api/v1/classroom/students — Add students
  GET  /api/v1/classroom/consent/{token} — Parental consent page
  POST /api/v1/classroom/consent/{token} — Submit parental consent
  POST /api/v1/classroom/create-book — Create classroom book
  GET  /api/v1/classroom/dashboard — Teacher dashboard
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.dependencies import get_current_user

router = APIRouter(prefix="/classroom", tags=["Classroom"])


# ── Request / Response Schemas (inline) ───────────────────────────────────


class ClassroomRegisterRequest(BaseModel):
    """POST /api/v1/classroom/register"""
    school_name: str = Field(min_length=1, max_length=200)
    teacher_name: str = Field(min_length=1, max_length=200)
    grade: str = Field(min_length=1, max_length=50)
    class_name: str = Field(min_length=1, max_length=100)
    student_count: int = Field(ge=1, le=50)


class ClassroomResponse(BaseModel):
    """Classroom registration response."""
    id: uuid.UUID
    school_name: str
    teacher_name: str
    grade: str
    class_name: str
    student_count: int
    consent_status: str  # pending, partial, complete
    created_at: datetime


class AddStudentsRequest(BaseModel):
    """POST /api/v1/classroom/students"""
    classroom_id: uuid.UUID
    students: list[dict[str, str]] = Field(
        description="List of {name, parent_email} objects"
    )


class AddStudentsResponse(BaseModel):
    """Response after adding students."""
    classroom_id: uuid.UUID
    students_added: int
    consent_links_sent: int
    message: str


class ConsentPageResponse(BaseModel):
    """GET /api/v1/classroom/consent/{token} — consent page data."""
    token: str
    student_name: str
    school_name: str
    teacher_name: str
    class_name: str
    consent_status: str  # pending, approved, denied
    biometric_disclosure: str


class ConsentSubmitRequest(BaseModel):
    """POST /api/v1/classroom/consent/{token}"""
    parent_name: str = Field(min_length=1, max_length=200)
    consent_granted: bool
    biometric_consent: bool = False
    data_retention_consent: bool = False


class ConsentSubmitResponse(BaseModel):
    """Consent submission response."""
    token: str
    student_name: str
    consent_status: str  # approved, denied
    message: str


class ClassroomBookRequest(BaseModel):
    """POST /api/v1/classroom/create-book"""
    classroom_id: uuid.UUID
    template_id: uuid.UUID | None = None
    prompt: str | None = Field(default=None, max_length=2000)
    theme: str | None = None
    personalize_per_student: bool = True


class ClassroomBookResponse(BaseModel):
    """Classroom book creation response."""
    id: uuid.UUID
    classroom_id: uuid.UUID
    status: str  # generating, ready
    books_count: int
    message: str
    created_at: datetime


class ClassroomDashboardResponse(BaseModel):
    """Teacher dashboard data."""
    classroom_id: uuid.UUID
    school_name: str
    class_name: str
    total_students: int
    consented_students: int
    pending_consent: int
    books_created: int
    recent_books: list[dict[str, Any]] = []
    consent_progress_percent: float


# ── POST /classroom/register ─────────────────────────────────────────────


@router.post(
    "/register",
    response_model=ClassroomResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register classroom",
)
async def register_classroom(
    body: ClassroomRegisterRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ClassroomResponse:
    """Register a new classroom.

    Spec ref: Ch8.14 — POST /api/v1/classroom/register
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, create classroom record.
    return ClassroomResponse(
        id=uuid.uuid4(),
        school_name=body.school_name,
        teacher_name=body.teacher_name,
        grade=body.grade,
        class_name=body.class_name,
        student_count=body.student_count,
        consent_status="pending",
        created_at=now,
    )


# ── POST /classroom/students ─────────────────────────────────────────────


@router.post(
    "/students",
    response_model=AddStudentsResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add students to classroom",
)
async def add_students(
    body: AddStudentsRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> AddStudentsResponse:
    """Add students to a classroom and send consent links to parents.

    Spec ref: Ch8.14 — POST /api/v1/classroom/students
    """
    # Placeholder: In production, create student records and send consent emails.
    return AddStudentsResponse(
        classroom_id=body.classroom_id,
        students_added=len(body.students),
        consent_links_sent=len(body.students),
        message=f"{len(body.students)} students added. Consent links sent to parents.",
    )


# ── GET /classroom/consent/{token} ───────────────────────────────────────


@router.get(
    "/consent/{token}",
    response_model=ConsentPageResponse,
    summary="Get parental consent page",
)
async def get_consent_page(
    token: str,
) -> ConsentPageResponse:
    """Render the parental consent page for a student.

    Spec ref: Ch8.14 — GET /api/v1/classroom/consent/{token}
    Public endpoint (no auth required — accessed via email link).
    """
    # Placeholder: In production, validate token and fetch student/classroom data.
    return ConsentPageResponse(
        token=token,
        student_name="Placeholder Student",
        school_name="Placeholder School",
        teacher_name="Placeholder Teacher",
        class_name="Placeholder Class",
        consent_status="pending",
        biometric_disclosure=(
            "This application may process your child's facial features to create "
            "personalized illustrations. Face data is stored as encrypted embeddings "
            "and deleted after 12 months per our data retention policy."
        ),
    )


# ── POST /classroom/consent/{token} ──────────────────────────────────────


@router.post(
    "/consent/{token}",
    response_model=ConsentSubmitResponse,
    summary="Submit parental consent",
)
async def submit_consent(
    token: str,
    body: ConsentSubmitRequest,
) -> ConsentSubmitResponse:
    """Submit parental consent for a student.

    Spec ref: Ch8.14 — POST /api/v1/classroom/consent/{token}
    Public endpoint (no auth required — accessed via email link).
    """
    # Placeholder: In production, validate token and update consent status.
    consent_status = "approved" if body.consent_granted else "denied"
    return ConsentSubmitResponse(
        token=token,
        student_name="Placeholder Student",
        consent_status=consent_status,
        message=f"Consent {consent_status}. Thank you.",
    )


# ── POST /classroom/create-book ──────────────────────────────────────────


@router.post(
    "/create-book",
    response_model=ClassroomBookResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create classroom book",
)
async def create_classroom_book(
    body: ClassroomBookRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ClassroomBookResponse:
    """Create books for all consented students in a classroom.

    Spec ref: Ch8.14 — POST /api/v1/classroom/create-book
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, trigger book generation for each consented student.
    return ClassroomBookResponse(
        id=uuid.uuid4(),
        classroom_id=body.classroom_id,
        status="generating",
        books_count=0,
        message="Classroom book generation started",
        created_at=now,
    )


# ── GET /classroom/dashboard ─────────────────────────────────────────────


@router.get(
    "/dashboard",
    response_model=ClassroomDashboardResponse,
    summary="Get teacher dashboard",
)
async def get_dashboard(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ClassroomDashboardResponse:
    """Teacher dashboard with classroom overview.

    Spec ref: Ch8.14 — GET /api/v1/classroom/dashboard
    """
    # Placeholder: In production, aggregate classroom data for the teacher.
    return ClassroomDashboardResponse(
        classroom_id=uuid.uuid4(),
        school_name="No classroom registered",
        class_name="N/A",
        total_students=0,
        consented_students=0,
        pending_consent=0,
        books_created=0,
        recent_books=[],
        consent_progress_percent=0.0,
    )
