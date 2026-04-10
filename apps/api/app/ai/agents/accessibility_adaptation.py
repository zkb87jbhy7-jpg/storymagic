"""
Agent A-12: Accessibility Adaptation — Adapts content for specific
accessibility needs.

Spec ref: Chapter 5.13 — Autism: concrete language, no idioms.
Dyslexia: simpler words, shorter.  ADHD: split paragraphs, interactives.
Visual impairment: rich alt text.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from ..providers.base import GenerationOptions
from .base_agent import AgentResult, BaseAgent

logger = logging.getLogger("storymagic.agents.accessibility_adaptation")

# Accessibility mode instructions
ACCESSIBILITY_INSTRUCTIONS: dict[str, str] = {
    "autism": (
        "AUTISM SPECTRUM ADAPTATIONS:\n"
        "- Rewrite metaphors into concrete, literal language.\n"
        "- Remove all idioms and sarcasm.\n"
        "- Ensure cause-and-effect relationships are explicit.\n"
        "- Use clear, predictable sentence structures.\n"
        "- Avoid ambiguous pronouns — use names instead.\n"
        "- Provide context for social interactions.\n"
    ),
    "dyslexia": (
        "DYSLEXIA ADAPTATIONS:\n"
        "- Replace complex words with simpler equivalents.\n"
        "- Shorten all sentences.\n"
        "- Avoid confusing homophones.\n"
        "- Use common, familiar vocabulary only.\n"
        "- Avoid words with similar visual shapes (b/d, p/q).\n"
        "- Keep paragraphs very short (2-3 sentences max).\n"
    ),
    "adhd": (
        "ADHD ADAPTATIONS:\n"
        "- Split long paragraphs into short bursts.\n"
        "- Add an interactive element suggestion on every page.\n"
        "- Add encouragement messages every 3 pages.\n"
        "- Use varied sentence lengths to maintain rhythm.\n"
        "- Include sensory details to maintain engagement.\n"
        "- Bold or highlight key words for scanning.\n"
    ),
    "visual_impairment": (
        "VISUAL IMPAIRMENT ADAPTATIONS:\n"
        "- Generate rich, descriptive alt text for each illustration.\n"
        "- Alt text must capture what is shown, the emotional tone, "
        "and the narrative significance.\n"
        "- Describe spatial relationships between characters.\n"
        "- Include colour and texture descriptions.\n"
        "- Describe facial expressions and body language in detail.\n"
    ),
}


class AccessibilityAdaptationAgent(BaseAgent):
    """A-12 — Adapts text and generates alt text, TTS, and animation guidance."""

    agent_id = "accessibility_adaptation"

    async def execute(self, **kwargs: Any) -> AgentResult:
        """
        Parameters
        ----------
        pages : list[dict]              — [{page_number, text}]
        accessibility_prefs : list[str] — ["autism", "dyslexia", "adhd", "visual_impairment"]
        illustration_prompts : list     — for generating alt text
        language : str
        book_id : str
        """
        start = time.perf_counter()
        pages: list[dict[str, Any]] = kwargs["pages"]
        prefs: list[str] = kwargs.get("accessibility_prefs", [])
        illustration_prompts: list[dict[str, Any]] = kwargs.get("illustration_prompts", [])
        language: str = kwargs.get("language", "he")
        book_id: str = kwargs.get("book_id", "unknown")

        if not prefs:
            latency = self._elapsed_ms(start)
            return AgentResult(
                agent_id=self.agent_id,
                success=True,
                data={
                    "pages": [
                        {
                            "page_number": p.get("page_number", i + 1),
                            "text": p.get("text", ""),
                            "alt_text": "",
                            "tts_guidance": {},
                            "animation_guidance": {},
                        }
                        for i, p in enumerate(pages)
                    ],
                    "adaptations_applied": [],
                },
                latency_ms=latency,
            )

        # Build adaptation instructions
        instructions = "\n\n".join(
            ACCESSIBILITY_INSTRUCTIONS.get(pref, "")
            for pref in prefs
            if pref in ACCESSIBILITY_INSTRUCTIONS
        )

        pages_text = "\n\n".join(
            f"PAGE {p.get('page_number', i + 1)}:\n{p.get('text', '')}"
            for i, p in enumerate(pages)
        )

        illustration_context = "\n\n".join(
            f"PAGE {p.get('page_number', i + 1)} ILLUSTRATION:\n"
            f"{p.get('image_prompt', '')}"
            for i, p in enumerate(illustration_prompts)
        )

        system_prompt = (
            "You are an accessibility specialist for children's books. "
            "Adapt the following story pages according to the accessibility "
            "requirements below.\n\n"
            f"{instructions}\n\n"
            f"Language: {language}\n"
        )

        needs_alt_text = "visual_impairment" in prefs
        needs_reduced_motion = "adhd" in prefs or "autism" in prefs

        user_prompt = (
            f"Adapt these pages:\n\n{pages_text}\n\n"
        )

        if needs_alt_text:
            user_prompt += (
                f"Illustration descriptions (for alt text generation):\n"
                f"{illustration_context}\n\n"
            )

        user_prompt += (
            f"Return JSON with 'pages' array, each containing:\n"
            f"- 'page_number'\n"
            f"- 'text' (adapted text)\n"
            f"- 'alt_text' (rich alt text for illustration, empty string if not needed)\n"
            f"- 'tts_guidance' object with 'pace' (slow/normal/fast), "
            f"'pause_between_sentences' (seconds), 'emphasis_words' (array)\n"
            f"- 'animation_guidance' object with 'reduced_motion' (boolean), "
            f"'transition_type' (fade/slide/none), 'auto_advance' (boolean)"
        )

        adapted_schema: dict[str, Any] = {
            "type": "object",
            "required": ["pages"],
            "properties": {
                "pages": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["page_number", "text", "alt_text", "tts_guidance", "animation_guidance"],
                        "properties": {
                            "page_number": {"type": "integer"},
                            "text": {"type": "string"},
                            "alt_text": {"type": "string"},
                            "tts_guidance": {
                                "type": "object",
                                "properties": {
                                    "pace": {"type": "string"},
                                    "pause_between_sentences": {"type": "number"},
                                    "emphasis_words": {"type": "array", "items": {"type": "string"}},
                                },
                            },
                            "animation_guidance": {
                                "type": "object",
                                "properties": {
                                    "reduced_motion": {"type": "boolean"},
                                    "transition_type": {"type": "string"},
                                    "auto_advance": {"type": "boolean"},
                                },
                            },
                        },
                    },
                }
            },
        }

        options = GenerationOptions(
            max_tokens=4096,
            temperature=0.4,
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
                errors=[f"Accessibility adaptation failed: {exc}"],
                latency_ms=latency,
            )

        adapted_pages = result.get("pages", [])

        # Post-process: enforce reduced motion if needed
        if needs_reduced_motion:
            for page in adapted_pages:
                guidance = page.get("animation_guidance", {})
                guidance["reduced_motion"] = True
                guidance["transition_type"] = "fade"
                page["animation_guidance"] = guidance

        # Validate ADHD encouragement messages every 3 pages
        warnings: list[str] = []
        if "adhd" in prefs:
            for i, page in enumerate(adapted_pages):
                if (i + 1) % 3 == 0:
                    text = page.get("text", "").lower()
                    encouragement_markers = [
                        "great job", "well done", "you're doing",
                        "keep going", "amazing", "fantastic", "כל הכבוד",
                        "יופי", "מצוין",
                    ]
                    has_encouragement = any(m in text for m in encouragement_markers)
                    if not has_encouragement:
                        warnings.append(
                            f"Page {page.get('page_number', i + 1)}: "
                            f"ADHD mode - missing encouragement message "
                            f"(expected every 3 pages)"
                        )

        latency = self._elapsed_ms(start)
        self._log_event(
            book_id,
            "accessibility_adaptation_complete",
            {
                "adaptations": prefs,
                "page_count": len(adapted_pages),
            },
            latency_ms=latency,
        )

        return AgentResult(
            agent_id=self.agent_id,
            success=True,
            data={
                "pages": adapted_pages,
                "adaptations_applied": prefs,
            },
            warnings=warnings,
            latency_ms=latency,
        )
