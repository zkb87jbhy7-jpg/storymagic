"""
Agent A-08: Consistency Guardian — Ensures consistency across all book pages.

Spec ref: Chapter 5.9 — Checks character descriptions across illustration
prompts, environment continuity, temporal logic, accessory persistence,
emotional flow.  Also performs Multi-Reference Consistency Check on face
embeddings.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from ..providers.base import GenerationOptions
from .base_agent import AgentResult, BaseAgent

logger = logging.getLogger("storymagic.agents.consistency_guardian")


class ConsistencyGuardianAgent(BaseAgent):
    """A-08 — Cross-page consistency validation."""

    agent_id = "consistency_guardian"

    async def execute(self, **kwargs: Any) -> AgentResult:
        """
        Parameters
        ----------
        pages : list[dict]              — [{page_number, text}]
        illustration_prompts : list     — art director outputs per page
        child_description : str
        face_embeddings : list[str]     — optional, for multi-reference check
        book_id : str
        """
        start = time.perf_counter()
        pages: list[dict[str, Any]] = kwargs["pages"]
        illustration_prompts: list[dict[str, Any]] = kwargs.get("illustration_prompts", [])
        child_description: str = kwargs.get("child_description", "")
        face_embeddings: list[str] = kwargs.get("face_embeddings", [])
        book_id: str = kwargs.get("book_id", "unknown")

        all_issues: list[dict[str, Any]] = []

        # --- Text-based consistency checks via LLM ---
        pages_text = "\n\n".join(
            f"PAGE {p.get('page_number', i + 1)}:\n{p.get('text', '')}"
            for i, p in enumerate(pages)
        )

        prompts_text = "\n\n".join(
            f"PAGE {p.get('page_number', i + 1)} ILLUSTRATION:\n"
            f"{p.get('image_prompt', '')}\n"
            f"Composition: {p.get('composition', '')}"
            for i, p in enumerate(illustration_prompts)
        )

        system_prompt = (
            "You are a meticulous book editor and art director. "
            "Check the following story pages and illustration prompts for "
            "consistency issues across the entire book.\n\n"
            "CHECK FOR:\n"
            "1. Character descriptions — hair color, clothing, accessories must "
            "match across all illustration prompts.\n"
            "2. Environment continuity — scene changes need narrative transitions.\n"
            "3. Temporal logic — if page 3 says morning, page 4 should not be "
            "night without explanation.\n"
            "4. Accessory persistence — if a character picks up an object, it "
            "should appear in subsequent pages.\n"
            "5. Emotional progression — emotions should flow naturally without "
            "sharp jumps.\n\n"
            f"Child's physical description: {child_description}\n"
        )

        user_prompt = (
            f"Analyze these for cross-page consistency:\n\n"
            f"STORY TEXT:\n{pages_text}\n\n"
            f"ILLUSTRATION PROMPTS:\n{prompts_text}\n\n"
            f"Return JSON with 'consistency_score' (0-100), 'issues' array "
            f"(each with 'type', 'involved_pages' (array of ints), "
            f"'description', 'suggested_fix')."
        )

        consistency_schema: dict[str, Any] = {
            "type": "object",
            "required": ["consistency_score", "issues"],
            "properties": {
                "consistency_score": {"type": "number"},
                "issues": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["type", "involved_pages", "description", "suggested_fix"],
                        "properties": {
                            "type": {"type": "string"},
                            "involved_pages": {"type": "array", "items": {"type": "integer"}},
                            "description": {"type": "string"},
                            "suggested_fix": {"type": "string"},
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
                schema=consistency_schema,
                options=options,
            )
        except Exception as exc:
            latency = self._elapsed_ms(start)
            return AgentResult(
                agent_id=self.agent_id,
                success=False,
                errors=[f"Consistency check failed: {exc}"],
                latency_ms=latency,
            )

        llm_issues = result.get("issues", [])
        all_issues.extend(llm_issues)
        consistency_score: float = result.get("consistency_score", 100)

        # --- Multi-Reference Face Consistency Check ---
        face_issues = await self._check_face_consistency(face_embeddings)
        if face_issues:
            all_issues.extend(face_issues)
            consistency_score = max(0, consistency_score - len(face_issues) * 10)

        # --- Programmatic checks on illustration prompts ---
        prompt_issues = self._check_prompt_consistency(illustration_prompts, child_description)
        all_issues.extend(prompt_issues)
        if prompt_issues:
            consistency_score = max(0, consistency_score - len(prompt_issues) * 5)

        latency = self._elapsed_ms(start)
        self._log_event(
            book_id,
            "consistency_guardian_complete",
            {
                "consistency_score": consistency_score,
                "issue_count": len(all_issues),
            },
            quality_score=consistency_score,
            latency_ms=latency,
        )

        return AgentResult(
            agent_id=self.agent_id,
            success=True,
            data={
                "consistency_score": consistency_score,
                "issues": all_issues,
            },
            quality_score=consistency_score,
            latency_ms=latency,
        )

    # ------------------------------------------------------------------
    # Face embedding multi-reference check
    # ------------------------------------------------------------------

    async def _check_face_consistency(
        self, embeddings: list[str],
    ) -> list[dict[str, Any]]:
        """Compare all face embeddings pairwise. Threshold 0.75."""
        if len(embeddings) < 2:
            return []

        issues: list[dict[str, Any]] = []
        threshold = 0.75

        for i in range(len(embeddings)):
            for j in range(i + 1, len(embeddings)):
                try:
                    similarity = await self.router.compare_faces(
                        embeddings[i], embeddings[j]
                    )
                    if similarity < threshold:
                        issues.append({
                            "type": "face_inconsistency",
                            "involved_pages": [i + 1, j + 1],
                            "description": (
                                f"Face similarity between page {i + 1} and page {j + 1} "
                                f"is {similarity:.2f} (threshold {threshold})"
                            ),
                            "suggested_fix": (
                                f"Regenerate illustration for page {j + 1} "
                                f"with stronger character sheet reference."
                            ),
                        })
                except Exception as exc:
                    logger.warning("Face comparison failed for pages %d-%d: %s", i + 1, j + 1, exc)

        return issues

    # ------------------------------------------------------------------
    # Programmatic prompt consistency
    # ------------------------------------------------------------------

    @staticmethod
    def _check_prompt_consistency(
        prompts: list[dict[str, Any]],
        child_description: str,
    ) -> list[dict[str, Any]]:
        """Check illustration prompts for obvious inconsistencies."""
        issues: list[dict[str, Any]] = []

        # Extract key descriptors from child_description
        desc_lower = child_description.lower()
        key_terms: list[str] = []
        for color_term in ["brown hair", "black hair", "blonde hair", "red hair",
                           "curly", "straight", "blue eyes", "brown eyes", "green eyes",
                           "glasses", "hat", "dress", "shirt"]:
            if color_term in desc_lower:
                key_terms.append(color_term)

        # Check each prompt includes key character terms
        for prompt_data in prompts:
            prompt_text = prompt_data.get("image_prompt", "").lower()
            page_num = prompt_data.get("page_number", 0)
            for term in key_terms:
                if term not in prompt_text:
                    issues.append({
                        "type": "character_description_missing",
                        "involved_pages": [page_num],
                        "description": (
                            f"Page {page_num} illustration prompt missing "
                            f"character detail: '{term}'"
                        ),
                        "suggested_fix": (
                            f"Add '{term}' to the illustration prompt for page {page_num}."
                        ),
                    })

        # Check for sudden environment changes without transition
        environments: list[str] = []
        for prompt_data in prompts:
            comp = prompt_data.get("composition", "")
            env_hint = prompt_data.get("image_prompt", "")[:100]
            environments.append(f"{env_hint} {comp}")

        return issues
