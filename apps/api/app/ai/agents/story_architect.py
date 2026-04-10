"""
Agent A-01: Story Architect — Creates the structural skeleton of a story.

Spec ref: Chapter 5.2 — Generates a StoryBlueprint containing title, subtitle,
theme, moral, emotional arc, and per-page scenes with narrative roles.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from ..providers.base import GenerationOptions
from .base_agent import AgentResult, BaseAgent

logger = logging.getLogger("storymagic.agents.story_architect")

# ---------------------------------------------------------------------------
# JSON Schema for StoryBlueprint (used for structured output enforcement)
# ---------------------------------------------------------------------------

STORY_BLUEPRINT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "required": [
        "title",
        "subtitle",
        "central_theme",
        "moral_message",
        "emotional_arc",
        "scenes",
    ],
    "properties": {
        "title": {"type": "string"},
        "subtitle": {"type": "string"},
        "central_theme": {"type": "string"},
        "moral_message": {"type": "string"},
        "emotional_arc": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["page_range", "emotion"],
                "properties": {
                    "page_range": {"type": "string"},
                    "emotion": {"type": "string"},
                },
            },
        },
        "scenes": {
            "type": "array",
            "items": {
                "type": "object",
                "required": [
                    "page_number",
                    "environment",
                    "action",
                    "dialogues",
                    "dominant_emotion",
                    "narrative_role",
                    "illustration_hint",
                ],
                "properties": {
                    "page_number": {"type": "integer"},
                    "environment": {"type": "string"},
                    "action": {"type": "string"},
                    "dialogues": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "speaker": {"type": "string"},
                                "text": {"type": "string"},
                            },
                        },
                    },
                    "dominant_emotion": {"type": "string"},
                    "narrative_role": {"type": "string"},
                    "illustration_hint": {"type": "string"},
                },
            },
        },
    },
}

REQUIRED_NARRATIVE_ROLES = frozenset(
    {"introduction", "rising_action", "climax", "falling_action", "resolution"}
)


class StoryArchitectAgent(BaseAgent):
    """A-01 — Generates the full StoryBlueprint from child profile and prompt."""

    agent_id = "story_architect"

    async def execute(self, **kwargs: Any) -> AgentResult:
        """
        Parameters (passed as kwargs)
        ----------
        child_name : str
        child_age : int
        child_gender : str
        prompt : str           — free-form topic / template content
        mood : str
        page_count : int
        language : str         — ``"he"`` or ``"en"``
        is_rhyming : bool
        book_id : str          — for event logging
        """
        start = time.perf_counter()
        child_name: str = kwargs["child_name"]
        child_age: int = kwargs["child_age"]
        child_gender: str = kwargs["child_gender"]
        prompt: str = kwargs["prompt"]
        mood: str = kwargs.get("mood", "happy")
        page_count: int = kwargs.get("page_count", 10)
        language: str = kwargs.get("language", "he")
        is_rhyming: bool = kwargs.get("is_rhyming", False)
        book_id: str = kwargs.get("book_id", "unknown")

        # Load and fill system prompt
        system_template = self._load_prompt("story_architect_v1")
        system_prompt = self._substitute_variables(
            system_template,
            {
                "child_name": child_name,
                "child_age": str(child_age),
                "child_gender": child_gender,
                "mood": mood,
                "page_count": str(page_count),
                "language": language,
                "is_rhyming": str(is_rhyming).lower(),
            },
        )

        user_prompt = (
            f"Create a {page_count}-page children's story for {child_name} "
            f"(age {child_age}, {child_gender}). "
            f"Topic/prompt: {prompt}. Mood: {mood}. "
            f"Language: {language}. Rhyming: {is_rhyming}."
        )

        options = GenerationOptions(
            max_tokens=4096,
            temperature=0.8,
            response_format="json",
        )

        try:
            blueprint = await self.router.generate_structured(
                prompt=user_prompt,
                system_prompt=system_prompt,
                schema=STORY_BLUEPRINT_SCHEMA,
                options=options,
            )
        except Exception as exc:
            latency = self._elapsed_ms(start)
            self._log_event(book_id, "story_architect_failed", {"error": str(exc)}, latency_ms=latency)
            return AgentResult(
                agent_id=self.agent_id,
                success=False,
                errors=[f"Blueprint generation failed: {exc}"],
                latency_ms=latency,
            )

        # Validate scene count
        errors: list[str] = []
        scenes = blueprint.get("scenes", [])
        if len(scenes) != page_count:
            errors.append(
                f"Scene count mismatch: expected {page_count}, got {len(scenes)}"
            )

        # Validate all 5 narrative roles present
        roles_present = {s.get("narrative_role") for s in scenes}
        missing_roles = REQUIRED_NARRATIVE_ROLES - roles_present
        if missing_roles:
            errors.append(f"Missing narrative roles: {missing_roles}")

        # Validate required top-level fields
        for required_field in STORY_BLUEPRINT_SCHEMA["required"]:
            if required_field not in blueprint or not blueprint[required_field]:
                errors.append(f"Missing or empty required field: {required_field}")

        # Schema validation
        if not self._validate_output(blueprint, STORY_BLUEPRINT_SCHEMA):
            errors.append("Blueprint does not conform to expected schema")

        latency = self._elapsed_ms(start)
        success = len(errors) == 0

        self._log_event(
            book_id,
            "story_architect_complete",
            {
                "scene_count": len(scenes),
                "roles_present": list(roles_present),
                "title": blueprint.get("title", ""),
            },
            quality_score=100.0 if success else 50.0,
            latency_ms=latency,
        )

        return AgentResult(
            agent_id=self.agent_id,
            success=success,
            data={"blueprint": blueprint},
            errors=errors,
            quality_score=100.0 if success else 50.0,
            latency_ms=latency,
        )
