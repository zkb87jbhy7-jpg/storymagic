"""Order endpoints.

Spec ref: Ch8.8 - Order Endpoints
  POST /api/v1/orders — Create order (digital or print)
  GET  /api/v1/orders — List orders (paginated)
  GET  /api/v1/orders/{id} — Order detail with tracking
  GET  /api/v1/orders/{id}/tracking — Shipping tracking detail
  GET  /api/v1/orders/{id}/soft-proof — CMYK soft proof preview
  POST /api/v1/orders/{id}/approve-proof — Approve soft proof for printing
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.dependencies import get_current_user
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


# ── Request / Response Schemas (inline) ───────────────────────────────────


class OrderCreateRequest(BaseModel):
    """POST /api/v1/orders"""
    book_id: uuid.UUID
    order_type: str = Field(description="'digital' or 'print'")
    quantity: int = Field(default=1, ge=1, le=100)
    shipping_address: dict[str, str] | None = Field(
        default=None, description="Required for print orders"
    )
    gift_message: str | None = Field(default=None, max_length=500)
    coupon_code: str | None = None


class OrderSummary(BaseModel):
    """Order listing item."""
    id: uuid.UUID
    book_id: uuid.UUID
    book_title: str
    order_type: str
    status: str  # pending, processing, printing, shipped, delivered, cancelled
    quantity: int
    total_amount: float
    currency: str
    created_at: datetime
    updated_at: datetime


class OrderDetailResponse(OrderSummary):
    """Full order detail with tracking."""
    shipping_address: dict[str, str] | None = None
    tracking_number: str | None = None
    tracking_url: str | None = None
    gift_message: str | None = None
    estimated_delivery: datetime | None = None
    print_provider: str | None = None
    soft_proof_url: str | None = None
    payment_id: str | None = None


class TrackingResponse(BaseModel):
    """Shipping tracking detail."""
    order_id: uuid.UUID
    tracking_number: str | None = None
    carrier: str | None = None
    status: str
    estimated_delivery: datetime | None = None
    events: list[dict[str, Any]] = []


class SoftProofResponse(BaseModel):
    """CMYK soft proof preview."""
    order_id: uuid.UUID
    proof_url: str | None = None
    proof_pages: list[dict[str, Any]] = []
    status: str  # generating, ready, approved
    created_at: datetime


# ── POST /orders ──────────────────────────────────────────────────────────


@router.post(
    "",
    response_model=OrderDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create order",
)
async def create_order(
    body: OrderCreateRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> OrderDetailResponse:
    """Create an order (digital or print).

    Spec ref: Ch8.8 — POST /api/v1/orders
    """
    if body.order_type == "print" and not body.shipping_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Shipping address is required for print orders",
        )

    now = datetime.now(timezone.utc)
    order_id = uuid.uuid4()

    # Placeholder: In production, create order record, initiate payment, etc.
    return OrderDetailResponse(
        id=order_id,
        book_id=body.book_id,
        book_title="Placeholder Book Title",
        order_type=body.order_type,
        status="pending",
        quantity=body.quantity,
        total_amount=29.99 if body.order_type == "print" else 9.99,
        currency="USD",
        shipping_address=body.shipping_address,
        tracking_number=None,
        tracking_url=None,
        gift_message=body.gift_message,
        estimated_delivery=None,
        print_provider=None,
        soft_proof_url=None,
        payment_id=None,
        created_at=now,
        updated_at=now,
    )


# ── GET /orders ───────────────────────────────────────────────────────────


@router.get(
    "",
    response_model=PaginatedResponse[OrderSummary],
    summary="List orders",
)
async def list_orders(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    status_filter: str | None = Query(default=None, alias="status"),
) -> PaginatedResponse[OrderSummary]:
    """List user's orders with pagination.

    Spec ref: Ch8.8 — GET /api/v1/orders
    """
    # Placeholder: In production, query the orders table.
    return PaginatedResponse(
        data=[],
        total=0,
        page=page,
        per_page=per_page,
        total_pages=0,
        has_next=False,
        has_prev=False,
    )


# ── GET /orders/{id} ─────────────────────────────────────────────────────


@router.get(
    "/{order_id}",
    response_model=OrderDetailResponse,
    summary="Get order detail",
)
async def get_order(
    order_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> OrderDetailResponse:
    """Order detail with tracking.

    Spec ref: Ch8.8 — GET /api/v1/orders/{id}
    """
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Order not found",
    )


# ── GET /orders/{id}/tracking ─────────────────────────────────────────────


@router.get(
    "/{order_id}/tracking",
    response_model=TrackingResponse,
    summary="Get shipping tracking",
)
async def get_tracking(
    order_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> TrackingResponse:
    """Shipping tracking detail.

    Spec ref: Ch8.8 — GET /api/v1/orders/{id}/tracking
    """
    # Placeholder: In production, fetch tracking from print provider API.
    return TrackingResponse(
        order_id=order_id,
        tracking_number=None,
        carrier=None,
        status="pending",
        estimated_delivery=None,
        events=[],
    )


# ── GET /orders/{id}/soft-proof ──────────────────────────────────────────


@router.get(
    "/{order_id}/soft-proof",
    response_model=SoftProofResponse,
    summary="Get CMYK soft proof",
)
async def get_soft_proof(
    order_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> SoftProofResponse:
    """CMYK soft proof preview.

    Spec ref: Ch8.8 — GET /api/v1/orders/{id}/soft-proof
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, retrieve soft proof from print pipeline.
    return SoftProofResponse(
        order_id=order_id,
        proof_url=None,
        proof_pages=[],
        status="generating",
        created_at=now,
    )


# ── POST /orders/{id}/approve-proof ──────────────────────────────────────


@router.post(
    "/{order_id}/approve-proof",
    response_model=OrderDetailResponse,
    summary="Approve soft proof",
)
async def approve_proof(
    order_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> OrderDetailResponse:
    """Approve soft proof for printing.

    Spec ref: Ch8.8 — POST /api/v1/orders/{id}/approve-proof
    """
    # Placeholder: In production, update order status and submit to print provider.
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Order not found",
    )
