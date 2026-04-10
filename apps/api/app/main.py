"""
StoryMagic API — FastAPI Application Factory.

Creates and configures the FastAPI application with middleware,
exception handlers, and versioned router inclusion.
"""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.dependencies import setup_database, setup_redis, teardown_database, teardown_redis

logger = logging.getLogger("storymagic")

# ── Application Metadata ────────────────────────────────────────────────

APP_NAME = "StoryMagic API"
APP_VERSION = "0.1.0"
APP_DESCRIPTION = (
    "AI-powered platform that creates fully personalized children's books "
    "where the child is the hero."
)


# ── Lifespan ────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Manage application startup and shutdown resources.

    * **Startup**: initialise the async database engine, session factory,
      and Redis connection pool.
    * **Shutdown**: dispose of database connections and close Redis.
    """
    settings = get_settings()

    logger.info("Starting %s v%s", APP_NAME, APP_VERSION)

    # Startup
    await setup_database(settings)
    await setup_redis(settings)

    logger.info("Database and Redis connections established")

    yield

    # Shutdown
    await teardown_database()
    await teardown_redis()

    logger.info("Shutdown complete — all connections closed")


# ── Exception Handlers ──────────────────────────────────────────────────


async def validation_exception_handler(
    _request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Return structured 422 responses for request validation failures."""
    errors: list[dict[str, Any]] = []
    for error in exc.errors():
        errors.append(
            {
                "field": " -> ".join(str(loc) for loc in error.get("loc", [])),
                "message": error.get("msg", "Validation error"),
                "type": error.get("type", "value_error"),
            }
        )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": errors,
        },
    )


async def not_found_handler(_request: Request, exc: Exception) -> JSONResponse:
    """Return a consistent 404 JSON response."""
    detail = getattr(exc, "detail", "Resource not found")
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": detail},
    )


async def unauthorized_handler(_request: Request, exc: Exception) -> JSONResponse:
    """Return a consistent 401 JSON response."""
    detail = getattr(exc, "detail", "Authentication required")
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": detail},
        headers={"WWW-Authenticate": "Bearer"},
    )


async def forbidden_handler(_request: Request, exc: Exception) -> JSONResponse:
    """Return a consistent 403 JSON response."""
    detail = getattr(exc, "detail", "Insufficient permissions")
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"detail": detail},
    )


async def internal_error_handler(_request: Request, _exc: Exception) -> JSONResponse:
    """Return a generic 500 JSON response.

    The real traceback is logged server-side; the client receives a
    safe, opaque message.
    """
    logger.exception("Unhandled server error")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


# ── Router Stubs ────────────────────────────────────────────────────────
# Each router module will define an ``APIRouter`` named ``router``.
# Until the individual route files are implemented, we create lightweight
# placeholder routers so the application boots cleanly.

from fastapi import APIRouter  # noqa: E402


def _stub_router(prefix: str, tag: str) -> APIRouter:
    """Create a minimal router stub that returns 501 for any request."""
    r = APIRouter(prefix=prefix, tags=[tag])

    @r.get("")
    async def _stub() -> dict[str, str]:
        return {"status": "not_implemented", "module": tag}

    return r


def _make_router_map() -> dict[str, tuple[str, str]]:
    """Map of router module name -> (prefix, tag).

    When a real router module exists it is imported; otherwise a stub is
    used so the server can start regardless of implementation progress.
    """
    return {
        "auth": ("/auth", "Authentication"),
        "children": ("/children", "Children"),
        "stories": ("/stories", "Stories"),
        "illustrations": ("/illustrations", "Illustrations"),
        "voice": ("/voice", "Voice"),
        "books": ("/books", "Books"),
        "orders": ("/orders", "Orders"),
        "print": ("/print", "Print"),
        "subscriptions": ("/subscriptions", "Subscriptions"),
        "payments": ("/payments", "Payments"),
        "marketplace": ("/marketplace", "Marketplace"),
        "classroom": ("/classroom", "Classroom"),
        "gifts": ("/gifts", "Gifts"),
        "dreams": ("/dreams", "Dreams"),
        "referral": ("/referral", "Referral"),
        "recommendations": ("/recommendations", "Recommendations"),
        "admin": ("/admin", "Admin"),
        "health": ("/health", "Health"),
    }


def _load_router(module_name: str, prefix: str, tag: str) -> APIRouter:
    """Attempt to import a real router; fall back to a stub on failure.

    If the real router module already defines its own ``prefix`` and/or
    ``tags``, those are preserved.  The values from ``_make_router_map``
    are only applied when the router has no prefix or tags of its own.
    """
    try:
        import importlib

        mod = importlib.import_module(f"app.routers.{module_name}")
        router: APIRouter = getattr(mod, "router")
        if not router.prefix:
            router.prefix = prefix
        if not router.tags:
            router.tags = [tag]
        return router
    except (ImportError, AttributeError):
        return _stub_router(prefix, tag)


# ── Application Factory ─────────────────────────────────────────────────


def create_app() -> FastAPI:
    """Build, configure, and return the FastAPI application instance."""
    settings = get_settings()

    app = FastAPI(
        title=APP_NAME,
        version=APP_VERSION,
        description=APP_DESCRIPTION,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # ── CORS Middleware ──────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )

    # ── Exception Handlers ──────────────────────────────────────────
    app.add_exception_handler(RequestValidationError, validation_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(401, unauthorized_handler)  # type: ignore[arg-type]
    app.add_exception_handler(403, forbidden_handler)  # type: ignore[arg-type]
    app.add_exception_handler(404, not_found_handler)  # type: ignore[arg-type]
    app.add_exception_handler(500, internal_error_handler)  # type: ignore[arg-type]

    # ── Root Endpoint ───────────────────────────────────────────────
    @app.get("/", tags=["Root"])
    async def root() -> dict[str, str]:
        return {"name": APP_NAME, "version": APP_VERSION}

    # ── API v1 Router ───────────────────────────────────────────────
    api_v1 = APIRouter(prefix="/api/v1")

    for module_name, (prefix, tag) in _make_router_map().items():
        router = _load_router(module_name, prefix, tag)
        api_v1.include_router(router)

    app.include_router(api_v1)

    return app


# ── Module-level application instance ───────────────────────────────────
# Used by uvicorn: ``uvicorn app.main:app``
app = create_app()
