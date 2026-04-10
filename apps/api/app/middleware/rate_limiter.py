"""Rate limiting middleware using Redis.

Spec ref: Ch4.7 - Rate limiting:
  - 60 requests/minute for API
  - 10 requests/minute for AI generation
  - 20 requests/minute for auth
"""

from __future__ import annotations

import time
from typing import TYPE_CHECKING

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

if TYPE_CHECKING:
    from fastapi import FastAPI
    from redis.asyncio import Redis


# Rate limit configs: (requests, window_seconds)
RATE_LIMITS: dict[str, tuple[int, int]] = {
    "default": (60, 60),        # 60 req/min
    "ai_generation": (10, 60),  # 10 req/min
    "auth": (20, 60),           # 20 req/min
}


def _get_rate_limit_key(path: str) -> str:
    """Determine which rate limit bucket applies to a path."""
    if path.startswith("/api/v1/auth"):
        return "auth"
    if any(
        path.startswith(p)
        for p in [
            "/api/v1/stories/generate",
            "/api/v1/books/create",
            "/api/v1/illustrations/generate",
        ]
    ):
        return "ai_generation"
    return "default"


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Redis-based sliding window rate limiter."""

    def __init__(self, app: FastAPI, redis: Redis | None = None) -> None:
        super().__init__(app)
        self.redis = redis

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        if self.redis is None:
            return await call_next(request)

        # Use client IP as identifier (could also use user_id for authenticated routes)
        client_ip = request.client.host if request.client else "unknown"
        bucket = _get_rate_limit_key(request.url.path)
        max_requests, window = RATE_LIMITS[bucket]

        key = f"rate_limit:{bucket}:{client_ip}"
        now = time.time()

        pipe = self.redis.pipeline()
        pipe.zremrangebyscore(key, 0, now - window)
        pipe.zadd(key, {str(now): now})
        pipe.zcard(key)
        pipe.expire(key, window)
        results = await pipe.execute()

        request_count: int = results[2]

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(max_requests)
        response.headers["X-RateLimit-Remaining"] = str(
            max(0, max_requests - request_count)
        )

        if request_count > max_requests:
            from fastapi.responses import JSONResponse

            return JSONResponse(
                status_code=429,
                content={
                    "error": "rate_limit_exceeded",
                    "message": f"Too many requests. Limit: {max_requests}/{window}s",
                    "retry_after": window,
                },
                headers={
                    "Retry-After": str(window),
                    "X-RateLimit-Limit": str(max_requests),
                    "X-RateLimit-Remaining": "0",
                },
            )

        return response
