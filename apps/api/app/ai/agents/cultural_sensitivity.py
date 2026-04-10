"""
Agent A-10: Cultural Sensitivity — Checks content against cultural and
religious norms.

Spec ref: Chapter 5.11 — Checks food/dietary, clothing/modesty, holidays,
family structure, pronouns, stereotypes.  Does NOT block; presents warnings.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from ..providers.base import GenerationOptions
from .base_agent import AgentResult, BaseAgent

logger = logging.getLogger("storymagic.agents.cultural_sensitivity")

# Known dietary categories
DIETARY_CATEGORIES = ["kosher", "halal", "vegetarian", "vegan", "none"]

# Holiday mapping — holidays inappropriate for certain backgrounds
HOLIDAY_CONFLICTS: dict[str, list[str]] = {
    "jewish": ["christmas", "easter", "ramadan", "eid"],
    "muslim": ["christmas", "easter", "hanukkah", "passover", "purim"],
    "christian": ["hanukkah", "passover", "purim", "ramadan", "eid"],
    "secular": [],
}


class CulturalSensitivityAgent(BaseAgent):
    """A-10 — Cultural and religious sensitivity checks."""

    agent_id = "cultural_sensitivity"

    async def execute(self, **kwargs: Any) -> AgentResult:
        """
        Parameters
        ----------
        pages : list[dict]          — page texts
        illustration_prompts : list — art director outputs
        cultural_prefs : dict       — {religion, dietary, modesty_level, family_structure, pronouns}
        language : str
        book_id : str
        """
        start = time.perf_counter()
        pages: list[dict[str, Any]] = kwargs["pages"]
        illustration_prompts: list[dict[str, Any]] = kwargs.get("illustration_prompts", [])
        cultural_prefs: dict[str, Any] = kwargs.get("cultural_prefs", {})
        language: str = kwargs.get("language", "he")
        book_id: str = kwargs.get("book_id", "unknown")

        religion = cultural_prefs.get("religion", "secular")
        dietary = cultural_prefs.get("dietary", "none")
        modesty_level = cultural_prefs.get("modesty_level", "standard")
        family_structure = cultural_prefs.get("family_structure", "two_parents")
        preferred_pronouns = cultural_prefs.get("pronouns", "")

        # Combine all text for analysis
        all_text = "\n".join(p.get("text", "") for p in pages)
        all_prompts = "\n".join(p.get("image_prompt", "") for p in illustration_prompts)

        system_prompt = (
            "You are a cultural sensitivity reviewer for children's books. "
            "Analyze the following story text and illustration prompts for "
            "cultural and religious sensitivity issues.\n\n"
            f"Cultural preferences:\n"
            f"- Religion: {religion}\n"
            f"- Dietary restrictions: {dietary}\n"
            f"- Modesty level: {modesty_level}\n"
            f"- Family structure: {family_structure}\n"
            f"- Preferred pronouns: {preferred_pronouns}\n\n"
            "CHECK FOR:\n"
            "1. Food references that conflict with dietary restrictions\n"
            "2. Clothing/imagery that conflicts with modesty requirements\n"
            "3. Holiday references inappropriate for the child's background\n"
            "4. Family structure assumptions (e.g., 'mom and dad' for single-parent)\n"
            "5. Gender pronoun usage matching preferences\n"
            "6. Cultural stereotypes\n\n"
            "IMPORTANT: Do NOT block content. Present warnings with options "
            "to 'keep as is' or 'change it'.\n"
        )

        user_prompt = (
            f"Analyze this content:\n\n"
            f"STORY TEXT:\n{all_text}\n\n"
            f"ILLUSTRATION PROMPTS:\n{all_prompts}\n\n"
            f"Return JSON with:\n"
            f"- 'approved': boolean (true if no issues found)\n"
            f"- 'warnings': array of objects with 'category', 'page_number', "
            f"'description', 'current_content', 'suggested_alternative'\n"
            f"- 'suggestions': array of general improvement suggestions"
        )

        sensitivity_schema: dict[str, Any] = {
            "type": "object",
            "required": ["approved", "warnings", "suggestions"],
            "properties": {
                "approved": {"type": "boolean"},
                "warnings": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["category", "description"],
                        "properties": {
                            "category": {"type": "string"},
                            "page_number": {"type": "integer"},
                            "description": {"type": "string"},
                            "current_content": {"type": "string"},
                            "suggested_alternative": {"type": "string"},
                        },
                    },
                },
                "suggestions": {"type": "array", "items": {"type": "string"}},
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
                schema=sensitivity_schema,
                options=options,
            )
        except Exception as exc:
            latency = self._elapsed_ms(start)
            return AgentResult(
                agent_id=self.agent_id,
                success=False,
                errors=[f"Cultural sensitivity check failed: {exc}"],
                latency_ms=latency,
            )

        # Augment with programmatic holiday conflict checks
        llm_warnings = result.get("warnings", [])
        programmatic_warnings = self._check_holiday_conflicts(
            all_text, religion
        )
        programmatic_warnings.extend(
            self._check_family_structure(all_text, family_structure)
        )
        programmatic_warnings.extend(
            self._check_dietary_references(all_text, dietary)
        )

        # Merge, dedup by description
        seen_descriptions: set[str] = {w.get("description", "") for w in llm_warnings}
        for pw in programmatic_warnings:
            if pw["description"] not in seen_descriptions:
                llm_warnings.append(pw)
                seen_descriptions.add(pw["description"])

        result["warnings"] = llm_warnings
        if llm_warnings:
            result["approved"] = False

        latency = self._elapsed_ms(start)
        self._log_event(
            book_id,
            "cultural_sensitivity_complete",
            {
                "approved": result.get("approved", True),
                "warning_count": len(llm_warnings),
            },
            latency_ms=latency,
        )

        return AgentResult(
            agent_id=self.agent_id,
            success=True,
            data=result,
            latency_ms=latency,
        )

    # ------------------------------------------------------------------
    # Programmatic checks
    # ------------------------------------------------------------------

    @staticmethod
    def _check_holiday_conflicts(text: str, religion: str) -> list[dict[str, Any]]:
        conflicts = HOLIDAY_CONFLICTS.get(religion, [])
        warnings: list[dict[str, Any]] = []
        text_lower = text.lower()
        for holiday in conflicts:
            if holiday in text_lower:
                warnings.append({
                    "category": "holiday_conflict",
                    "description": (
                        f"Holiday '{holiday}' may be inappropriate for "
                        f"a child from a {religion} background."
                    ),
                    "current_content": holiday,
                    "suggested_alternative": (
                        f"Consider replacing with a culturally appropriate "
                        f"holiday or using a generic celebration."
                    ),
                })
        return warnings

    @staticmethod
    def _check_family_structure(text: str, structure: str) -> list[dict[str, Any]]:
        warnings: list[dict[str, Any]] = []
        text_lower = text.lower()

        two_parent_terms = ["mom and dad", "mommy and daddy", "mother and father",
                           "אמא ואבא", "הורים"]
        single_parent_terms_en = ["parents", "mom and dad", "mommy and daddy"]

        if structure == "single_parent":
            for term in two_parent_terms:
                if term in text_lower:
                    warnings.append({
                        "category": "family_structure",
                        "description": (
                            f"Reference to '{term}' may not match the child's "
                            f"single-parent family structure."
                        ),
                        "current_content": term,
                        "suggested_alternative": (
                            "Consider using 'parent', 'family', or the "
                            "specific parent term."
                        ),
                    })

        if structure == "same_sex_parents":
            for term in ["mom and dad", "אמא ואבא", "mother and father"]:
                if term in text_lower:
                    warnings.append({
                        "category": "family_structure",
                        "description": (
                            f"Reference to '{term}' assumes heteronormative "
                            f"family structure."
                        ),
                        "current_content": term,
                        "suggested_alternative": "Use 'parents' or specific names.",
                    })

        return warnings

    @staticmethod
    def _check_dietary_references(text: str, dietary: str) -> list[dict[str, Any]]:
        warnings: list[dict[str, Any]] = []
        text_lower = text.lower()

        if dietary == "kosher" or dietary == "halal":
            pork_terms = ["pork", "bacon", "ham", "pig", "חזיר", "בייקון"]
            for term in pork_terms:
                if term in text_lower:
                    warnings.append({
                        "category": "dietary_conflict",
                        "description": (
                            f"Food reference '{term}' conflicts with "
                            f"{dietary} dietary restrictions."
                        ),
                        "current_content": term,
                        "suggested_alternative": (
                            "Replace with a permissible food alternative."
                        ),
                    })

        if dietary == "vegetarian" or dietary == "vegan":
            meat_terms = ["steak", "chicken", "meat", "burger", "fish",
                          "בשר", "עוף", "דג"]
            for term in meat_terms:
                if term in text_lower:
                    warnings.append({
                        "category": "dietary_conflict",
                        "description": (
                            f"Food reference '{term}' conflicts with "
                            f"{dietary} dietary preference."
                        ),
                        "current_content": term,
                        "suggested_alternative": (
                            "Replace with a plant-based food alternative."
                        ),
                    })

        return warnings
