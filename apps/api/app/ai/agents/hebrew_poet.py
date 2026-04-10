"""
Agent A-02: Hebrew Poet — Transforms blueprint scenes into polished literary text.

Spec ref: Chapter 5.3 — When rhyming is requested, uses RAG to retrieve the
20 most relevant rhyme pairs and instructs the AI to use them.  Post-generation
rhyme validation with up to 2 retries.  Falls back to prose if rhyming fails.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from ..providers.base import GenerationOptions
from .base_agent import AgentResult, BaseAgent

logger = logging.getLogger("storymagic.agents.hebrew_poet")

MAX_RHYME_RETRIES = 2

# Word-count ranges by age (spec 5.3)
AGE_WORD_RANGES: dict[str, tuple[int, int]] = {
    "3-5": (50, 150),
    "6-10": (100, 250),
}


def _age_to_range_key(age: int) -> str:
    if age <= 5:
        return "3-5"
    return "6-10"


class HebrewPoetAgent(BaseAgent):
    """A-02 — Generates literary page texts from a StoryBlueprint."""

    agent_id = "hebrew_poet"

    async def execute(self, **kwargs: Any) -> AgentResult:
        """
        Parameters
        ----------
        blueprint : dict        — StoryBlueprint from A-01
        language : str          — ``"he"`` or ``"en"``
        is_rhyming : bool
        child_age : int
        child_name : str
        book_id : str
        """
        start = time.perf_counter()
        blueprint: dict[str, Any] = kwargs["blueprint"]
        language: str = kwargs.get("language", "he")
        is_rhyming: bool = kwargs.get("is_rhyming", False)
        child_age: int = kwargs.get("child_age", 5)
        child_name: str = kwargs.get("child_name", "")
        book_id: str = kwargs.get("book_id", "unknown")

        system_template = self._load_prompt("hebrew_poet_v1")

        # Retrieve rhyme pairs via RAG if rhyming requested
        rhyme_context = ""
        if is_rhyming and language == "he":
            try:
                from ...rhyme.rhyme_rag import RhymeRAG

                rag = RhymeRAG()
                topic = blueprint.get("central_theme", "")
                pairs = rag.retrieve(topic, top_k=20)
                rhyme_context = self._format_rhyme_pairs(pairs)
            except Exception as exc:
                logger.warning("Rhyme RAG retrieval failed: %s", exc)
                rhyme_context = ""

        system_prompt = self._substitute_variables(
            system_template,
            {
                "language": language,
                "is_rhyming": str(is_rhyming).lower(),
                "rhyme_pairs": rhyme_context,
                "child_name": child_name,
                "child_age": str(child_age),
            },
        )

        scenes_text = self._format_scenes(blueprint.get("scenes", []))
        user_prompt = (
            f"Write the full text for each page of this story.\n\n"
            f"Blueprint title: {blueprint.get('title', '')}\n"
            f"Theme: {blueprint.get('central_theme', '')}\n"
            f"Moral: {blueprint.get('moral_message', '')}\n\n"
            f"Scenes:\n{scenes_text}"
        )

        options = GenerationOptions(
            max_tokens=4096,
            temperature=0.85,
            response_format="json",
        )

        page_texts_schema: dict[str, Any] = {
            "type": "object",
            "required": ["pages"],
            "properties": {
                "pages": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["page_number", "text", "reading_level"],
                        "properties": {
                            "page_number": {"type": "integer"},
                            "text": {"type": "string"},
                            "reading_level": {"type": "string"},
                        },
                    },
                }
            },
        }

        result_data: dict[str, Any] | None = None
        retries_used = 0
        rhyme_valid = True
        fell_back_to_prose = False

        for attempt in range(1 + MAX_RHYME_RETRIES):
            try:
                result_data = await self.router.generate_structured(
                    prompt=user_prompt,
                    system_prompt=system_prompt,
                    schema=page_texts_schema,
                    options=options,
                )
            except Exception as exc:
                latency = self._elapsed_ms(start)
                return AgentResult(
                    agent_id=self.agent_id,
                    success=False,
                    errors=[f"Text generation failed: {exc}"],
                    latency_ms=latency,
                    retries_used=attempt,
                )

            # Rhyme validation
            if is_rhyming and language == "he" and not fell_back_to_prose:
                validation = self._validate_rhymes(result_data.get("pages", []))
                if validation["valid"]:
                    rhyme_valid = True
                    break
                else:
                    retries_used = attempt + 1
                    if attempt < MAX_RHYME_RETRIES:
                        feedback = self._build_rhyme_feedback(validation["issues"])
                        user_prompt = (
                            f"The previous text had rhyme issues. "
                            f"Please fix:\n{feedback}\n\n"
                            f"Original scenes:\n{scenes_text}"
                        )
                        logger.info(
                            "Rhyme validation failed (attempt %d), retrying with feedback",
                            attempt + 1,
                        )
                    else:
                        logger.warning(
                            "Rhyme validation failed after %d retries, falling back to prose",
                            MAX_RHYME_RETRIES,
                        )
                        fell_back_to_prose = True
                        is_rhyming = False
                        system_prompt = self._substitute_variables(
                            system_template,
                            {
                                "language": language,
                                "is_rhyming": "false",
                                "rhyme_pairs": "",
                                "child_name": child_name,
                                "child_age": str(child_age),
                            },
                        )
                        user_prompt = (
                            f"Write elegant prose (no rhyming required) for each page.\n\n"
                            f"Blueprint title: {blueprint.get('title', '')}\n"
                            f"Scenes:\n{scenes_text}"
                        )
                        # One more generation in prose mode
                        try:
                            result_data = await self.router.generate_structured(
                                prompt=user_prompt,
                                system_prompt=system_prompt,
                                schema=page_texts_schema,
                                options=options,
                            )
                        except Exception as exc:
                            latency = self._elapsed_ms(start)
                            return AgentResult(
                                agent_id=self.agent_id,
                                success=False,
                                errors=[f"Prose fallback generation failed: {exc}"],
                                latency_ms=latency,
                                retries_used=retries_used,
                            )
                        break
            else:
                break

        # Validate word counts per page
        warnings: list[str] = []
        pages = result_data.get("pages", []) if result_data else []
        range_key = _age_to_range_key(child_age)
        min_words, max_words = AGE_WORD_RANGES[range_key]
        for page in pages:
            word_count = len(page.get("text", "").split())
            pn = page.get("page_number", "?")
            if word_count < min_words:
                warnings.append(f"Page {pn}: {word_count} words (min {min_words})")
            elif word_count > max_words:
                warnings.append(f"Page {pn}: {word_count} words (max {max_words})")

        # Validate child name consistency
        for page in pages:
            if child_name and child_name not in page.get("text", ""):
                warnings.append(
                    f"Page {page.get('page_number', '?')}: child name '{child_name}' "
                    f"not found in text"
                )

        latency = self._elapsed_ms(start)
        self._log_event(
            book_id,
            "hebrew_poet_complete",
            {
                "page_count": len(pages),
                "is_rhyming": is_rhyming and not fell_back_to_prose,
                "fell_back_to_prose": fell_back_to_prose,
                "retries_used": retries_used,
            },
            latency_ms=latency,
        )

        return AgentResult(
            agent_id=self.agent_id,
            success=True,
            data={
                "pages": pages,
                "is_rhyming": is_rhyming and not fell_back_to_prose,
                "fell_back_to_prose": fell_back_to_prose,
            },
            warnings=warnings,
            latency_ms=latency,
            retries_used=retries_used,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _format_scenes(scenes: list[dict[str, Any]]) -> str:
        parts: list[str] = []
        for scene in scenes:
            dialogues = "; ".join(
                f"{d.get('speaker', '?')}: \"{d.get('text', '')}\""
                for d in scene.get("dialogues", [])
            )
            parts.append(
                f"Page {scene.get('page_number', '?')}: "
                f"[{scene.get('narrative_role', '')}] "
                f"{scene.get('environment', '')} — {scene.get('action', '')} "
                f"Emotion: {scene.get('dominant_emotion', '')} "
                f"Dialogues: {dialogues} "
                f"Illustration hint: {scene.get('illustration_hint', '')}"
            )
        return "\n".join(parts)

    @staticmethod
    def _format_rhyme_pairs(pairs: list[dict[str, Any]]) -> str:
        lines: list[str] = []
        for pair in pairs:
            w1 = pair.get("word1", "")
            w2 = pair.get("word2", "")
            lines.append(f"{w1} / {w2}")
        return "\n".join(lines)

    def _validate_rhymes(self, pages: list[dict[str, Any]]) -> dict[str, Any]:
        """Validate rhymes using the rhyme validator."""
        try:
            from ...rhyme.rhyme_validator import RhymeValidator

            validator = RhymeValidator()
            all_issues: list[dict[str, Any]] = []
            for page in pages:
                text = page.get("text", "")
                page_issues = validator.validate_page(text, page.get("page_number", 0))
                all_issues.extend(page_issues)
            return {"valid": len(all_issues) == 0, "issues": all_issues}
        except Exception as exc:
            logger.warning("Rhyme validation unavailable: %s", exc)
            return {"valid": True, "issues": []}

    @staticmethod
    def _build_rhyme_feedback(issues: list[dict[str, Any]]) -> str:
        lines: list[str] = []
        for issue in issues:
            lines.append(
                f"Page {issue.get('page_number', '?')}: "
                f"lines {issue.get('line_a', '?')} and {issue.get('line_b', '?')} "
                f"do not rhyme — last word of line {issue.get('line_a', '?')} is "
                f"'{issue.get('word_a', '')}', "
                f"please find a rhyme for it."
            )
        return "\n".join(lines)
