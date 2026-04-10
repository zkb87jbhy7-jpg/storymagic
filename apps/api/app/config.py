"""
StoryMagic API Configuration.

Centralized settings management using pydantic-settings.
All configuration is loaded from environment variables with .env file fallback.
"""

from functools import lru_cache
from pathlib import Path
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve project root (3 levels up from this file: config.py -> app -> api -> STORY)
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
_ENV_FILE = _PROJECT_ROOT / ".env.local"
_ENV_FILE_FALLBACK = _PROJECT_ROOT / ".env"


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    Environment variables can be set directly or via a .env file
    located at the project root.
    """

    model_config = SettingsConfigDict(
        env_file=(str(_ENV_FILE), str(_ENV_FILE_FALLBACK)),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Database ────────────────────────────────────────────────────────
    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/storymagic",
        description="Async database connection string (asyncpg driver)",
    )
    database_sync_url: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/storymagic",
        description="Synchronous database connection string (for Alembic migrations)",
    )

    # ── Redis ───────────────────────────────────────────────────────────
    redis_url: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection URL for caching and sessions",
    )

    # ── Authentication ──────────────────────────────────────────────────
    jwt_secret: str = Field(
        ...,
        description="Secret key for signing JWT tokens",
    )
    jwt_algorithm: str = Field(
        default="HS256",
        description="Algorithm used for JWT encoding/decoding",
    )
    jwt_expiration_minutes: int = Field(
        default=30,
        description="Access token lifetime in minutes",
    )
    jwt_refresh_expiration_days: int = Field(
        default=7,
        description="Refresh token lifetime in days",
    )

    # ── Stripe ──────────────────────────────────────────────────────────
    stripe_secret_key: str = Field(
        default="",
        description="Stripe secret API key",
    )
    stripe_publishable_key: str = Field(
        default="",
        description="Stripe publishable API key",
    )
    stripe_webhook_secret: str = Field(
        default="",
        description="Stripe webhook signing secret",
    )

    # ── AI Providers: Text Generation ───────────────────────────────────
    anthropic_api_key: str = Field(
        default="",
        description="Anthropic (Claude) API key",
    )
    google_ai_api_key: str = Field(
        default="",
        description="Google AI (Gemini) API key",
    )
    openai_api_key: str = Field(
        default="",
        description="OpenAI API key",
    )

    # ── AI Providers: Image Generation ──────────────────────────────────
    comfyui_api_url: str = Field(
        default="http://localhost:8188",
        description="ComfyUI server URL for illustration generation",
    )
    runpod_api_key: str = Field(
        default="",
        description="RunPod API key for serverless GPU workers",
    )

    # ── AI Providers: Voice ─────────────────────────────────────────────
    elevenlabs_api_key: str = Field(
        default="",
        description="ElevenLabs API key for voice narration",
    )
    cartesia_api_key: str = Field(
        default="",
        description="Cartesia API key for low-latency voice",
    )

    # ── AI Providers: Face Processing ───────────────────────────────────
    qdrant_url: str = Field(
        default="http://localhost:6333",
        description="Qdrant vector database URL for face embeddings",
    )

    # ── Encryption ──────────────────────────────────────────────────────
    encryption_master_key: str = Field(
        default="",
        description="Master key for AES-256 encryption of children's data",
    )

    # ── Temporal ────────────────────────────────────────────────────────
    temporal_address: str = Field(
        default="localhost:7233",
        description="Temporal server address",
    )
    temporal_namespace: str = Field(
        default="storymagic",
        description="Temporal namespace for workflow isolation",
    )
    temporal_task_queue: str = Field(
        default="book-generation",
        description="Temporal task queue for book generation workflows",
    )

    # ── Application ─────────────────────────────────────────────────────
    next_public_api_url: str = Field(
        default="http://localhost:8000",
        description="Public-facing API URL used by the frontend",
    )
    api_cors_origins: str = Field(
        default="http://localhost:3000",
        description="Allowed CORS origins (comma-separated)",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [o.strip() for o in self.api_cors_origins.split(",") if o.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached application settings.

    Uses ``functools.lru_cache`` so the settings object is instantiated
    exactly once per process and reused on every subsequent call.
    """
    return Settings()  # type: ignore[call-arg]
