"""Audit logging middleware for children's data operations.

Spec ref: Ch14.5 - Complete audit log for every operation involving children's data:
  - Who uploaded a photo, when, what processing was performed
  - When a face embedding was created, accessed, or deleted
"""

from __future__ import annotations

import logging
import uuid
from typing import TYPE_CHECKING

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

if TYPE_CHECKING:
    from fastapi import FastAPI

logger = logging.getLogger("storymagic.audit")

# Paths that involve children's data and require audit logging
AUDITABLE_PATHS = [
    "/api/v1/children",
    "/api/v1/illustrations",
    "/api/v1/voice/clone",
    "/api/v1/voice/family",
]


class AuditLogMiddleware(BaseHTTPMiddleware):
    """Log operations involving children's biometric and personal data."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # Check if this request involves children's data
        is_auditable = any(
            request.url.path.startswith(p) for p in AUDITABLE_PATHS
        )

        if is_auditable and request.method in ("POST", "PUT", "DELETE", "PATCH"):
            user_id = getattr(request.state, "user_id", "anonymous")
            logger.info(
                "AUDIT: %s %s by user=%s request_id=%s",
                request.method,
                request.url.path,
                user_id,
                request_id,
            )

        response = await call_next(request)
        response.headers["X-Request-Id"] = request_id

        if is_auditable and request.method in ("POST", "PUT", "DELETE", "PATCH"):
            logger.info(
                "AUDIT_RESULT: %s %s status=%d request_id=%s",
                request.method,
                request.url.path,
                response.status_code,
                request_id,
            )

        return response
