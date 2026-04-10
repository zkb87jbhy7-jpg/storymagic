"""Mock image generation provider for development.

Returns placeholder image URLs for testing without real GPU calls.
"""

from __future__ import annotations

import asyncio
import random
import time

from .base import (
    CharacterSheetResult,
    ImageGenerationOptions,
    ImageGenerationProvider,
    ImageResult,
    ProviderCapability,
)


def _placeholder_url(width: int = 1024, height: int = 1024, seed: int = 0) -> str:
    """Generate a placeholder image URL."""
    return f"https://picsum.photos/seed/{seed}/{width}/{height}"


class MockImageProvider(ImageGenerationProvider):
    """Mock image provider returning placeholder URLs."""

    provider_id: str = "mock_image"

    async def generate_image(
        self,
        prompt: str,
        negative_prompt: str,
        options: ImageGenerationOptions | None = None,
    ) -> ImageResult:
        opts = options or ImageGenerationOptions()
        seed = opts.seed or random.randint(1, 99999)
        delay = random.uniform(0.5, 2.0)
        await asyncio.sleep(delay)

        return ImageResult(
            image_url=_placeholder_url(opts.width, opts.height, seed),
            thumbnail_url=_placeholder_url(200, 200, seed),
            print_url=_placeholder_url(2400, 2400, seed),
            provider_id=self.provider_id,
            width=opts.width,
            height=opts.height,
            seed=seed,
            latency_ms=delay * 1000,
            cost_usd=0.10,
        )

    async def generate_character_sheet(
        self,
        child_description: str,
        style: str,
        options: ImageGenerationOptions | None = None,
    ) -> CharacterSheetResult:
        await asyncio.sleep(1.5)
        base_seed = random.randint(1, 99999)

        return CharacterSheetResult(
            front_url=_placeholder_url(1024, 1024, base_seed),
            profile_url=_placeholder_url(1024, 1024, base_seed + 1),
            three_quarter_url=_placeholder_url(1024, 1024, base_seed + 2),
            back_url=_placeholder_url(1024, 1024, base_seed + 3),
            provider_id=self.provider_id,
            latency_ms=1500,
            cost_usd=0.40,
        )
