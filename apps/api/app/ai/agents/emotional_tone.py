"""
Agent A-05: Emotional Tone — Analyzes and calibrates the emotional arc.

Spec ref: Chapter 5.6 — Detects emotion + intensity per page, validates
against target arc, enforces safety (fear <= 4 for ages 2-5, <= 6 for 6-10),
ensures final 2 pages have warmth/joy >= 7.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from ..providers.base import GenerationOptions
from .base_agent import AgentResult, BaseAgent

logger = logging.getLogger("storymagic.agents.emotional_tone")

# Maximum fear intensity by age group
FEAR_LIMITS: dict[str, int] = {
    "2-5": 4,
    "6-10": 6,
}


def _fear_limit_for_age(age: int) -> int:
    if age <= 5:
        return FEAR_LIMITS["2-5"]
    return FEAR_LIMITS["6-10"]


class EmotionalToneAgent(BaseAgent):
    """A-05 — Analyzes emotional arc across all pages and enforces safety."""

    agent_id = "emotional_tone"

    async def execute(self, **kwargs: Any) -> AgentResult:
        """
        Parameters
        ----------
        pages : list[dict]          — [{page_number, text}]
        target_arc : list[dict]     — [{page_range, emotion}] from blueprint
        child_age : int
        book_id : str
        """
        start = time.perf_counter()
        pages: list[dict[str, Any]] = kwargs["pages"]
        target_arc: list[dict[str, Any]] = kwargs.get("target_arc", [])
        child_age: int = kwargs.get("child_age", 5)
        book_id: str = kwargs.get("book_id", "unknown")

        fear_limit = _fear_limit_for_age(child_age)

        # Build the analysis prompt
        pages_text = "\n\n".join(
            f"PAGE {p.get('page_number', i + 1)}:\n{p.get('text', '')}"
            for i, p in enumerate(pages)
        )

        target_arc_text = "\n".join(
            f"Pages {a.get('page_range', '?')}: target emotion = {a.get('emotion', '?')}"
            for a in target_arc
        )

        system_prompt = (
            "You are an expert in children's emotional storytelling. "
            "Analyze each page of this story for its emotional content.\n\n"
            "For each page, determine:\n"
            "1. The dominant emotion (joy, curiosity, tension, fear, courage, "
            "triumph, warmth, calm, sadness, surprise)\n"
            "2. Emotional intensity (0-10 scale)\n"
            "3. Alignment with the target emotional arc (aligned/deviated)\n\n"
            "If a page deviates significantly, provide a specific rewriting recommendation.\n\n"
            f"SAFETY CONSTRAINTS:\n"
            f"- Fear intensity MUST NOT exceed {fear_limit} for this child's age ({child_age})\n"
            f"- The final 2 pages MUST register warmth or joy at intensity >= 7\n"
        )

        user_prompt = (
            f"Analyze these pages:\n\n{pages_text}\n\n"
            f"Target emotional arc:\n{target_arc_text}\n\n"
            f"Return JSON with 'analysis' array (one per page) each containing: "
            f"'page_number', 'detected_emotion', 'intensity' (0-10), "
            f"'alignment' ('aligned' or 'deviated'), 'recommendation' (string or null). "
            f"Also include 'overall_score' (0-100) and 'safety_issues' (array of strings)."
        )

        analysis_schema: dict[str, Any] = {
            "type": "object",
            "required": ["analysis", "overall_score", "safety_issues"],
            "properties": {
                "analysis": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "page_number", "detected_emotion", "intensity", "alignment",
                        ],
                        "properties": {
                            "page_number": {"type": "integer"},
                            "detected_emotion": {"type": "string"},
                            "intensity": {"type": "number"},
                            "alignment": {"type": "string"},
                            "recommendation": {"type": "string"},
                        },
                    },
                },
                "overall_score": {"type": "number"},
                "safety_issues": {"type": "array", "items": {"type": "string"}},
            },
        }

        options = GenerationOptions(
            max_tokens=4096,
            temperature=0.3,
            response_format="json",
        )

        try:
            result = await self.router.generate_structured(
                prompt=user_prompt,
                system_prompt=system_prompt,
                schema=analysis_schema,
                options=options,
            )
        except Exception as exc:
            latency = self._elapsed_ms(start)
            return AgentResult(
                agent_id=self.agent_id,
                success=False,
                errors=[f"Emotional analysis failed: {exc}"],
                latency_ms=latency,
            )

        # Post-validation: enforce safety constraints ourselves
        analysis = result.get("analysis", [])
        safety_issues: list[str] = list(result.get("safety_issues", []))
        errors: list[str] = []
        recommendations: list[dict[str, Any]] = []

        for entry in analysis:
            emotion = entry.get("detected_emotion", "")
            intensity = entry.get("intensity", 0)
            page_num = entry.get("page_number", 0)

            # Fear intensity check
            if emotion == "fear" and intensity > fear_limit:
                safety_issues.append(
                    f"Page {page_num}: fear intensity {intensity} exceeds "
                    f"limit {fear_limit} for age {child_age}"
                )
                entry["recommendation"] = (
                    f"Reduce fear intensity from {intensity} to at most "
                    f"{fear_limit}. Soften threatening elements, add "
                    f"reassuring details."
                )

            if entry.get("alignment") == "deviated" and entry.get("recommendation"):
                recommendations.append({
                    "page_number": page_num,
                    "recommendation": entry["recommendation"],
                })

        # Final 2 pages must be warmth/joy >= 7
        if len(analysis) >= 2:
            for entry in analysis[-2:]:
                emotion = entry.get("detected_emotion", "")
                intensity = entry.get("intensity", 0)
                page_num = entry.get("page_number", 0)
                if emotion not in ("warmth", "joy") or intensity < 7:
                    safety_issues.append(
                        f"Page {page_num}: final pages must have warmth/joy >= 7, "
                        f"got {emotion} at {intensity}"
                    )
                    entry["recommendation"] = (
                        f"Rewrite to convey warmth or joy at intensity >= 7. "
                        f"Currently: {emotion} at {intensity}."
                    )
                    recommendations.append({
                        "page_number": page_num,
                        "recommendation": entry["recommendation"],
                    })

        if safety_issues:
            errors.extend(safety_issues)

        latency = self._elapsed_ms(start)
        overall_score = result.get("overall_score", 0)

        self._log_event(
            book_id,
            "emotional_tone_complete",
            {
                "overall_score": overall_score,
                "safety_issues_count": len(safety_issues),
                "deviations": len(recommendations),
            },
            quality_score=overall_score,
            latency_ms=latency,
        )

        return AgentResult(
            agent_id=self.agent_id,
            success=len(safety_issues) == 0,
            data={
                "analysis": analysis,
                "overall_score": overall_score,
                "recommendations": recommendations,
                "safety_issues": safety_issues,
            },
            errors=errors,
            quality_score=overall_score,
            latency_ms=latency,
        )
