"""Print endpoints.

Spec ref: Ch8.9 - Print Endpoints
  POST /api/v1/print/prepare-pdf — Generate print-ready PDF
  POST /api/v1/print/submit — Submit to print provider
  GET  /api/v1/print/status/{orderId} — Print status
  POST /api/v1/print/shipping-rates — Get shipping rate quotes
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.dependencies import get_current_user

router = APIRouter(prefix="/print", tags=["Print"])


# ── Request / Response Schemas (inline) ───────────────────────────────────


class PreparePdfRequest(BaseModel):
    """POST /api/v1/print/prepare-pdf"""
    book_id: uuid.UUID
    format: str = Field(default="8.5x8.5", description="Print format, e.g. '8.5x8.5', '8x10'")
    paper_type: str = Field(default="matte", description="'matte' or 'glossy'")
    cover_type: str = Field(default="hardcover", description="'hardcover' or 'softcover'")


class PreparePdfResponse(BaseModel):
    """Print-ready PDF response."""
    id: uuid.UUID
    book_id: uuid.UUID
    status: str  # preparing, ready, failed
    pdf_url: str | None = None
    page_count: int = 0
    file_size_mb: float | None = None
    has_bleed: bool = True
    has_crop_marks: bool = True
    color_space: str = "CMYK"
    created_at: datetime


class PrintSubmitRequest(BaseModel):
    """POST /api/v1/print/submit"""
    order_id: uuid.UUID
    pdf_id: uuid.UUID
    provider: str = Field(default="lulu", description="Print provider: 'lulu' or 'peecho'")
    quantity: int = Field(default=1, ge=1, le=100)
    shipping_method: str = Field(default="standard", description="'standard', 'express', 'priority'")


class PrintSubmitResponse(BaseModel):
    """Print submission response."""
    id: uuid.UUID
    order_id: uuid.UUID
    provider: str
    provider_order_id: str | None = None
    status: str  # submitted, accepted, printing, shipped
    estimated_production_days: int | None = None
    created_at: datetime


class PrintStatusResponse(BaseModel):
    """Print status response."""
    order_id: uuid.UUID
    provider: str | None = None
    provider_order_id: str | None = None
    status: str  # submitted, accepted, printing, quality_check, shipped, delivered
    current_step: str | None = None
    estimated_ship_date: datetime | None = None
    tracking_number: str | None = None
    tracking_url: str | None = None
    updated_at: datetime


class ShippingRatesRequest(BaseModel):
    """POST /api/v1/print/shipping-rates"""
    destination_country: str = Field(min_length=2, max_length=2)
    destination_zip: str
    format: str = Field(default="8.5x8.5")
    cover_type: str = Field(default="hardcover")
    quantity: int = Field(default=1, ge=1, le=100)


class ShippingRateResponse(BaseModel):
    """Individual shipping rate quote."""
    method: str
    carrier: str
    estimated_days: int
    price: float
    currency: str = "USD"


class ShippingRatesResponse(BaseModel):
    """Shipping rates response."""
    rates: list[ShippingRateResponse]
    destination_country: str
    destination_zip: str


# ── POST /print/prepare-pdf ──────────────────────────────────────────────


@router.post(
    "/prepare-pdf",
    response_model=PreparePdfResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate print-ready PDF",
)
async def prepare_pdf(
    body: PreparePdfRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> PreparePdfResponse:
    """Generate print-ready PDF with CMYK, bleed, and crop marks.

    Spec ref: Ch8.9 — POST /api/v1/print/prepare-pdf
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, trigger PDF generation pipeline
    # with CMYK color conversion, bleed area, and crop marks.
    return PreparePdfResponse(
        id=uuid.uuid4(),
        book_id=body.book_id,
        status="preparing",
        pdf_url=None,
        page_count=0,
        file_size_mb=None,
        has_bleed=True,
        has_crop_marks=True,
        color_space="CMYK",
        created_at=now,
    )


# ── POST /print/submit ──────────────────────────────────────────────────


@router.post(
    "/submit",
    response_model=PrintSubmitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit to print provider",
)
async def submit_print(
    body: PrintSubmitRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> PrintSubmitResponse:
    """Submit print job to print provider (Lulu or Peecho).

    Spec ref: Ch8.9 — POST /api/v1/print/submit
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, call print provider API to submit order.
    return PrintSubmitResponse(
        id=uuid.uuid4(),
        order_id=body.order_id,
        provider=body.provider,
        provider_order_id=None,
        status="submitted",
        estimated_production_days=5,
        created_at=now,
    )


# ── GET /print/status/{orderId} ──────────────────────────────────────────


@router.get(
    "/status/{order_id}",
    response_model=PrintStatusResponse,
    summary="Get print status",
)
async def get_print_status(
    order_id: uuid.UUID,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> PrintStatusResponse:
    """Get the current print status for an order.

    Spec ref: Ch8.9 — GET /api/v1/print/status/{orderId}
    """
    now = datetime.now(timezone.utc)
    # Placeholder: In production, query print provider API for status.
    return PrintStatusResponse(
        order_id=order_id,
        provider=None,
        provider_order_id=None,
        status="pending",
        current_step=None,
        estimated_ship_date=None,
        tracking_number=None,
        tracking_url=None,
        updated_at=now,
    )


# ── POST /print/shipping-rates ──────────────────────────────────────────


@router.post(
    "/shipping-rates",
    response_model=ShippingRatesResponse,
    summary="Get shipping rate quotes",
)
async def get_shipping_rates(
    body: ShippingRatesRequest,
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> ShippingRatesResponse:
    """Get shipping rate quotes for a print order.

    Spec ref: Ch8.9 — POST /api/v1/print/shipping-rates
    """
    # Placeholder: In production, query print provider APIs for rates.
    return ShippingRatesResponse(
        rates=[
            ShippingRateResponse(
                method="standard",
                carrier="USPS",
                estimated_days=7,
                price=5.99,
                currency="USD",
            ),
            ShippingRateResponse(
                method="express",
                carrier="FedEx",
                estimated_days=3,
                price=12.99,
                currency="USD",
            ),
            ShippingRateResponse(
                method="priority",
                carrier="FedEx",
                estimated_days=1,
                price=24.99,
                currency="USD",
            ),
        ],
        destination_country=body.destination_country,
        destination_zip=body.destination_zip,
    )
