"""Children profile endpoints.

Spec ref: Ch8.3 - Children Profile Endpoints
  POST   /api/v1/children — Create child profile
  GET    /api/v1/children — List user's children profiles
  GET    /api/v1/children/{id} — Get specific child profile
  PUT    /api/v1/children/{id} — Update profile
  DELETE /api/v1/children/{id} — Delete child profile
  GET    /api/v1/children/{id}/face-status — Poll face processing status
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.schemas.child import (
    ChildCreate,
    ChildResponse,
    ChildUpdate,
    FaceProcessingStatus,
    FaceStatusResponse,
    PhysicalTraits,
    ChildPreferences,
)

router = APIRouter(prefix="/children", tags=["Children"])


# ── POST /children ────────────────────────────────────────────────────────


@router.post(
    "",
    response_model=ChildResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create child profile",
)
async def create_child(
    body: ChildCreate,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
    photos: list[UploadFile] | None = File(default=None, description="Up to 5 photos"),
) -> ChildResponse:
    """Create a new child profile with optional photo upload.

    Spec ref: Ch8.3 — POST /api/v1/children
    Accepts name, gender, birth_date, physical_traits, preferences, and
    up to 5 photos (multipart upload). Returns profile with face_processing_status.
    """
    if photos and len(photos) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 photos allowed",
        )

    child_id = uuid.uuid4()
    now = datetime.now(timezone.utc)
    photos_count = len(photos) if photos else 0
    face_status = FaceProcessingStatus.PENDING if photos_count > 0 else FaceProcessingStatus.PENDING

    # Placeholder: In production, save photos to object storage and trigger
    # face embedding pipeline via Temporal workflow.

    return ChildResponse(
        id=child_id,
        user_id=uuid.UUID(str(current_user["id"])),
        name=body.name,
        gender=body.gender,
        birth_date=body.birth_date,
        physical_traits=body.physical_traits or PhysicalTraits(),
        preferences=body.preferences or ChildPreferences(),
        face_embedding_ref=None,
        character_sheet_urls=None,
        photos_expiry_date=None,
        photos_count=photos_count,
        face_processing_status=face_status,
        face_embedding_expiry=None,
        created_at=now,
        updated_at=now,
    )


# ── GET /children ─────────────────────────────────────────────────────────


@router.get(
    "",
    response_model=list[ChildResponse],
    summary="List children profiles",
)
async def list_children(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> list[ChildResponse]:
    """List all children profiles belonging to the authenticated user.

    Spec ref: Ch8.3 — GET /api/v1/children
    """
    # Placeholder: In production, query children_profiles table filtered by user_id.
    return []


# ── GET /children/{id} ────────────────────────────────────────────────────


@router.get(
    "/{child_id}",
    response_model=ChildResponse,
    summary="Get child profile",
)
async def get_child(
    child_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> ChildResponse:
    """Get a specific child profile by ID.

    Spec ref: Ch8.3 — GET /api/v1/children/{id}
    """
    # Placeholder: In production, query children_profiles by id and verify ownership.
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Child profile not found",
    )


# ── PUT /children/{id} ───────────────────────────────────────────────────


@router.put(
    "/{child_id}",
    response_model=ChildResponse,
    summary="Update child profile",
)
async def update_child(
    child_id: uuid.UUID,
    body: ChildUpdate,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
    photos: list[UploadFile] | None = File(default=None, description="New photos"),
) -> ChildResponse:
    """Update a child profile including new photos (triggers new face embedding).

    Spec ref: Ch8.3 — PUT /api/v1/children/{id}
    """
    # Placeholder: In production, update children_profiles row and re-trigger
    # face embedding if new photos are provided.
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Child profile not found",
    )


# ── DELETE /children/{id} ─────────────────────────────────────────────────


@router.delete(
    "/{child_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete child profile",
)
async def delete_child(
    child_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a child profile including face embedding, character sheet, and all associated data.

    Spec ref: Ch8.3 — DELETE /api/v1/children/{id}
    """
    # Placeholder: In production, soft-delete the child profile, remove face
    # embeddings from Qdrant, and clean up character sheet assets.
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Child profile not found",
    )


# ── GET /children/{id}/face-status ────────────────────────────────────────


@router.get(
    "/{child_id}/face-status",
    response_model=FaceStatusResponse,
    summary="Poll face processing status",
)
async def get_face_status(
    child_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
) -> FaceStatusResponse:
    """Poll the face processing status for a child profile.

    Spec ref: Ch8.3 — GET /api/v1/children/{id}/face-status
    """
    # Placeholder: In production, query the face processing status from the DB
    # or check the Temporal workflow state.
    return FaceStatusResponse(
        child_id=child_id,
        face_processing_status=FaceProcessingStatus.PENDING,
        character_sheet_urls=None,
        progress_percent=0.0,
        error_message=None,
    )
