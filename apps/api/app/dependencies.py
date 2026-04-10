"""
StoryMagic API Dependency Injection.

Provides FastAPI dependencies for database sessions, Redis connections,
and user authentication used across all route handlers.
"""

from typing import Annotated, Any

import redis.asyncio as aioredis
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import Settings, get_settings

# ── Module-level state (initialised in setup_database) ──────────────────
_engine: AsyncEngine | None = None
_async_session_factory: async_sessionmaker[AsyncSession] | None = None
_redis_pool: aioredis.Redis | None = None

# Bearer token scheme for Swagger UI integration
_bearer_scheme = HTTPBearer(auto_error=False)


# ── Database setup / teardown ───────────────────────────────────────────


async def setup_database(settings: Settings) -> None:
    """Create the async SQLAlchemy engine and session factory.

    Call this once during application startup (inside the lifespan handler).
    """
    global _engine, _async_session_factory  # noqa: PLW0603

    _engine = create_async_engine(
        settings.database_url,
        echo=False,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=300,
    )
    _async_session_factory = async_sessionmaker(
        bind=_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )


async def teardown_database() -> None:
    """Dispose of the engine connection pool.

    Call this during application shutdown.
    """
    global _engine, _async_session_factory  # noqa: PLW0603

    if _engine is not None:
        await _engine.dispose()
        _engine = None
        _async_session_factory = None


# ── Redis setup / teardown ──────────────────────────────────────────────


async def setup_redis(settings: Settings) -> None:
    """Initialise the shared Redis connection pool."""
    global _redis_pool  # noqa: PLW0603

    _redis_pool = aioredis.from_url(
        settings.redis_url,
        decode_responses=True,
        max_connections=20,
    )


async def teardown_redis() -> None:
    """Close the Redis connection pool."""
    global _redis_pool  # noqa: PLW0603

    if _redis_pool is not None:
        await _redis_pool.aclose()
        _redis_pool = None


# ── FastAPI Dependencies ────────────────────────────────────────────────


async def get_db() -> AsyncSession:  # type: ignore[misc]
    """Yield an async SQLAlchemy session.

    The session is committed/rolled-back and closed automatically.
    Usage::

        @router.get("/items")
        async def list_items(db: AsyncSession = Depends(get_db)):
            ...
    """
    if _async_session_factory is None:
        raise RuntimeError(
            "Database is not initialised. Call setup_database() during startup."
        )

    async with _async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_redis() -> aioredis.Redis:  # type: ignore[misc]
    """Return the shared Redis connection.

    Usage::

        @router.get("/cached")
        async def cached(redis: aioredis.Redis = Depends(get_redis)):
            ...
    """
    if _redis_pool is None:
        raise RuntimeError(
            "Redis is not initialised. Call setup_redis() during startup."
        )
    return _redis_pool


async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(_bearer_scheme),
    ] = None,
    settings: Settings = Depends(get_settings),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Extract and validate the JWT from the ``Authorization: Bearer <token>`` header.

    Returns the authenticated user record as a dictionary.  Raises
    ``401 Unauthorized`` if the token is missing, expired, or invalid,
    or if the user no longer exists in the database.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        payload: dict[str, Any] = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Look up the user in the database to ensure the account still exists.
    # Import here to avoid circular dependency with models module.
    from sqlalchemy import text

    result = await db.execute(
        text("SELECT id, email, name, is_admin, is_active FROM users WHERE id = :id"),
        {"id": user_id},
    )
    user_row = result.mappings().first()

    if user_row is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = dict(user_row)

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_current_admin(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> dict[str, Any]:
    """Ensure the authenticated user has administrator privileges.

    Depends on :func:`get_current_user` — so the token is validated
    first.  Raises ``403 Forbidden`` when ``is_admin`` is falsy.
    """
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )
    return current_user
