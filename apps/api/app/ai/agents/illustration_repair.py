"""
Agent A-14: Illustration Repair — Fixes anomalies without full regeneration.

Spec ref: Chapter 5.15 — Uses targeted inpainting. Identifies bounding box
of anomaly, masks it, regenerates just that area. 5x faster than regen.
Handles: hand/finger anomalies, facial inconsistencies, background artifacts,
colour bleeding.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from ..providers.base import GenerationOptions
from .base_agent import AgentResult, BaseAgent

logger = logging.getLogger("storymagic.agents.illustration_repair")

# Common anomaly types and their typical repair strategies
ANOMALY_STRATEGIES: dict[str, dict[str, Any]] = {
    "extra_fingers": {
        "typical_region": "hands",
        "repair_guidance": (
            "Regenerate hand region with correct finger count. "
            "Use the character sheet hand reference. Ensure natural "
            "finger spacing and proportions."
        ),
        "mask_padding_pct": 15,
    },
    "malformed_hands": {
        "typical_region": "hands",
        "repair_guidance": (
            "Rebuild hand structure with anatomically correct proportions. "
            "Reference the character sheet for hand style consistency."
        ),
        "mask_padding_pct": 15,
    },
    "facial_distortion": {
        "typical_region": "face",
        "repair_guidance": (
            "Regenerate face region using the character sheet front view "
            "as primary reference. Maintain the same expression and angle."
        ),
        "mask_padding_pct": 20,
    },
    "background_artifact": {
        "typical_region": "background",
        "repair_guidance": (
            "Fill the artifact region with surrounding background content. "
            "Match colours, texture, and style of adjacent areas."
        ),
        "mask_padding_pct": 10,
    },
    "color_bleeding": {
        "typical_region": "edges",
        "repair_guidance": (
            "Clean up colour boundaries between elements. Restore sharp "
            "edges consistent with the illustration style."
        ),
        "mask_padding_pct": 5,
    },
    "inconsistent_character": {
        "typical_region": "full_character",
        "repair_guidance": (
            "Regenerate the character region using character sheet as "
            "reference. Match clothing, accessories, and proportions."
        ),
        "mask_padding_pct": 10,
    },
}


class IllustrationRepairAgent(BaseAgent):
    """A-14 — Targeted inpainting repair of illustration anomalies."""

    agent_id = "illustration_repair"

    async def execute(self, **kwargs: Any) -> AgentResult:
        """
        Parameters
        ----------
        image_url : str             — URL of the problematic illustration
        problem_description : str   — what is wrong
        problem_type : str          — key from ANOMALY_STRATEGIES or freeform
        bounding_box : dict|None    — {x, y, width, height} if known, else AI-detected
        style : str                 — illustration style
        character_sheet_ref : str   — character sheet reference
        original_prompt : str       — the original illustration prompt
        book_id : str
        """
        start = time.perf_counter()
        image_url: str = kwargs["image_url"]
        problem_description: str = kwargs["problem_description"]
        problem_type: str = kwargs.get("problem_type", "general")
        bounding_box: dict[str, int] | None = kwargs.get("bounding_box")
        style: str = kwargs.get("style", "watercolor")
        character_sheet_ref: str = kwargs.get("character_sheet_ref", "")
        original_prompt: str = kwargs.get("original_prompt", "")
        book_id: str = kwargs.get("book_id", "unknown")

        strategy = ANOMALY_STRATEGIES.get(problem_type, {
            "typical_region": "general",
            "repair_guidance": "Fix the identified anomaly while preserving the surrounding content.",
            "mask_padding_pct": 10,
        })

        # If no bounding box provided, use AI to identify the region
        if bounding_box is None:
            bounding_box = await self._detect_anomaly_region(
                image_url, problem_description, problem_type
            )

        # Generate inpainting mask description
        mask_padding = strategy["mask_padding_pct"]
        padded_box = self._pad_bounding_box(bounding_box, mask_padding)

        # Build inpainting prompt
        inpaint_prompt = (
            f"Repair the following region of this children's book illustration. "
            f"Problem: {problem_description}\n\n"
            f"Style: {style}\n"
            f"Original prompt context: {original_prompt[:500]}\n"
            f"Character sheet reference: {character_sheet_ref}\n\n"
            f"Repair guidance: {strategy['repair_guidance']}\n\n"
            f"IMPORTANT: Match the surrounding style, colours, and lighting "
            f"exactly. The repaired area must blend seamlessly."
        )

        repair_instructions: dict[str, Any] = {
            "image_url": image_url,
            "inpaint_prompt": inpaint_prompt,
            "mask_region": padded_box,
            "problem_type": problem_type,
            "problem_description": problem_description,
            "style": style,
            "character_sheet_ref": character_sheet_ref,
            "repair_guidance": strategy["repair_guidance"],
            "estimated_speedup": "5x vs full regeneration",
        }

        latency = self._elapsed_ms(start)
        self._log_event(
            book_id,
            "illustration_repair_complete",
            {
                "problem_type": problem_type,
                "bounding_box": padded_box,
            },
            latency_ms=latency,
        )

        return AgentResult(
            agent_id=self.agent_id,
            success=True,
            data=repair_instructions,
            latency_ms=latency,
        )

    # ------------------------------------------------------------------
    # Region detection
    # ------------------------------------------------------------------

    async def _detect_anomaly_region(
        self,
        image_url: str,
        problem_description: str,
        problem_type: str,
    ) -> dict[str, int]:
        """Use AI to identify the bounding box of the anomaly."""
        system_prompt = (
            "You are a computer vision expert analysing children's book "
            "illustrations for anomalies. Given a description of the problem, "
            "estimate the bounding box of the affected region.\n\n"
            "Return pixel coordinates as percentages of image dimensions "
            "(0-100 scale) so they work at any resolution."
        )

        user_prompt = (
            f"Image URL: {image_url}\n"
            f"Problem type: {problem_type}\n"
            f"Problem description: {problem_description}\n\n"
            f"Return JSON with 'x', 'y', 'width', 'height' as percentages (0-100)."
        )

        bbox_schema: dict[str, Any] = {
            "type": "object",
            "required": ["x", "y", "width", "height"],
            "properties": {
                "x": {"type": "number"},
                "y": {"type": "number"},
                "width": {"type": "number"},
                "height": {"type": "number"},
            },
        }

        options = GenerationOptions(
            max_tokens=256,
            temperature=0.1,
            response_format="json",
        )

        try:
            result = await self.router.generate_structured(
                prompt=user_prompt,
                system_prompt=system_prompt,
                schema=bbox_schema,
                options=options,
            )
            return {
                "x": int(result.get("x", 25)),
                "y": int(result.get("y", 25)),
                "width": int(result.get("width", 50)),
                "height": int(result.get("height", 50)),
            }
        except Exception as exc:
            logger.warning("Anomaly detection failed, using default region: %s", exc)
            # Fallback based on problem type
            strategy = ANOMALY_STRATEGIES.get(problem_type, {})
            region = strategy.get("typical_region", "general")
            return self._default_region(region)

    @staticmethod
    def _default_region(region_type: str) -> dict[str, int]:
        """Return a default bounding box for a given region type."""
        defaults: dict[str, dict[str, int]] = {
            "hands": {"x": 20, "y": 40, "width": 25, "height": 30},
            "face": {"x": 30, "y": 10, "width": 40, "height": 35},
            "background": {"x": 0, "y": 0, "width": 100, "height": 100},
            "edges": {"x": 10, "y": 10, "width": 80, "height": 80},
            "full_character": {"x": 15, "y": 10, "width": 70, "height": 80},
            "general": {"x": 25, "y": 25, "width": 50, "height": 50},
        }
        return defaults.get(region_type, defaults["general"])

    @staticmethod
    def _pad_bounding_box(box: dict[str, int], padding_pct: int) -> dict[str, int]:
        """Add padding around a bounding box (clamped to 0-100)."""
        return {
            "x": max(0, box.get("x", 0) - padding_pct),
            "y": max(0, box.get("y", 0) - padding_pct),
            "width": min(100, box.get("width", 50) + 2 * padding_pct),
            "height": min(100, box.get("height", 50) + 2 * padding_pct),
        }
