"""Order service — order lifecycle, tracking, and soft-proof management.

Handles order creation for digital and physical books, shipping
tracking, soft-proof generation, and proof approval.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.book import GeneratedBook
from app.models.order import Order

# Pricing table (in USD — converted at checkout based on currency)
_PRICING: dict[str, Decimal] = {
    "digital": Decimal("9.99"),
    "softcover": Decimal("24.99"),
    "hardcover": Decimal("34.99"),
    "gift": Decimal("44.99"),
}


class OrderService:
    """Business logic for order creation and fulfilment tracking."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(
        self,
        *,
        user_id: uuid.UUID,
        book_id: uuid.UUID,
        order_type: str,
        dedication_text: str | None = None,
        dedication_handwritten_url: str | None = None,
        print_options: dict[str, Any] | None = None,
        shipping_address: dict[str, Any] | None = None,
        shipping_method: str | None = None,
        currency: str = "ILS",
    ) -> Order:
        """Create a new order for a generated book.

        The book must be in ``"approved"`` status before an order can be
        placed.  Physical order types (softcover, hardcover, gift) require
        a shipping address.

        Args:
            user_id: UUID of the ordering user.
            book_id: UUID of the book to order.
            order_type: One of ``"digital"``, ``"softcover"``,
                ``"hardcover"``, ``"gift"``.
            dedication_text: Optional printed dedication message.
            dedication_handwritten_url: URL to an uploaded handwritten note.
            print_options: JSONB dict of print customisation.
            shipping_address: JSONB dict of shipping address.
            shipping_method: Chosen shipping tier.
            currency: ISO 4217 currency code.

        Returns:
            The newly created :class:`Order`.

        Raises:
            HTTPException: 400 if *order_type* is invalid, or the book
                is not in ``"approved"`` status, or a physical order
                is missing a shipping address.
            HTTPException: 404 if the book is not found.
            HTTPException: 403 if the book does not belong to *user_id*.
        """
        if order_type not in _PRICING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid order type. Must be one of: {sorted(_PRICING.keys())}",
            )

        # Validate book ownership and status
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
        if book.status != "approved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Book must be approved before ordering",
            )

        # Physical orders require a shipping address
        if order_type in ("softcover", "hardcover", "gift") and not shipping_address:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Shipping address is required for physical orders",
            )

        total_amount = _PRICING[order_type]

        order = Order(
            user_id=user_id,
            book_id=book_id,
            order_type=order_type,
            dedication_text=dedication_text,
            dedication_handwritten_url=dedication_handwritten_url,
            print_options=print_options,
            shipping_address=shipping_address,
            shipping_method=shipping_method,
            total_amount=total_amount,
            currency=currency,
            payment_status="pending",
        )
        self._db.add(order)

        # Transition the book to 'ordered'
        book.status = "ordered"
        book.updated_at = datetime.now(timezone.utc)

        await self._db.flush()
        await self._db.refresh(order)
        return order

    async def get_by_id(
        self,
        order_id: uuid.UUID,
        *,
        user_id: uuid.UUID | None = None,
    ) -> Order:
        """Fetch an order by primary key.

        Args:
            order_id: UUID of the order.
            user_id: If provided, verify ownership.

        Returns:
            The matching :class:`Order`.

        Raises:
            HTTPException: 404 if not found; 403 on ownership mismatch.
        """
        stmt = select(Order).where(Order.id == order_id)
        result = await self._db.execute(stmt)
        order: Order | None = result.scalar_one_or_none()

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found",
            )

        if user_id is not None and order.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this order",
            )

        return order

    async def list_by_user(
        self,
        user_id: uuid.UUID,
        *,
        page: int = 1,
        page_size: int = 20,
    ) -> dict[str, Any]:
        """Return paginated orders for a user.

        Args:
            user_id: UUID of the owning user.
            page: 1-based page number.
            page_size: Items per page.

        Returns:
            Paginated response dictionary.
        """
        base = select(Order).where(Order.user_id == user_id)

        count_stmt = select(func.count()).select_from(base.subquery())
        total: int = (await self._db.execute(count_stmt)).scalar_one()

        stmt = (
            base.order_by(Order.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        result = await self._db.execute(stmt)
        orders = list(result.scalars().all())

        total_pages = max(1, (total + page_size - 1) // page_size)

        return {
            "data": orders,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }

    async def get_tracking(
        self,
        order_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Return tracking information for a physical order.

        Args:
            order_id: UUID of the order.
            user_id: UUID of the requesting user.

        Returns:
            Dictionary with ``order_id``, ``tracking_number``,
            ``tracking_url``, ``print_provider``, ``estimated_delivery``,
            and ``status``.

        Raises:
            HTTPException: 400 if the order is digital-only.
        """
        order = await self.get_by_id(order_id, user_id=user_id)

        if order.order_type == "digital":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Digital orders do not have tracking information",
            )

        return {
            "order_id": str(order.id),
            "tracking_number": order.tracking_number,
            "tracking_url": order.tracking_url,
            "print_provider": order.print_provider,
            "external_order_id": order.external_order_id,
            "estimated_delivery": (
                order.estimated_delivery.isoformat()
                if order.estimated_delivery
                else None
            ),
            "payment_status": order.payment_status,
        }

    async def get_soft_proof(
        self,
        order_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
    ) -> dict[str, Any]:
        """Return the soft-proof preview for a physical order.

        The soft proof is a low-resolution PDF that lets the parent
        review how the printed book will look before final printing.

        Args:
            order_id: UUID of the order.
            user_id: UUID of the requesting user.

        Returns:
            Dictionary with ``order_id``, ``soft_proof_url``,
            and ``proof_status``.
        """
        order = await self.get_by_id(order_id, user_id=user_id)

        if order.order_type == "digital":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Digital orders do not have soft proofs",
            )

        proof_status = "ready" if order.soft_proof_url else "generating"

        return {
            "order_id": str(order.id),
            "soft_proof_url": order.soft_proof_url,
            "proof_status": proof_status,
        }

    async def approve_proof(
        self,
        order_id: uuid.UUID,
        *,
        user_id: uuid.UUID,
    ) -> Order:
        """Approve the soft proof and trigger final printing.

        After approval the order is submitted to the print provider
        via the Print Service.

        Args:
            order_id: UUID of the order.
            user_id: UUID of the requesting user.

        Returns:
            The updated :class:`Order`.

        Raises:
            HTTPException: 400 if there is no soft proof to approve or
                the payment has not been completed.
        """
        order = await self.get_by_id(order_id, user_id=user_id)

        if not order.soft_proof_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No soft proof available to approve",
            )

        if order.payment_status != "paid":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment must be completed before approving the proof",
            )

        # TODO: Dispatch to PrintService.submit_to_provider()
        # The order will transition to 'printing' once the print provider
        # acknowledges the submission.

        return order
