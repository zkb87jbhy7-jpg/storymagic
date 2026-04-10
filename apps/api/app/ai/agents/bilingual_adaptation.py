"""
Agent A-11: Bilingual Adaptation — Cultural adaptation, not mechanical translation.

Spec ref: Chapter 5.12 — Adapts food/places/customs, replaces idioms,
adapts humor. Preserves meaning. Validates vocabulary is age-appropriate
in the target language.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from ..providers.base import GenerationOptions
from .base_agent import AgentResult, BaseAgent

logger = logging.getLogger("storymagic.agents.bilingual_adaptation")


class BilingualAdaptationAgent(BaseAgent):
    """A-11 — Culturally-aware bilingual adaptation of page texts."""

    agent_id = "bilingual_adaptation"

    async def execute(self, **kwargs: Any) -> AgentResult:
        """
        Parameters
        ----------
        pages : list[dict]          — [{page_number, text}]
        primary_language : str      — e.g. "he"
        secondary_language : str    — e.g. "en"
        child_age : int
        child_name : str
        book_id : str
        """
        start = time.perf_counter()
        pages: list[dict[str, Any]] = kwargs["pages"]
        primary_language: str = kwargs.get("primary_language", "he")
        secondary_language: str = kwargs.get("secondary_language", "en")
        child_age: int = kwargs.get("child_age", 5)
        child_name: str = kwargs.get("child_name", "")
        book_id: str = kwargs.get("book_id", "unknown")

        pages_text = "\n\n".join(
            f"PAGE {p.get('page_number', i + 1)}:\n{p.get('text', '')}"
            for i, p in enumerate(pages)
        )

        system_prompt = (
            "You are a bilingual children's literature expert specialising in "
            "cultural adaptation — NOT mechanical translation. "
            "When adapting text between languages, you must:\n\n"
            "1. Adapt food names to cultural equivalents "
            "(e.g., 'sabich' in Hebrew becomes 'sandwich' in English).\n"
            "2. Replace idiomatic expressions with cultural equivalents "
            "in the target language.\n"
            "3. Adapt humor to work in the target culture.\n"
            "4. Adapt place names and customs where appropriate.\n"
            "5. Preserve the same narrative meaning throughout.\n"
            "6. Ensure vocabulary is age-appropriate for a "
            f"{child_age}-year-old in the target language.\n"
            f"7. Keep the child's name '{child_name}' unchanged.\n"
            "8. Keep nicknames and character names consistent.\n\n"
            f"Primary language: {primary_language}\n"
            f"Target language: {secondary_language}\n"
        )

        user_prompt = (
            f"Adapt the following pages from {primary_language} to "
            f"{secondary_language}:\n\n{pages_text}\n\n"
            f"Return JSON with:\n"
            f"- 'pages': array of objects with 'page_number', 'text' (adapted), "
            f"'adaptation_notes' (explain cultural changes made)\n"
            f"- 'global_notes': overall adaptation notes"
        )

        adaptation_schema: dict[str, Any] = {
            "type": "object",
            "required": ["pages", "global_notes"],
            "properties": {
                "pages": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["page_number", "text", "adaptation_notes"],
                        "properties": {
                            "page_number": {"type": "integer"},
                            "text": {"type": "string"},
                            "adaptation_notes": {"type": "string"},
                        },
                    },
                },
                "global_notes": {"type": "string"},
            },
        }

        options = GenerationOptions(
            max_tokens=4096,
            temperature=0.6,
            response_format="json",
        )

        try:
            result = await self.router.generate_structured(
                prompt=user_prompt,
                system_prompt=system_prompt,
                schema=adaptation_schema,
                options=options,
            )
        except Exception as exc:
            latency = self._elapsed_ms(start)
            return AgentResult(
                agent_id=self.agent_id,
                success=False,
                errors=[f"Bilingual adaptation failed: {exc}"],
                latency_ms=latency,
            )

        adapted_pages = result.get("pages", [])
        warnings: list[str] = []

        # Validate child name preserved
        for page in adapted_pages:
            if child_name and child_name not in page.get("text", ""):
                warnings.append(
                    f"Page {page.get('page_number', '?')}: child name "
                    f"'{child_name}' not found in adapted text"
                )

        # Validate page count matches
        if len(adapted_pages) != len(pages):
            warnings.append(
                f"Page count mismatch: original {len(pages)}, "
                f"adapted {len(adapted_pages)}"
            )

        latency = self._elapsed_ms(start)
        self._log_event(
            book_id,
            "bilingual_adaptation_complete",
            {
                "primary": primary_language,
                "secondary": secondary_language,
                "page_count": len(adapted_pages),
            },
            latency_ms=latency,
        )

        return AgentResult(
            agent_id=self.agent_id,
            success=True,
            data={
                "pages": adapted_pages,
                "global_notes": result.get("global_notes", ""),
                "primary_language": primary_language,
                "secondary_language": secondary_language,
            },
            warnings=warnings,
            latency_ms=latency,
        )
