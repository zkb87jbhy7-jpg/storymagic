"""AI Router — selects provider, executes with timeout, falls over on failure.

Spec ref: Ch4.5 — An AIRouter selects the provider, executes with timeout,
and automatically falls over to the next provider on failure.
A/B testing support routes configurable percentages of requests to different
providers via experiment IDs.
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any, AsyncIterator

from .base import (
    CharacterSheetResult,
    CloneResult,
    EmbeddingResult,
    FaceProcessingOptions,
    GenerationOptions,
    ImageGenerationOptions,
    ImageResult,
    PerformanceMarkup,
    ProviderCapability,
    TextResult,
    VoiceGenerationOptions,
    VoiceResult,
)
from .circuit_breaker import CircuitBreakerOpen
from .registry import ProviderRegistry

logger = logging.getLogger("storymagic.ai.router")


class AIRouter:
    """Routes AI requests to the best available provider with fallback.

    Usage:
        router = AIRouter(registry)
        result = await router.generate_text(prompt, system_prompt)
    """

    def __init__(self, registry: ProviderRegistry) -> None:
        self.registry = registry

    async def generate_text(
        self,
        prompt: str,
        system_prompt: str,
        options: GenerationOptions | None = None,
    ) -> TextResult:
        """Generate text using the best available text provider."""
        opts = options or GenerationOptions()
        providers = self.registry.get_all(ProviderCapability.TEXT_GENERATION)

        last_error: Exception | None = None
        for provider in providers:
            cb = self.registry.get_circuit_breaker(provider.provider_id)
            try:
                start = time.perf_counter()
                if cb:
                    result = await cb.execute(
                        asyncio.wait_for,
                        provider.generate_text(prompt, system_prompt, opts),
                        timeout=opts.timeout_seconds,
                    )
                else:
                    result = await asyncio.wait_for(
                        provider.generate_text(prompt, system_prompt, opts),
                        timeout=opts.timeout_seconds,
                    )
                elapsed = (time.perf_counter() - start) * 1000
                logger.info(
                    "generate_text: provider=%s latency=%.0fms",
                    provider.provider_id,
                    elapsed,
                )
                return result
            except CircuitBreakerOpen:
                logger.warning("Circuit open for %s, trying next", provider.provider_id)
                last_error = Exception(f"Circuit open: {provider.provider_id}")
            except Exception as exc:
                logger.error(
                    "generate_text failed: provider=%s error=%s",
                    provider.provider_id,
                    exc,
                )
                last_error = exc

        raise RuntimeError(
            f"All text providers failed. Last error: {last_error}"
        )

    async def generate_structured(
        self,
        prompt: str,
        system_prompt: str,
        schema: dict[str, Any],
        options: GenerationOptions | None = None,
    ) -> dict[str, Any]:
        """Generate structured JSON matching a schema."""
        opts = options or GenerationOptions()
        providers = self.registry.get_all(ProviderCapability.TEXT_GENERATION)

        for provider in providers:
            try:
                return await asyncio.wait_for(
                    provider.generate_structured(prompt, system_prompt, schema, opts),
                    timeout=opts.timeout_seconds,
                )
            except Exception as exc:
                logger.error("generate_structured failed: %s %s", provider.provider_id, exc)

        raise RuntimeError("All text providers failed for structured generation")

    async def stream_text(
        self,
        prompt: str,
        system_prompt: str,
        options: GenerationOptions | None = None,
    ) -> AsyncIterator[str]:
        """Stream text tokens from the best available provider."""
        opts = options or GenerationOptions()
        provider = self.registry.get_best(ProviderCapability.TEXT_GENERATION)
        if not provider:
            raise RuntimeError("No text generation provider available")
        async for token in provider.stream_text(prompt, system_prompt, opts):
            yield token

    async def generate_image(
        self,
        prompt: str,
        negative_prompt: str,
        options: ImageGenerationOptions | None = None,
    ) -> ImageResult:
        """Generate an illustration image."""
        opts = options or ImageGenerationOptions()
        providers = self.registry.get_all(ProviderCapability.IMAGE_GENERATION)

        for provider in providers:
            try:
                return await asyncio.wait_for(
                    provider.generate_image(prompt, negative_prompt, opts),
                    timeout=opts.timeout_seconds,
                )
            except Exception as exc:
                logger.error("generate_image failed: %s %s", provider.provider_id, exc)

        raise RuntimeError("All image providers failed")

    async def generate_character_sheet(
        self,
        child_description: str,
        style: str,
        options: ImageGenerationOptions | None = None,
    ) -> CharacterSheetResult:
        """Generate a 4-view character sheet."""
        opts = options or ImageGenerationOptions()
        provider = self.registry.get_best(ProviderCapability.IMAGE_GENERATION)
        if not provider:
            raise RuntimeError("No image generation provider available")
        return await provider.generate_character_sheet(child_description, style, opts)

    async def generate_voice(
        self,
        text: str,
        voice_id: str,
        performance_markup: PerformanceMarkup | None = None,
        options: VoiceGenerationOptions | None = None,
    ) -> VoiceResult:
        """Generate voice narration."""
        opts = options or VoiceGenerationOptions()
        providers = self.registry.get_all(ProviderCapability.VOICE_GENERATION)

        for provider in providers:
            try:
                return await asyncio.wait_for(
                    provider.generate_narration(text, voice_id, performance_markup, opts),
                    timeout=opts.timeout_seconds,
                )
            except Exception as exc:
                logger.error("generate_voice failed: %s %s", provider.provider_id, exc)

        raise RuntimeError("All voice providers failed")

    async def clone_voice(
        self,
        audio_sample: bytes,
        options: VoiceGenerationOptions | None = None,
    ) -> CloneResult:
        """Clone a voice from a recording."""
        opts = options or VoiceGenerationOptions()
        provider = self.registry.get_best(ProviderCapability.VOICE_GENERATION)
        if not provider:
            raise RuntimeError("No voice provider available")
        return await provider.clone_voice(audio_sample, opts)

    async def process_face(
        self,
        image_data: bytes,
        options: FaceProcessingOptions | None = None,
    ) -> EmbeddingResult:
        """Create a face embedding from an image."""
        opts = options or FaceProcessingOptions()
        provider = self.registry.get_best(ProviderCapability.FACE_PROCESSING)
        if not provider:
            raise RuntimeError("No face processing provider available")
        return await provider.create_embedding(image_data, opts)

    async def compare_faces(
        self,
        embedding1: str,
        embedding2: str,
    ) -> float:
        """Compare two face embeddings, returning cosine similarity."""
        provider = self.registry.get_best(ProviderCapability.FACE_PROCESSING)
        if not provider:
            raise RuntimeError("No face processing provider available")
        return await provider.compare_embeddings(embedding1, embedding2)
