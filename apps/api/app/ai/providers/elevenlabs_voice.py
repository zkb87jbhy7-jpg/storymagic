"""ElevenLabs voice generation provider.

Spec ref: Ch4.4 S-04 — ElevenLabs API for high-quality voice narration.
Voice cloning from 30-second parent recording.
"""

from __future__ import annotations

import time
from typing import Any

from .base import (
    CloneResult,
    PerformanceMarkup,
    ProviderCapability,
    VoiceGenerationOptions,
    VoiceGenerationProvider,
    VoiceResult,
)


class ElevenLabsVoiceProvider(VoiceGenerationProvider):
    """ElevenLabs API voice generation and cloning provider."""

    provider_id: str = "elevenlabs"

    def __init__(self, api_key: str) -> None:
        self.api_key = api_key
        self.base_url = "https://api.elevenlabs.io/v1"

    async def generate_narration(
        self,
        text: str,
        voice_id: str,
        performance_markup: PerformanceMarkup | None = None,
        options: VoiceGenerationOptions | None = None,
    ) -> VoiceResult:
        import httpx

        start = time.perf_counter()
        opts = options or VoiceGenerationOptions()

        # Build SSML from performance markup if provided
        ssml_text = text
        if performance_markup:
            ssml_text = self._build_ssml(text, performance_markup)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/text-to-speech/{voice_id}",
                headers={"xi-api-key": self.api_key},
                json={
                    "text": ssml_text,
                    "model_id": "eleven_multilingual_v2",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                    },
                },
                timeout=opts.timeout_seconds,
            )
            response.raise_for_status()

        elapsed = (time.perf_counter() - start) * 1000
        duration = len(text.split()) / 2.5  # Estimate ~150 wpm

        # In production, save audio to S3 and return URL
        audio_url = f"/audio/generated/narration_{voice_id}_{int(time.time())}.mp3"

        return VoiceResult(
            audio_url=audio_url,
            duration_seconds=duration,
            provider_id=self.provider_id,
            latency_ms=elapsed,
            cost_usd=round(duration * 0.004, 4),
        )

    async def clone_voice(
        self,
        audio_sample: bytes,
        options: VoiceGenerationOptions | None = None,
    ) -> CloneResult:
        import httpx

        start = time.perf_counter()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/voices/add",
                headers={"xi-api-key": self.api_key},
                files={"files": ("sample.mp3", audio_sample, "audio/mpeg")},
                data={
                    "name": f"family_clone_{int(time.time())}",
                    "description": "Family voice clone for StoryMagic",
                },
                timeout=60.0,
            )
            response.raise_for_status()
            data = response.json()

        elapsed = (time.perf_counter() - start) * 1000

        return CloneResult(
            voice_id=data.get("voice_id", ""),
            clone_status="ready",
            provider_id=self.provider_id,
            preview_audio_url=data.get("preview_url"),
            quality_score=None,
            latency_ms=elapsed,
        )

    def _build_ssml(self, text: str, markup: PerformanceMarkup) -> str:
        """Convert Performance Markup to SSML-like format for ElevenLabs."""
        parts = []
        if markup.pause_before > 0:
            parts.append(f"<break time='{int(markup.pause_before)}ms'/>")
        if markup.emotion == "whispering":
            parts.append(f"<prosody volume='soft'>{text}</prosody>")
        elif markup.emotion == "shouting":
            parts.append(f"<prosody volume='loud' rate='fast'>{text}</prosody>")
        elif markup.pace == "slow":
            parts.append(f"<prosody rate='slow'>{text}</prosody>")
        elif markup.pace == "fast":
            parts.append(f"<prosody rate='fast'>{text}</prosody>")
        else:
            parts.append(text)
        if markup.pause_after > 0:
            parts.append(f"<break time='{int(markup.pause_after)}ms'/>")
        return "".join(parts)

    async def health_check(self) -> bool:
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{self.base_url}/voices",
                    headers={"xi-api-key": self.api_key},
                    timeout=10.0,
                )
                return resp.status_code == 200
        except Exception:
            return False
