"""Print service — PDF preparation, print provider submission, and shipping.

Coordinates with Lulu (primary), Peecho, and Blurb print APIs
to produce physical books with CMYK colour profiles and proper bleed.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.book import GeneratedBook
from app.models.order import Order

# Print providers in priority order (fallback chain)
_PRINT_PROVIDERS = ["lulu", "peecho", "blurb"]

# Base shipping rates by region (USD)
_SHIPPING_RATES: dict[str, dict[str, Any]] = {
    "IL": {
        "standard": {"price": 9.99, "days_min": 7, "days_max": 14},
        "express": {"price": 19.99, "days_min": 3, "days_max": 5},
    },
    "US": {
        "standard": {"price": 7.99, "days_min": 7, "days_max": 14},
        "express": {"price": 14.99, "days_min": 3, "days_max": 5},
    },
    "EU": {
        "standard": {"price": 11.99, "days_min": 10, "days_max": 21},
        "express": {"price": 24.99, "days_min": 5, "days_max": 7},
    },
    "OTHER": {
        "standard": {"price": 14.99, "days_min": 14, "days_max": 30},
        "express": {"price": 29.99, "days_min": 7, "days_max": 14},
    },
}


class PrintService:
    """Business logic for print production and fulfilment."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def prepare_pdf(
        self,
        book_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Generate a print-ready PDF for a book.

        The PDF is assembled with CMYK colour profile, 3 mm bleed,
        crop marks, and spine width calculated from page count.
        In production this delegates to the Book Assembly Service (S-05).

        Args:
            book_id: UUID of the book.
            user_id: UUID of the requesting user.

        Returns:
            Dictionary with ``book_id``, ``pdf_url``, ``page_count``,
            ``spine_width_mm``, and ``colour_profile``.

        Raises:
            HTTPException: 404 if the book is not found.
            HTTPException: 403 if the book does not belong to *user_id*.
            HTTPException: 400 if the book is still generating.
        """
        stmt = select(GeneratedBook).where(GeneratedBook.id == book_id)
        result = await self._db.execute(stmt)
        book: GeneratedBook | None = result.scalar_one_or_none()

        if book is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found",
            )
        if book.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this book",
            )
        if book.status in ("draft", "generating"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Book must be in preview or approved status to prepare a PDF",
            )

        # TODO: Delegate to Book Assembly Service (S-05)
        # pdf_result = await book_assembly.generate_print_pdf(book)

        # Placeholder: calculate spine width from estimated page count
        estimated_pages = 12  # fallback if pages not generated yet
        spine_width_mm = round(0.0572 * estimated_pages + 2.0, 2)

        placeholder_url = f"https://cdn.storymagic.ai/pdfs/{book_id}/print-ready.pdf"

        return {
            "book_id": str(book_id),
            "pdf_url": book.print_ready_pdf_url or placeholder_url,
            "page_count": estimated_pages,
            "spine_width_mm": spine_width_mm,
            "colour_profile": "CMYK",
            "bleed_mm": 3,
            "status": "ready" if book.print_ready_pdf_url else "generating",
        }

    async def submit_to_provider(
        self,
        order_id: uuid.UUID,
        *,
        preferred_provider: str | None = None,
    ) -> dict[str, Any]:
        """Submit an order to a print provider for production.

        Attempts the preferred provider first, then falls back through
        the provider chain (Lulu -> Peecho -> Blurb).

        Args:
            order_id: UUID of the order.
            preferred_provider: Optional provider name to try first.

        Returns:
            Dictionary with ``order_id``, ``provider``,
            ``external_order_id``, and ``estimated_delivery``.

        Raises:
            HTTPException: 404 if the order is not found.
            HTTPException: 400 if the order is for a digital book
                or payment is not complete.
        """
        stmt = select(Order).where(Order.id == order_id)
        result = await self._db.execute(stmt)
        order: Order | None = result.scalar_one_or_none()

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found",
            )

        if order.order_type == "digital":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Digital orders do not require print submission",
            )

        if order.payment_status != "paid":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment must be completed before submitting to print",
            )

        # Determine provider order
        providers = list(_PRINT_PROVIDERS)
        if preferred_provider and preferred_provider in providers:
            providers.remove(preferred_provider)
            providers.insert(0, preferred_provider)

        # TODO: Iterate through providers and submit via their API
        # for provider_name in providers:
        #     try:
        #         result = await _submit_to(provider_name, order)
        #         break
        #     except ProviderError:
        #         continue

        # Placeholder
        chosen_provider = providers[0]
        external_id = f"ext_{uuid.uuid4().hex[:12]}"
        estimated_delivery = datetime.now(timezone.utc) + timedelta(days=10)

        order.print_provider = chosen_provider
        order.external_order_id = external_id
        order.estimated_delivery = estimated_delivery.date()
        await self._db.flush()
        await self._db.refresh(order)

        return {
            "order_id": str(order.id),
            "provider": chosen_provider,
            "external_order_id": external_id,
            "estimated_delivery": estimated_delivery.date().isoformat(),
        }

    async def get_status(
        self,
        order_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Get the current print production status for an order.

        Args:
            order_id: UUID of the order.
            user_id: UUID of the requesting user.

        Returns:
            Dictionary with ``order_id``, ``print_status``,
            ``provider``, ``external_order_id``, ``tracking_number``,
            ``tracking_url``, and ``estimated_delivery``.
        """
        stmt = select(Order).where(Order.id == order_id)
        result = await self._db.execute(stmt)
        order: Order | None = result.scalar_one_or_none()

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found",
            )
        if order.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this order",
            )

        # TODO: Poll actual print provider API for real-time status

        # Derive print status from order/payment state
        if order.order_type == "digital":
            print_status = "not_applicable"
        elif order.tracking_number:
            print_status = "shipped"
        elif order.external_order_id:
            print_status = "printing"
        elif order.soft_proof_url:
            print_status = "proof_ready"
        else:
            print_status = "preparing"

        return {
            "order_id": str(order.id),
            "print_status": print_status,
            "provider": order.print_provider,
            "external_order_id": order.external_order_id,
            "tracking_number": order.tracking_number,
            "tracking_url": order.tracking_url,
            "estimated_delivery": (
                order.estimated_delivery.isoformat()
                if order.estimated_delivery
                else None
            ),
        }

    async def get_shipping_rates(
        self,
        *,
        country_code: str,
        order_type: str,
    ) -> dict[str, Any]:
        """Return available shipping rates for a given destination.

        Args:
            country_code: ISO 3166-1 alpha-2 country code.
            order_type: The book order type (for weight estimation).

        Returns:
            Dictionary with ``country_code`` and ``rates`` list,
            where each rate has ``method``, ``price``, ``currency``,
            ``days_min``, and ``days_max``.
        """
        if order_type == "digital":
            return {
                "country_code": country_code,
                "rates": [],
                "message": "Digital orders do not require shipping",
            }

        # Map country to region
        region: str
        if country_code == "IL":
            region = "IL"
        elif country_code == "US":
            region = "US"
        elif country_code in (
            "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
            "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
            "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB", "CH", "NO",
        ):
            region = "EU"
        else:
            region = "OTHER"

        region_rates = _SHIPPING_RATES[region]

        rates = [
            {
                "method": method,
                "price": info["price"],
                "currency": "USD",
                "days_min": info["days_min"],
                "days_max": info["days_max"],
            }
            for method, info in region_rates.items()
        ]

        return {
            "country_code": country_code,
            "rates": rates,
        }
