"""
Agent A-09: Parental Guidance — Generates an automatic parent guide.

Spec ref: Chapter 5.10 — Produces a three-sentence summary, educational value,
five discussion questions, three activities with materials, and emotional notes.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from ..providers.base import GenerationOptions
from .base_agent import AgentResult, BaseAgent

logger = logging.getLogger("storymagic.agents.parental_guidance")


class ParentalGuidanceAgent(BaseAgent):
    """A-09 — Generates the ParentalGuide for each book."""

    agent_id = "parental_guidance"

    async def execute(self, **kwargs: Any) -> AgentResult:
        """
        Parameters
        ----------
        blueprint : dict            — StoryBlueprint
        pages : list[dict]          — final page texts
        child_age : int
        language : str
        book_id : str
        """
        start = time.perf_counter()
        blueprint: dict[str, Any] = kwargs["blueprint"]
        pages: list[dict[str, Any]] = kwargs["pages"]
        child_age: int = kwargs.get("child_age", 5)
        language: str = kwargs.get("language", "he")
        book_id: str = kwargs.get("book_id", "unknown")

        pages_text = "\n\n".join(
            f"Page {p.get('page_number', i + 1)}: {p.get('text', '')}"
            for i, p in enumerate(pages)
        )

        system_prompt = (
            "You are an early childhood education expert and child psychologist. "
            "Generate a comprehensive parent guide for a personalized children's "
            "book. The guide should help parents maximise the educational and "
            "emotional value of reading this book with their child.\n\n"
            f"Language: {language}\n"
            f"Child age: {child_age}\n"
        )

        user_prompt = (
            f"Create a parent guide for this story.\n\n"
            f"Title: {blueprint.get('title', '')}\n"
            f"Theme: {blueprint.get('central_theme', '')}\n"
            f"Moral: {blueprint.get('moral_message', '')}\n\n"
            f"Full text:\n{pages_text}\n\n"
            f"Return JSON with:\n"
            f"- 'summary': exactly 3 sentences describing the story\n"
            f"- 'educational_value': description of learning outcomes\n"
            f"- 'discussion_questions': array of exactly 5 questions\n"
            f"- 'activities': array of exactly 3 objects, each with 'title', "
            f"'description', 'materials' (array of strings)\n"
            f"- 'emotional_notes': description of potentially sensitive moments "
            f"and how to discuss them"
        )

        guide_schema: dict[str, Any] = {
            "type": "object",
            "required": [
                "summary", "educational_value", "discussion_questions",
                "activities", "emotional_notes",
            ],
            "properties": {
                "summary": {"type": "string"},
                "educational_value": {"type": "string"},
                "discussion_questions": {
                    "type": "array",
                    "items": {"type": "string"},
                },
                "activities": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["title", "description", "materials"],
                        "properties": {
                            "title": {"type": "string"},
                            "description": {"type": "string"},
                            "materials": {
                                "type": "array",
                                "items": {"type": "string"},
                            },
                        },
                    },
                },
                "emotional_notes": {"type": "string"},
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
                schema=guide_schema,
                options=options,
            )
        except Exception as exc:
            latency = self._elapsed_ms(start)
            return AgentResult(
                agent_id=self.agent_id,
                success=False,
                errors=[f"Parental guide generation failed: {exc}"],
                latency_ms=latency,
            )

        # Validate counts
        warnings: list[str] = []
        questions = result.get("discussion_questions", [])
        if len(questions) != 5:
            warnings.append(f"Expected 5 discussion questions, got {len(questions)}")

        activities = result.get("activities", [])
        if len(activities) != 3:
            warnings.append(f"Expected 3 activities, got {len(activities)}")

        # Validate summary is roughly 3 sentences
        summary = result.get("summary", "")
        sentence_count = len([s for s in summary.replace("!", ".").replace("?", ".").split(".") if s.strip()])
        if sentence_count > 5:
            warnings.append(f"Summary has {sentence_count} sentences (expected ~3)")

        latency = self._elapsed_ms(start)
        self._log_event(
            book_id,
            "parental_guidance_complete",
            {
                "questions_count": len(questions),
                "activities_count": len(activities),
            },
            latency_ms=latency,
        )

        return AgentResult(
            agent_id=self.agent_id,
            success=True,
            data={"guide": result},
            warnings=warnings,
            latency_ms=latency,
        )
