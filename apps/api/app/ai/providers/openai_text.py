"""OpenAI GPT-4o text generation provider.

Spec ref: Ch4.4 S-01 — GPT-4o as tertiary LLM.
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


class OpenAITextProvider(TextGenerationProvider):
    """OpenAI GPT-4o text generation provider."""

    provider_id: str = "openai"

    def __init__(self, api_key: str, model: str = "gpt-4o") -> None:
        self.api_key = api_key
        self.model = model
        self._client: Any = None

    def _get_client(self) -> Any:
        if self._client is None:
            from openai import AsyncOpenAI
            self._client = AsyncOpenAI(api_key=self.api_key)
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

        response = await client.chat.completions.create(
            model=self.model,
            max_tokens=opts.max_tokens,
            temperature=opts.temperature,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
        )

        elapsed = (time.perf_counter() - start) * 1000
        choice = response.choices[0]
        text = choice.message.content or ""
        input_tokens = response.usage.prompt_tokens if response.usage else 0
        output_tokens = response.usage.completion_tokens if response.usage else 0
        cost = (input_tokens * 0.005 + output_tokens * 0.015) / 1000

        return TextResult(
            text=text,
            provider_id=self.provider_id,
            model=self.model,
            tokens_input=input_tokens,
            tokens_output=output_tokens,
            latency_ms=elapsed,
            cost_usd=cost,
        )

    async def generate_structured(
        self,
        prompt: str,
        system_prompt: str,
        schema: dict[str, Any],
        options: GenerationOptions | None = None,
    ) -> dict[str, Any]:
        opts = options or GenerationOptions()
        client = self._get_client()

        response = await client.chat.completions.create(
            model=self.model,
            max_tokens=opts.max_tokens,
            temperature=opts.temperature,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt + f"\nRespond with JSON matching: {json.dumps(schema)}"},
                {"role": "user", "content": prompt},
            ],
        )

        text = response.choices[0].message.content or "{}"
        return json.loads(text)

    async def stream_text(
        self,
        prompt: str,
        system_prompt: str,
        options: GenerationOptions | None = None,
    ) -> AsyncIterator[str]:
        opts = options or GenerationOptions()
        client = self._get_client()

        stream = await client.chat.completions.create(
            model=self.model,
            max_tokens=opts.max_tokens,
            temperature=opts.temperature,
            stream=True,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
        )

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def health_check(self) -> bool:
        try:
            client = self._get_client()
            await client.chat.completions.create(
                model=self.model,
                max_tokens=5,
                messages=[{"role": "user", "content": "ping"}],
            )
            return True
        except Exception:
            return False
