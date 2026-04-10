"""Request tracing middleware for distributed tracing.

Spec ref: Ch12.4 - OpenTelemetry instrumentation across all services.
Every book generation request produces a single trace spanning the entire pipeline.
"""

from __future__ import annotations

import time
import uuid

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint


class RequestTracingMiddleware(BaseHTTPMiddleware):
    """Add trace context to every request for distributed tracing."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Use incoming trace ID or generate new one
        trace_id = request.headers.get("X-Trace-Id", str(uuid.uuid4()))
        span_id = str(uuid.uuid4())[:16]
        start_time = time.perf_counter()

        request.state.trace_id = trace_id
        request.state.span_id = span_id

        response = await call_next(request)

        duration_ms = (time.perf_counter() - start_time) * 1000
        response.headers["X-Trace-Id"] = trace_id
        response.headers["X-Span-Id"] = span_id
        response.headers["X-Response-Time"] = f"{duration_ms:.1f}ms"

        return response
