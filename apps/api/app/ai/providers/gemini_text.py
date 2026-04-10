"""Gemini (Google) text generation provider.

Spec ref: Ch4.4 S-01 — Gemini API as secondary LLM.
"""

from __future__ import annotations

import json
import time
from typing import Any, AsyncIterator

from .base import (
    GenerationOptions,
    ProviderCapability,
    TextGenerationProvider,
    TextResult,
)


class GeminiTextProvider(TextGenerationProvider):
    """Google Gemini API text generation provider."""

    provider_id: str = "gemini"

    def __init__(self, api_key: str, model: str = "gemini-2.0-flash") -> None:
        self.api_key = api_key
        self.model = model
        self._client: Any = None

    def _get_client(self) -> Any:
        if self._client is None:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self._client = genai.GenerativeModel(self.model)
        return self._client

    async def generate_text(
        self,
        prompt: str,
        system_prompt: str,
        options: GenerationOptions | None = None,
    ) -> TextResult:
        opts = options or GenerationOptions()
        client = self._get_client()
        start = time.perf_counter()

        response = await client.generate_content_async(
            f"{system_prompt}\n\n{prompt}",
            generation_config={
                "max_output_tokens": opts.max_tokens,
                "temperature": opts.temperature,
            },
        )

        elapsed = (time.perf_counter() - start) * 1000
        text = response.text
        tokens_est = len(text.split())

        return TextResult(
            text=text,
            provider_id=self.provider_id,
            model=self.model,
            tokens_input=len(prompt.split()),
            tokens_output=tokens_est,
            latency_ms=elapsed,
            cost_usd=tokens_est * 0.0001,
        )

    async def generate_structured(
        self,
        prompt: str,
        system_prompt: str,
        schema: dict[str, Any],
        options: GenerationOptions | None = None,
    ) -> dict[str, Any]:
        result = await self.generate_text(
            prompt=f"{prompt}\n\nRespond with valid JSON matching: {json.dumps(schema)}",
            system_prompt=system_prompt + "\nAlways respond with valid JSON only.",
            options=options,
        )
        return json.loads(result.text)

    async def health_check(self) -> bool:
        try:
            client = self._get_client()
            await client.generate_content_async("ping")
            return True
        except Exception:
            return False
