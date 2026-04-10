"""
Agent A-03: Age Adaptation — Adapts text to the child's age and reading level.

Spec ref: Chapter 5.4 — Rules per age group: 2-3 (6 words max), 4-5 (10),
6-7 (15), 8-10 (full literary).  Dyslexia mode shifts down one level.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Any

from ..providers.base import GenerationOptions
from .base_agent import AgentResult, BaseAgent

logger = logging.getLogger("storymagic.agents.age_adaptation")


@dataclass(frozen=True)
class AgeProfile:
    """Adaptation profile for an age group."""

    label: str
    max_sentence_words: int
    vocabulary: str
    features: str


AGE_PROFILES: dict[str, AgeProfile] = {
    "2-3": AgeProfile(
        label="toddler",
        max_sentence_words=6,
        vocabulary="Only concrete nouns, frequent repetition, onomatopoeia.",
        features="Very short sentences, repetitive patterns, sensory words.",
    ),
    "4-5": AgeProfile(
        label="preschool",
        max_sentence_words=10,
        vocabulary="Simple adjectives, basic emotions, dialogue.",
        features="Simple sentence structures, familiar concepts, light dialogue.",
    ),
    "6-7": AgeProfile(
        label="early_reader",
        max_sentence_words=15,
        vocabulary="Complex sentences, richer vocabulary, first metaphors.",
        features="Compound sentences, some figurative language, cause-and-effect.",
    ),
    "8-10": AgeProfile(
        label="independent_reader",
        max_sentence_words=999,
        vocabulary="Full literary quality, complex emotions, subtle humor, multi-layered meaning.",
        features="Rich literary prose, nuanced themes, irony and wordplay.",
    ),
}


def _get_age_profile(age: int, dyslexia_mode: bool = False) -> AgeProfile:
    """Return the AgeProfile for the given age, shifted down if dyslexia mode."""
    if age <= 3:
        key = "2-3"
    elif age <= 5:
        key = "4-5"
    elif age <= 7:
        key = "6-7"
    else:
        key = "8-10"

    if dyslexia_mode:
        shift_map = {"8-10": "6-7", "6-7": "4-5", "4-5": "2-3", "2-3": "2-3"}
        key = shift_map[key]

    return AGE_PROFILES[key]


class AgeAdaptationAgent(BaseAgent):
    """A-03 — Adapts page texts to the child's age and reading preferences."""

    agent_id = "age_adaptation"

    async def execute(self, **kwargs: Any) -> AgentResult:
        """
        Parameters
        ----------
        pages : list[dict]      — [{page_number, text, reading_level}]
        child_age : int
        dyslexia_mode : bool
        language : str
        book_id : str
        """
        start = time.perf_counter()
        pages: list[dict[str, Any]] = kwargs["pages"]
        child_age: int = kwargs["child_age"]
        dyslexia_mode: bool = kwargs.get("dyslexia_mode", False)
        language: str = kwargs.get("language", "he")
        book_id: str = kwargs.get("book_id", "unknown")

        profile = _get_age_profile(child_age, dyslexia_mode)

        system_prompt = (
            f"You are an expert children's text adapter. "
            f"Adapt the following story pages for a {child_age}-year-old child "
            f"(reading level: {profile.label}).\n\n"
            f"RULES:\n"
            f"- Maximum sentence length: {profile.max_sentence_words} words.\n"
            f"- Vocabulary: {profile.vocabulary}\n"
            f"- Features: {profile.features}\n"
            f"- Language: {language}\n"
        )

        if dyslexia_mode:
            system_prompt += (
                "\nDYSLEXIA MODE:\n"
                "- Use shorter sentences and only common words.\n"
                "- Avoid confusing homophones.\n"
                "- Prefer concrete, familiar vocabulary.\n"
            )

        pages_text = "\n\n".join(
            f"PAGE {p.get('page_number', i + 1)}:\n{p.get('text', '')}"
            for i, p in enumerate(pages)
        )

        user_prompt = (
            f"Adapt the following pages. Return JSON with 'pages' array, each "
            f"containing 'page_number', 'text' (adapted text), and "
            f"'lexile_score' (estimated Lexile score as integer).\n\n{pages_text}"
        )

        adapted_schema: dict[str, Any] = {
            "type": "object",
            "required": ["pages"],
            "properties": {
                "pages": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["page_number", "text", "lexile_score"],
                        "properties": {
                            "page_number": {"type": "integer"},
                            "text": {"type": "string"},
                            "lexile_score": {"type": "integer"},
                        },
                    },
                }
            },
        }

        options = GenerationOptions(
            max_tokens=4096,
            temperature=0.5,
            response_format="json",
        )

        try:
            result = await self.router.generate_structured(
                prompt=user_prompt,
                system_prompt=system_prompt,
                schema=adapted_schema,
                options=options,
            )
        except Exception as exc:
            latency = self._elapsed_ms(start)
            return AgentResult(
                agent_id=self.agent_id,
                success=False,
                errors=[f"Age adaptation failed: {exc}"],
                latency_ms=latency,
            )

        adapted_pages = result.get("pages", [])

        # Validate sentence lengths
        warnings: list[str] = []
        for page in adapted_pages:
            text = page.get("text", "")
            sentences = [s.strip() for s in text.replace("!", ".").replace("?", ".").split(".") if s.strip()]
            for sentence in sentences:
                word_count = len(sentence.split())
                if word_count > profile.max_sentence_words and profile.max_sentence_words < 999:
                    warnings.append(
                        f"Page {page.get('page_number', '?')}: sentence with "
                        f"{word_count} words exceeds max {profile.max_sentence_words}"
                    )

        latency = self._elapsed_ms(start)
        self._log_event(
            book_id,
            "age_adaptation_complete",
            {
                "profile": profile.label,
                "dyslexia_mode": dyslexia_mode,
                "page_count": len(adapted_pages),
            },
            latency_ms=latency,
        )

        return AgentResult(
            agent_id=self.agent_id,
            success=True,
            data={
                "pages": adapted_pages,
                "profile": profile.label,
                "max_sentence_words": profile.max_sentence_words,
            },
            warnings=warnings,
            latency_ms=latency,
        )
