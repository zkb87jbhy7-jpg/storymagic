"""
Agent A-07: Quality Critic — LLM-as-Judge evaluation of all artifacts.

Spec ref: Chapter 5.8 — Uses a DIFFERENT LLM than the generator.  Scoring:
0-100, pass threshold 75.  Critical (score=0): safety violations.
Major (-20): plot holes, age mismatch.  Minor (-5): word choice.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from ..providers.base import GenerationOptions
from .base_agent import AgentResult, BaseAgent

logger = logging.getLogger("storymagic.agents.quality_critic")

PASS_THRESHOLD = 75

# Issue severity point deductions
SEVERITY_SCORES: dict[str, int] = {
    "critical": -100,  # effectively sets score to 0
    "major": -20,
    "minor": -5,
}


class QualityCriticAgent(BaseAgent):
    """A-07 — Evaluates artifacts using a different LLM than the generator."""

    agent_id = "quality_critic"

    async def execute(self, **kwargs: Any) -> AgentResult:
        """
        Parameters
        ----------
        content : str               — the artifact to evaluate
        content_type : str          — "story" | "illustration_prompt" | "voice_script"
        child_age : int
        language : str
        child_name : str
        book_id : str
        """
        start = time.perf_counter()
        content: str = kwargs["content"]
        content_type: str = kwargs.get("content_type", "story")
        child_age: int = kwargs.get("child_age", 5)
        language: str = kwargs.get("language", "he")
        child_name: str = kwargs.get("child_name", "")
        book_id: str = kwargs.get("book_id", "unknown")

        system_template = self._load_prompt("quality_critic_v1")
        system_prompt = self._substitute_variables(
            system_template,
            {
                "content_type": content_type,
                "child_age": str(child_age),
                "language": language,
                "child_name": child_name,
            },
        )

        user_prompt = (
            f"Evaluate the following {content_type} artifact for a "
            f"{child_age}-year-old child.\n\n"
            f"CONTENT:\n{content}\n\n"
            f"Check for:\n"
            f"1. Content safety (no violence, inappropriate themes, scary content for age)\n"
            f"2. Age appropriateness (vocabulary, sentence complexity, themes)\n"
            f"3. Narrative coherence (logical flow, no plot holes)\n"
            f"4. Child name consistency ('{child_name}' used correctly)\n"
            f"5. Pronoun consistency\n"
            f"6. Cultural sensitivity\n\n"
            f"Return JSON with:\n"
            f"- 'score' (0-100)\n"
            f"- 'pass' (boolean, true if score >= {PASS_THRESHOLD})\n"
            f"- 'issues' array, each with 'severity' (critical/major/minor), "
            f"'category', 'description', 'recommendation'"
        )

        evaluation_schema: dict[str, Any] = {
            "type": "object",
            "required": ["score", "pass", "issues"],
            "properties": {
                "score": {"type": "number"},
                "pass": {"type": "boolean"},
                "issues": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["severity", "category", "description", "recommendation"],
                        "properties": {
                            "severity": {"type": "string"},
                            "category": {"type": "string"},
                            "description": {"type": "string"},
                            "recommendation": {"type": "string"},
                        },
                    },
                },
            },
        }

        options = GenerationOptions(
            max_tokens=4096,
            temperature=0.2,
            response_format="json",
        )

        try:
            result = await self.router.generate_structured(
                prompt=user_prompt,
                system_prompt=system_prompt,
                schema=evaluation_schema,
                options=options,
            )
        except Exception as exc:
            latency = self._elapsed_ms(start)
            return AgentResult(
                agent_id=self.agent_id,
                success=False,
                errors=[f"Quality evaluation failed: {exc}"],
                latency_ms=latency,
            )

        # Recalculate score based on issues to ensure consistency
        issues = result.get("issues", [])
        calculated_score = 100
        has_critical = False

        for issue in issues:
            severity = issue.get("severity", "minor")
            deduction = SEVERITY_SCORES.get(severity, -5)
            if severity == "critical":
                has_critical = True
                calculated_score = 0
                break
            calculated_score += deduction

        if not has_critical:
            calculated_score = max(0, calculated_score)

        # Use the stricter of LLM score and calculated score
        llm_score = result.get("score", 0)
        final_score = min(llm_score, calculated_score)
        passed = final_score >= PASS_THRESHOLD and not has_critical

        result["score"] = final_score
        result["pass"] = passed
        result["has_critical"] = has_critical

        # Categorize issues
        critical_issues = [i for i in issues if i.get("severity") == "critical"]
        major_issues = [i for i in issues if i.get("severity") == "major"]
        minor_issues = [i for i in issues if i.get("severity") == "minor"]

        latency = self._elapsed_ms(start)
        self._log_event(
            book_id,
            "quality_critic_complete",
            {
                "content_type": content_type,
                "score": final_score,
                "passed": passed,
                "critical_count": len(critical_issues),
                "major_count": len(major_issues),
                "minor_count": len(minor_issues),
            },
            quality_score=final_score,
            latency_ms=latency,
        )

        return AgentResult(
            agent_id=self.agent_id,
            success=True,
            data={
                "score": final_score,
                "pass": passed,
                "has_critical": has_critical,
                "issues": issues,
                "critical_issues": critical_issues,
                "major_issues": major_issues,
                "minor_issues": minor_issues,
            },
            quality_score=final_score,
            latency_ms=latency,
        )
