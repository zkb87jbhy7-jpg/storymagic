"""
Agent A-15: Recommendation — Generates personalized book recommendations.

Spec ref: Chapter 5.16 — Combines collaborative filtering, content-based
filtering, and contextual signals.  Respects cultural preferences.
Generates NL explanations for parents.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from ..providers.base import GenerationOptions
from .base_agent import AgentResult, BaseAgent

logger = logging.getLogger("storymagic.agents.recommendation")

# Seasonal themes
SEASONAL_THEMES: dict[str, list[str]] = {
    "spring": ["nature", "growth", "flowers", "butterflies", "rain", "gardening"],
    "summer": ["beach", "sun", "vacation", "swimming", "ice cream", "adventures"],
    "autumn": ["leaves", "harvest", "back to school", "cozy", "pumpkins"],
    "winter": ["snow", "warmth", "holidays", "hot chocolate", "stars", "cozy"],
}

# Life event themes
LIFE_EVENT_THEMES: dict[str, list[str]] = {
    "new_sibling": ["family", "sharing", "big brother/sister", "baby", "love"],
    "starting_school": ["school", "friends", "learning", "bravery", "new beginnings"],
    "birthday": ["celebration", "growing up", "wishes", "party", "special day"],
    "moving": ["new home", "change", "adventure", "making friends", "belonging"],
    "loss": ["feelings", "memory", "love", "comfort", "healing"],
    "divorce": ["two homes", "love", "family", "feelings", "stability"],
    "new_pet": ["animals", "responsibility", "friendship", "caring", "joy"],
    "holiday": ["traditions", "family", "celebration", "giving", "togetherness"],
}


class RecommendationAgent(BaseAgent):
    """A-15 — Generates 5 ranked book recommendations with explanations."""

    agent_id = "recommendation"

    async def execute(self, **kwargs: Any) -> AgentResult:
        """
        Parameters
        ----------
        child_profile : dict        — {name, age, gender, interests, cultural_prefs}
        previous_books : list       — [{title, theme, rating}]
        season : str                — current season
        life_events : list[str]     — upcoming or recent life events
        book_id : str
        """
        start = time.perf_counter()
        child_profile: dict[str, Any] = kwargs["child_profile"]
        previous_books: list[dict[str, Any]] = kwargs.get("previous_books", [])
        season: str = kwargs.get("season", "")
        life_events: list[str] = kwargs.get("life_events", [])
        book_id: str = kwargs.get("book_id", "unknown")

        child_name = child_profile.get("name", "")
        child_age = child_profile.get("age", 5)
        child_gender = child_profile.get("gender", "")
        interests = child_profile.get("interests", [])
        cultural_prefs = child_profile.get("cultural_prefs", {})

        # Build context from previous books
        prev_books_text = ""
        if previous_books:
            liked = [b for b in previous_books if b.get("rating", 0) >= 4]
            disliked = [b for b in previous_books if b.get("rating", 0) <= 2]

            if liked:
                prev_books_text += "Books the child enjoyed:\n"
                prev_books_text += "\n".join(
                    f"- {b.get('title', '?')} (theme: {b.get('theme', '?')})"
                    for b in liked
                )
                prev_books_text += "\n\n"

            if disliked:
                prev_books_text += "Books the child did NOT enjoy:\n"
                prev_books_text += "\n".join(
                    f"- {b.get('title', '?')} (theme: {b.get('theme', '?')})"
                    for b in disliked
                )
                prev_books_text += "\n\n"

        # Build contextual signals
        contextual_text = ""
        if season and season in SEASONAL_THEMES:
            contextual_text += f"Current season: {season} (themes: {', '.join(SEASONAL_THEMES[season])})\n"

        for event in life_events:
            if event in LIFE_EVENT_THEMES:
                contextual_text += (
                    f"Life event: {event} (themes: {', '.join(LIFE_EVENT_THEMES[event])})\n"
                )

        # Cultural preference context
        cultural_text = ""
        religion = cultural_prefs.get("religion", "")
        if religion:
            cultural_text = f"Cultural/religious background: {religion}. Only recommend holiday-appropriate content.\n"

        system_prompt = (
            "You are a personalized children's book recommendation engine. "
            "Generate exactly 5 ranked book story recommendations. Each "
            "recommendation should be a unique story concept tailored to "
            "this specific child.\n\n"
            "Use three filtering approaches:\n"
            "1. Collaborative filtering — similar children enjoyed these themes\n"
            "2. Content-based filtering — based on themes this child has enjoyed\n"
            "3. Contextual signals — season, life events, age-appropriateness\n\n"
            "Each recommendation must include a natural-language explanation "
            "that speaks directly to the parent about why this story would "
            "resonate with their child.\n"
        )

        user_prompt = (
            f"Child: {child_name}, age {child_age}, {child_gender}\n"
            f"Interests: {', '.join(interests) if interests else 'general'}\n"
            f"{cultural_text}"
            f"{prev_books_text}"
            f"{contextual_text}\n"
            f"Generate 5 ranked story recommendations. Return JSON with:\n"
            f"- 'recommendations': array of 5 objects, each with:\n"
            f"  - 'rank' (1-5)\n"
            f"  - 'title' (story title)\n"
            f"  - 'theme' (central theme)\n"
            f"  - 'description' (2-3 sentence story premise)\n"
            f"  - 'explanation' (natural language explanation for parent)\n"
            f"  - 'age_range' (e.g., '3-5')\n"
            f"  - 'tags' (array of topic tags)\n"
            f"  - 'filtering_method' (collaborative/content_based/contextual)\n"
        )

        rec_schema: dict[str, Any] = {
            "type": "object",
            "required": ["recommendations"],
            "properties": {
                "recommendations": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "rank", "title", "theme", "description",
                            "explanation", "age_range", "tags", "filtering_method",
                        ],
                        "properties": {
                            "rank": {"type": "integer"},
                            "title": {"type": "string"},
                            "theme": {"type": "string"},
                            "description": {"type": "string"},
                            "explanation": {"type": "string"},
                            "age_range": {"type": "string"},
                            "tags": {"type": "array", "items": {"type": "string"}},
                            "filtering_method": {"type": "string"},
                        },
                    },
                }
            },
        }

        options = GenerationOptions(
            max_tokens=4096,
            temperature=0.8,
            response_format="json",
        )

        try:
            result = await self.router.generate_structured(
                prompt=user_prompt,
                system_prompt=system_prompt,
                schema=rec_schema,
                options=options,
            )
        except Exception as exc:
            latency = self._elapsed_ms(start)
            return AgentResult(
                agent_id=self.agent_id,
                success=False,
                errors=[f"Recommendation generation failed: {exc}"],
                latency_ms=latency,
            )

        recommendations = result.get("recommendations", [])
        warnings: list[str] = []

        if len(recommendations) != 5:
            warnings.append(f"Expected 5 recommendations, got {len(recommendations)}")

        # Ensure ranks are 1-5
        for i, rec in enumerate(recommendations):
            rec["rank"] = i + 1

        # Validate no previous book titles are repeated
        prev_titles = {b.get("title", "").lower() for b in previous_books}
        for rec in recommendations:
            if rec.get("title", "").lower() in prev_titles:
                warnings.append(
                    f"Recommendation '{rec.get('title')}' was already "
                    f"in previous books"
                )

        latency = self._elapsed_ms(start)
        self._log_event(
            book_id,
            "recommendation_complete",
            {
                "recommendation_count": len(recommendations),
                "season": season,
                "life_events": life_events,
            },
            latency_ms=latency,
        )

        return AgentResult(
            agent_id=self.agent_id,
            success=True,
            data={"recommendations": recommendations},
            warnings=warnings,
            latency_ms=latency,
        )
