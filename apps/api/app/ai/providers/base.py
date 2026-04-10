"""
AI Provider Abstraction Layer -- Base Classes and Result Types.

Implements the unified plugin interface described in Spec Chapter 4.5.
Every AI integration is wrapped so that providers can be swapped without
touching business logic.  Four capability types are defined:

    - TextGenerationProvider
    - ImageGenerationProvider
    - VoiceGenerationProvider
    - FaceProcessingProvider

Each provider returns strongly-typed result dataclasses.
"""

from __future__ import annotations

import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, AsyncIterator


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class ProviderCapability(Enum):
    """The four capability types supported by the abstraction layer (Spec 4.5)."""

    TEXT_GENERATION = "text_generation"
    IMAGE_GENERATION = "image_generation"
    VOICE_GENERATION = "voice_generation"
    FACE_PROCESSING = "face_processing"


class ProviderStatus(Enum):
    """Health status of a registered provider."""

    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"


# ---------------------------------------------------------------------------
# Options dataclass -- shared across all providers
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class GenerationOptions:
    """Common options passed to every provider call."""

    max_tokens: int = 4096
    temperature: float = 0.7
    timeout_seconds: float = 120.0
    response_format: str = "text"  # "text" | "json"
    variables: dict[str, str] = field(default_factory=dict)
    prompt_version_id: str | None = None
    experiment_id: str | None = None
    extra: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ImageGenerationOptions:
    """Options specific to image generation calls."""

    style: str = "watercolor"
    character_sheet_ref: str | None = None
    face_embedding_ref: str | None = None
    width: int = 1024
    height: int = 1024
    seed: int | None = None
    control_net_pose: str | None = None
    gpu_tier: str = "tier_2"  # tier_1 | tier_2 | tier_3
    timeout_seconds: float = 180.0
    experiment_id: str | None = None
    extra: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class VoiceGenerationOptions:
    """Options specific to voice generation calls."""

    language: str = "he"
    timeout_seconds: float = 60.0
    experiment_id: str | None = None
    extra: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class FaceProcessingOptions:
    """Options specific to face processing calls."""

    timeout_seconds: float = 30.0
    extra: dict[str, Any] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Result dataclasses
# ---------------------------------------------------------------------------


@dataclass
class TextResult:
    """Result of a text generation call."""

    text: str
    provider_id: str
    model: str
    tokens_input: int
    tokens_output: int
    latency_ms: float
    cost_usd: float
    prompt_version_id: str | None = None


@dataclass
class ImageResult:
    """Result of a single image generation call."""

    image_url: str
    thumbnail_url: str
    print_url: str | None
    provider_id: str
    width: int
    height: int
    seed: int
    latency_ms: float
    cost_usd: float


@dataclass
class CharacterSheetResult:
    """Result of the character sheet pipeline (four views)."""

    front_url: str
    profile_url: str
    three_quarter_url: str
    back_url: str
    provider_id: str
    latency_ms: float
    cost_usd: float


@dataclass
class VoiceResult:
    """Result of a voice narration generation call."""

    audio_url: str
    duration_seconds: float
    provider_id: str
    latency_ms: float
    cost_usd: float


@dataclass
class CloneResult:
    """Result of a voice cloning request."""

    voice_id: str
    clone_status: str  # "processing" | "ready" | "failed"
    provider_id: str
    preview_audio_url: str | None
    quality_score: float | None
    latency_ms: float


@dataclass
class EmbeddingResult:
    """Result of a face embedding creation."""

    embedding_ref: str
    face_detected: bool
    face_count: int
    quality_score: float
    provider_id: str
    latency_ms: float


# ---------------------------------------------------------------------------
# Performance Markup (matches shared-types PerformanceMarkup)
# ---------------------------------------------------------------------------


@dataclass
class PerformanceMarkup:
    """SSML performance markup for narration (Spec S-04)."""

    speaker: str
    emotion: str  # happy | scared | whispering | shouting | singing | brave | gentle
    pace: str  # slow | normal | fast
    pause_before: float
    pause_after: float
    emphasized_words: list[int] = field(default_factory=list)
    sound_effect: str | None = None


# ---------------------------------------------------------------------------
# Provider metrics
# ---------------------------------------------------------------------------


@dataclass
class ProviderMetrics:
    """Runtime metrics collected for a registered provider."""

    provider_id: str
    capability: ProviderCapability
    status: ProviderStatus = ProviderStatus.HEALTHY
    total_calls: int = 0
    total_failures: int = 0
    latency_p50_ms: float = 0.0
    latency_p95_ms: float = 0.0
    error_rate: float = 0.0
    last_check_at: float = field(default_factory=time.time)
    circuit_breaker_open: bool = False
    consecutive_failures: int = 0
    cost_per_unit: float = 0.0
    priority: int = 0


# ---------------------------------------------------------------------------
# Abstract Base Classes
# ---------------------------------------------------------------------------


class TextGenerationProvider(ABC):
    """Abstract interface for text / LLM providers (Claude, Gemini, GPT-4o).

    Every text provider MUST implement ``generate_text`` and
    ``generate_structured``.  Optionally override ``stream_text`` for
    streaming responses.

    Reference: Spec Chapter 4.5 -- TextGenerationProvider capability.
    """

    provider_id: str
    capability: ProviderCapability = ProviderCapability.TEXT_GENERATION

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_prompt: str,
        options: GenerationOptions | None = None,
    ) -> TextResult:
        """Generate plain-text or JSON text from a prompt."""
        ...

    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        system_prompt: str,
        schema: dict[str, Any],
        options: GenerationOptions | None = None,
    ) -> dict[str, Any]:
        """Generate structured JSON output conforming to *schema*.

        Uses provider-level structured output enforcement (e.g. Anthropic
        ``response_format``) to guarantee valid JSON, eliminating parsing
        failures and retry-on-format-error loops (Spec 5.2).
        """
        ...

    async def stream_text(
        self,
        prompt: str,
        system_prompt: str,
        options: GenerationOptions | None = None,
    ) -> AsyncIterator[str]:
        """Stream text tokens one at a time.  Default falls back to
        a single ``generate_text`` call yielding the whole result at once."""
        result = await self.generate_text(prompt, system_prompt, options)
        yield result.text

    async def health_check(self) -> bool:
        """Return ``True`` if the provider is reachable and responsive."""
        return True


class ImageGenerationProvider(ABC):
    """Abstract interface for image generation providers (ComfyUI / Flux / Replicate).

    Reference: Spec Chapter 4.5 -- ImageGenerationProvider capability.
    """

    provider_id: str
    capability: ProviderCapability = ProviderCapability.IMAGE_GENERATION

    @abstractmethod
    async def generate_image(
        self,
        prompt: str,
        negative_prompt: str,
        options: ImageGenerationOptions | None = None,
    ) -> ImageResult:
        """Generate a single illustration image."""
        ...

    @abstractmethod
    async def generate_character_sheet(
        self,
        child_description: str,
        style: str,
        options: ImageGenerationOptions | None = None,
    ) -> CharacterSheetResult:
        """Generate a four-view character sheet (front, profile, 3/4, back).

        The character sheet is created before any book illustrations begin
        and serves as reference for every subsequent illustration (Spec S-03).
        """
        ...

    async def health_check(self) -> bool:
        """Return ``True`` if the provider is reachable and responsive."""
        return True


class VoiceGenerationProvider(ABC):
    """Abstract interface for voice providers (ElevenLabs / Cartesia / Fish Audio).

    Reference: Spec Chapter 4.5 -- VoiceGenerationProvider capability.
    """

    provider_id: str
    capability: ProviderCapability = ProviderCapability.VOICE_GENERATION

    @abstractmethod
    async def generate_narration(
        self,
        text: str,
        voice_id: str,
        performance_markup: PerformanceMarkup | None = None,
        options: VoiceGenerationOptions | None = None,
    ) -> VoiceResult:
        """Generate narration audio for a single page of text."""
        ...

    @abstractmethod
    async def clone_voice(
        self,
        audio_sample: bytes,
        options: VoiceGenerationOptions | None = None,
    ) -> CloneResult:
        """Clone a voice from a 30-second parent recording (Spec S-04)."""
        ...

    async def health_check(self) -> bool:
        """Return ``True`` if the provider is reachable and responsive."""
        return True


class FaceProcessingProvider(ABC):
    """Abstract interface for face processing (InsightFace / ArcFace / BlazeFace).

    Reference: Spec Chapter 4.5 -- FaceProcessingProvider capability.
    """

    provider_id: str
    capability: ProviderCapability = ProviderCapability.FACE_PROCESSING

    @abstractmethod
    async def create_embedding(
        self,
        image_data: bytes,
        options: FaceProcessingOptions | None = None,
    ) -> EmbeddingResult:
        """Create a face embedding from an uploaded photo."""
        ...

    @abstractmethod
    async def compare_embeddings(
        self,
        embedding1: str,
        embedding2: str,
        options: FaceProcessingOptions | None = None,
    ) -> float:
        """Compare two face embeddings and return cosine similarity [0..1].

        The likeness threshold is 0.75 (Spec L-04).
        """
        ...

    async def health_check(self) -> bool:
        """Return ``True`` if the provider is reachable and responsive."""
        return True
