"""Mock voice generation provider for development.

Returns placeholder audio URLs for testing without real TTS calls.
"""

from __future__ import annotations

import asyncio
import random

from .base import (
    CloneResult,
    PerformanceMarkup,
    ProviderCapability,
    VoiceGenerationOptions,
    VoiceGenerationProvider,
    VoiceResult,
)


class MockVoiceProvider(VoiceGenerationProvider):
    """Mock voice provider returning placeholder audio URLs."""

    provider_id: str = "mock_voice"

    async def generate_narration(
        self,
        text: str,
        voice_id: str,
        performance_markup: PerformanceMarkup | None = None,
        options: VoiceGenerationOptions | None = None,
    ) -> VoiceResult:
        # Estimate duration from text length (~150 words per minute)
        word_count = len(text.split())
        duration = max(5.0, word_count / 2.5)
        await asyncio.sleep(0.5)

        return VoiceResult(
            audio_url=f"/audio/mock/narration_{random.randint(1000, 9999)}.mp3",
            duration_seconds=duration,
            provider_id=self.provider_id,
            latency_ms=500,
            cost_usd=round(duration * 0.004, 4),  # ~$0.004/sec
        )

    async def clone_voice(
        self,
        audio_sample: bytes,
        options: VoiceGenerationOptions | None = None,
    ) -> CloneResult:
        await asyncio.sleep(1.0)

        return CloneResult(
            voice_id=f"clone_{random.randint(1000, 9999)}",
            clone_status="ready",
            provider_id=self.provider_id,
            preview_audio_url="/audio/mock/clone_preview.mp3",
            quality_score=0.85,
            latency_ms=1000,
        )
