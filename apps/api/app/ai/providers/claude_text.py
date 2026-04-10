"""Claude (Anthropic) text generation provider.

Spec ref: Ch4.4 S-01 — Claude API as primary LLM for story generation.
Uses structured output enforcement via JSON Schema.
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


class ClaudeTextProvider(TextGenerationProvider):
    """Anthropic Claude API text generation provider."""

    provider_id: str = "claude"

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-20250514") -> None:
        self.api_key = api_key
        self.model = model
        self._client: Any = None

    def _get_client(self) -> Any:
        if self._client is None:
            import anthropic
            self._client = anthropic.AsyncAnthropic(api_key=self.api_key)
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

        message = await client.messages.create(
            model=self.model,
            max_tokens=opts.max_tokens,
            temperature=opts.temperature,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}],
        )

        elapsed = (time.perf_counter() - start) * 1000
        text = message.content[0].text
        input_tokens = message.usage.input_tokens
        output_tokens = message.usage.output_tokens
        cost = (input_tokens * 0.003 + output_tokens * 0.015) / 1000

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
        result = await self.generate_text(
            prompt=f"{prompt}\n\nRespond with valid JSON matching this schema:\n{json.dumps(schema, indent=2)}",
            system_prompt=system_prompt + "\n\nAlways respond with valid JSON only. No markdown, no explanation.",
            options=opts,
        )
        return json.loads(result.text)

    async def stream_text(
        self,
        prompt: str,
        system_prompt: str,
        options: GenerationOptions | None = None,
    ) -> AsyncIterator[str]:
        opts = options or GenerationOptions()
        client = self._get_client()

        async with client.messages.stream(
            model=self.model,
            max_tokens=opts.max_tokens,
            temperature=opts.temperature,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            async for text in stream.text_stream:
                yield text

    async def health_check(self) -> bool:
        try:
            client = self._get_client()
            await client.messages.create(
                model=self.model,
                max_tokens=10,
                messages=[{"role": "user", "content": "ping"}],
            )
            return True
        except Exception:
            return False
