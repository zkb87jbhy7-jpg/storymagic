"""Classroom service — school edition management and consent handling.

Supports the Classroom Edition (Feature F-14) for teachers to create
class books with parental consent tracking per student.
"""

from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.classroom import Classroom, ClassroomStudent
from app.models.user import User


class ClassroomService:
    """Business logic for the Classroom Edition."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def register(
        self,
        *,
        teacher_user_id: uuid.UUID,
        school_name: str,
        grade_name: str | None = None,
        subscription_tier: str = "free",
    ) -> Classroom:
        """Register a new classroom under a teacher's account.

        Args:
            teacher_user_id: UUID of the teacher user.
            school_name: Name of the school.
            grade_name: Grade or class label (e.g. "3rd Grade - Sunflowers").
            subscription_tier: ``"free"``, ``"school"``, or ``"district"``.

        Returns:
            The newly created :class:`Classroom`.

        Raises:
            HTTPException: 404 if the teacher user does not exist.
        """
        user_stmt = select(User).where(User.id == teacher_user_id)
        user_result = await self._db.execute(user_stmt)
        if user_result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teacher user not found",
            )

        classroom = Classroom(
            teacher_user_id=teacher_user_id,
            school_name=school_name,
            grade_name=grade_name,
            subscription_tier=subscription_tier,
            student_count=0,
        )
        self._db.add(classroom)
        await self._db.flush()
        await self._db.refresh(classroom)
        return classroom

    async def add_students(
        self,
        classroom_id: uuid.UUID,
        *,
        teacher_user_id: uuid.UUID,
        students: list[dict[str, Any]],
    ) -> list[ClassroomStudent]:
        """Add students to a classroom and generate consent tokens.

        Each student entry requires ``first_name`` and
        ``consent_parent_email``.  A unique consent token is generated
        for each student so that parents can approve via email link.

        Args:
            classroom_id: UUID of the classroom.
            teacher_user_id: UUID of the teacher (ownership check).
            students: List of dicts with ``first_name``, ``age``,
                and ``consent_parent_email``.

        Returns:
            List of newly created :class:`ClassroomStudent` instances.

        Raises:
            HTTPException: 400 if student count exceeds 25 for free tier.
            HTTPException: 403 if teacher does not own the classroom.
            HTTPException: 404 if the classroom is not found.
        """
        classroom = await self._get_classroom(classroom_id, teacher_user_id)

        # Check student limit for free tier
        existing_count = classroom.student_count or 0
        if (
            classroom.subscription_tier == "free"
            and existing_count + len(students) > 25
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Free tier classrooms are limited to 25 students",
            )

        created: list[ClassroomStudent] = []
        for student_data in students:
            first_name = student_data.get("first_name", "").strip()
            if not first_name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Each student must have a first_name",
                )

            consent_token = secrets.token_urlsafe(32)

            student = ClassroomStudent(
                classroom_id=classroom_id,
                first_name=first_name,
                age=student_data.get("age"),
                consent_parent_email=student_data.get("consent_parent_email"),
                consent_token=consent_token,
                consent_status="pending",
            )
            self._db.add(student)
            created.append(student)

        # Update student count
        classroom.student_count = existing_count + len(students)

        await self._db.flush()
        for student in created:
            await self._db.refresh(student)

        # TODO: Send consent emails to parents with tokens

        return created

    async def get_consent_status(
        self,
        classroom_id: uuid.UUID,
        *,
        teacher_user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Return consent status summary for all students in a classroom.

        Args:
            classroom_id: UUID of the classroom.
            teacher_user_id: UUID of the teacher (ownership check).

        Returns:
            Dictionary with ``classroom_id``, ``total_students``,
            ``consented``, ``pending``, ``declined``, and ``students``
            list with per-student status.
        """
        classroom = await self._get_classroom(
            classroom_id, teacher_user_id, load_students=True
        )

        students_status: list[dict[str, Any]] = []
        consented = 0
        pending = 0
        declined = 0

        for student in classroom.students:
            consent = student.consent_status or "pending"
            if consent == "approved":
                consented += 1
            elif consent == "declined":
                declined += 1
            else:
                pending += 1

            students_status.append({
                "student_id": str(student.id),
                "first_name": student.first_name,
                "consent_status": consent,
                "consent_parent_email": student.consent_parent_email,
                "consent_date": (
                    student.consent_date.isoformat() if student.consent_date else None
                ),
                "has_photos": student.has_photos or False,
            })

        return {
            "classroom_id": str(classroom.id),
            "total_students": len(classroom.students),
            "consented": consented,
            "pending": pending,
            "declined": declined,
            "students": students_status,
        }

    async def submit_consent(
        self,
        *,
        consent_token: str,
        approved: bool,
    ) -> dict[str, Any]:
        """Process a parental consent response.

        Called when a parent clicks the consent link in their email.

        Args:
            consent_token: The unique token from the consent email.
            approved: ``True`` if the parent consents, ``False`` to decline.

        Returns:
            Dictionary with ``student_id``, ``consent_status``,
            and ``message``.

        Raises:
            HTTPException: 404 if the token is not found.
            HTTPException: 400 if consent has already been submitted.
        """
        stmt = select(ClassroomStudent).where(
            ClassroomStudent.consent_token == consent_token
        )
        result = await self._db.execute(stmt)
        student: ClassroomStudent | None = result.scalar_one_or_none()

        if student is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid consent token",
            )

        if student.consent_status in ("approved", "declined"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Consent has already been {student.consent_status}",
            )

        student.consent_status = "approved" if approved else "declined"
        student.consent_date = datetime.now(timezone.utc)

        await self._db.flush()
        await self._db.refresh(student)

        return {
            "student_id": str(student.id),
            "consent_status": student.consent_status,
            "message": (
                "Consent granted. The student can now be included in class books."
                if approved
                else "Consent declined. The student will not be included."
            ),
        }

    async def create_class_book(
        self,
        classroom_id: uuid.UUID,
        *,
        teacher_user_id: uuid.UUID,
        template_name: str,
        title: str | None = None,
    ) -> dict[str, Any]:
        """Create a class book featuring consented students.

        Only students with ``consent_status == "approved"`` are included.

        Args:
            classroom_id: UUID of the classroom.
            teacher_user_id: UUID of the teacher.
            template_name: Classroom template — ``"our_first_day"``,
                ``"class_trip"``, ``"friendship_story"``, ``"end_of_year"``,
                or ``"student_of_week"``.
            title: Optional custom book title.

        Returns:
            Dictionary with ``classroom_id``, ``book_id`` (placeholder),
            ``included_students``, and ``excluded_students``.

        Raises:
            HTTPException: 400 if no students have consented.
        """
        classroom = await self._get_classroom(
            classroom_id, teacher_user_id, load_students=True
        )

        consented = [
            s for s in classroom.students if s.consent_status == "approved"
        ]
        excluded = [
            s for s in classroom.students if s.consent_status != "approved"
        ]

        if not consented:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No students with parental consent available",
            )

        # TODO: Dispatch book generation workflow with class context
        # book = await book_service.create_from_template(
        #     user_id=teacher_user_id,
        #     child_profile_ids=[...],
        #     template_id=template_lookup[template_name],
        # )

        return {
            "classroom_id": str(classroom.id),
            "book_id": str(uuid.uuid4()),  # placeholder
            "template_name": template_name,
            "title": title or f"Our Class Story - {classroom.grade_name}",
            "included_students": [
                {"id": str(s.id), "first_name": s.first_name} for s in consented
            ],
            "excluded_students": [
                {"id": str(s.id), "first_name": s.first_name, "reason": s.consent_status}
                for s in excluded
            ],
            "status": "draft",
        }

    async def get_dashboard(
        self,
        classroom_id: uuid.UUID,
        *,
        teacher_user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Return a dashboard summary for a classroom.

        Args:
            classroom_id: UUID of the classroom.
            teacher_user_id: UUID of the teacher (ownership check).

        Returns:
            Dictionary with classroom metadata, consent stats,
            and book creation history.
        """
        classroom = await self._get_classroom(
            classroom_id, teacher_user_id, load_students=True
        )

        consent_stats = {
            "total": len(classroom.students),
            "approved": sum(
                1 for s in classroom.students if s.consent_status == "approved"
            ),
            "pending": sum(
                1 for s in classroom.students if s.consent_status == "pending"
            ),
            "declined": sum(
                1 for s in classroom.students if s.consent_status == "declined"
            ),
        }

        return {
            "classroom_id": str(classroom.id),
            "school_name": classroom.school_name,
            "grade_name": classroom.grade_name,
            "subscription_tier": classroom.subscription_tier,
            "consent_stats": consent_stats,
            "student_count": classroom.student_count or 0,
            "created_at": (
                classroom.created_at.isoformat() if classroom.created_at else None
            ),
            # TODO: Include book creation history
            "books_created": [],
        }

    # ── Internal helpers ────────────────────────────────────────────────

    async def _get_classroom(
        self,
        classroom_id: uuid.UUID,
        teacher_user_id: uuid.UUID,
        *,
        load_students: bool = False,
    ) -> Classroom:
        """Fetch a classroom with ownership verification.

        Raises:
            HTTPException: 404 if not found; 403 if not owned by teacher.
        """
        stmt = select(Classroom).where(Classroom.id == classroom_id)
        if load_students:
            stmt = stmt.options(selectinload(Classroom.students))

        result = await self._db.execute(stmt)
        classroom: Classroom | None = result.scalar_one_or_none()

        if classroom is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Classroom not found",
            )

        if classroom.teacher_user_id != teacher_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this classroom",
            )

        return classroom
