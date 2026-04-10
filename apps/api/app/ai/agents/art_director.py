"""
Agent A-04: Art Director — Creates detailed illustration prompts for every page.

Spec ref: Chapter 5.5 — Each style has 5+ visual keywords, emotion influences
colour/composition, character sheet referenced, negative prompt always present.
"""

from __future__ import annotations

import logging
import time
from typing import Any

from ..providers.base import GenerationOptions
from .base_agent import AgentResult, BaseAgent

logger = logging.getLogger("storymagic.agents.art_director")

# ---------------------------------------------------------------------------
# Style visual directives  (Spec Appendix C)
# ---------------------------------------------------------------------------

STYLE_DIRECTIVES: dict[str, dict[str, Any]] = {
    "watercolor": {
        "keywords": [
            "soft edges", "visible brush strokes", "muted color bleeding",
            "paper texture", "gentle lighting", "pastel palette", "organic shapes",
        ],
        "mood": "gentle, warm, dreamy",
    },
    "comic_book": {
        "keywords": [
            "bold outlines", "flat colors", "dynamic angles",
            "action lines", "speech bubbles", "high contrast", "cel shading",
        ],
        "mood": "energetic, bold, action-packed",
    },
    "pixar_3d": {
        "keywords": [
            "subsurface scattering on skin", "rounded features",
            "large expressive eyes", "volumetric lighting",
            "soft shadows", "warm color grading",
        ],
        "mood": "playful, polished, cinematic",
    },
    "retro_vintage": {
        "keywords": [
            "muted earth tones", "grainy texture", "halftone dots",
            "limited color palette", "mid-century illustration style",
        ],
        "mood": "nostalgic, classic, timeless",
    },
    "minimalist": {
        "keywords": [
            "clean lines", "limited color palette", "negative space",
            "geometric shapes", "subtle textures",
        ],
        "mood": "calm, modern, focused",
    },
    "oil_painting": {
        "keywords": [
            "rich color depth", "visible brush strokes", "chiaroscuro lighting",
            "textured surface", "classical composition",
        ],
        "mood": "dramatic, emotional, rich",
    },
    "fantasy": {
        "keywords": [
            "ethereal glow", "magical particles", "rich saturated colors",
            "dramatic lighting", "intricate details",
        ],
        "mood": "magical, wondrous, enchanting",
    },
    "manga": {
        "keywords": [
            "large eyes", "simplified features", "dynamic poses",
            "speed lines", "expressive emotions", "clean outlines",
        ],
        "mood": "expressive, dynamic, emotional",
    },
    "classic_storybook": {
        "keywords": [
            "warm watercolors", "detailed backgrounds", "gentle characters",
            "golden hour lighting", "traditional composition",
        ],
        "mood": "warm, inviting, traditional",
    },
    "whimsical": {
        "keywords": [
            "exaggerated proportions", "playful colors", "swirling patterns",
            "dotted textures", "hand-drawn feel",
        ],
        "mood": "playful, joyful, imaginative",
    },
}

# Emotion-to-visual mapping
EMOTION_VISUALS: dict[str, dict[str, str]] = {
    "joy": {
        "colors": "warm colors, high saturation, golden tones",
        "composition": "upward compositions, open space, expansive framing",
        "lighting": "golden lighting, bright and airy",
    },
    "curiosity": {
        "colors": "cool-warm blend, moderate saturation, teals and golds",
        "composition": "leading lines, depth perspective, discovery framing",
        "lighting": "dappled light, soft directional",
    },
    "tension": {
        "colors": "cooler colors, reduced saturation, deep blues",
        "composition": "diagonal compositions, tight framing",
        "lighting": "dramatic shadows, side lighting",
    },
    "fear": {
        "colors": "dark palette, muted tones, deep purples",
        "composition": "low angle, enclosed framing, looming elements",
        "lighting": "dim lighting, strong shadows, back-lit subjects",
    },
    "courage": {
        "colors": "bold primaries, strong contrast, reds and golds",
        "composition": "heroic low-angle, centered subject, dynamic pose",
        "lighting": "rim lighting, dramatic back-light",
    },
    "triumph": {
        "colors": "vivid palette, full saturation, gold highlights",
        "composition": "expansive wide shot, subject elevated, arms raised",
        "lighting": "bright from above, lens flare, radiant",
    },
    "warmth": {
        "colors": "warm amber, soft pastels, honey tones",
        "composition": "close framing, embrace composition, intimate",
        "lighting": "soft diffused lighting, warm glow, firelight",
    },
    "calm": {
        "colors": "pastel colors, low contrast, soft blues and greens",
        "composition": "horizontal compositions, balanced symmetry",
        "lighting": "soft diffused lighting, even, gentle",
    },
    "sadness": {
        "colors": "desaturated blues and grays, muted tones",
        "composition": "isolated subject, negative space, downward gaze",
        "lighting": "overcast, flat diffused, cool temperature",
    },
    "surprise": {
        "colors": "bright contrasts, unexpected color pops",
        "composition": "off-center subject, Dutch angle, wide eyes",
        "lighting": "spot-light effect, dramatic reveal",
    },
}

NEGATIVE_PROMPT_BASE = (
    "extra fingers, malformed hands, blurry face, inconsistent character design, "
    "text, watermark, adult content, deformed, disfigured, mutation, "
    "extra limbs, duplicate, morbid, gross, ugly, poorly drawn face, "
    "bad anatomy, wrong anatomy, extra legs, missing arms"
)


class ArtDirectorAgent(BaseAgent):
    """A-04 — Generates detailed illustration prompts for each page."""

    agent_id = "art_director"

    async def execute(self, **kwargs: Any) -> AgentResult:
        """
        Parameters
        ----------
        scene : dict                — single scene from blueprint
        style : str                 — illustration style key
        child_description : str     — physical appearance description
        emotion : str               — dominant emotion for this page
        previous_prompts : list     — prompts from previous pages (for consistency)
        character_sheet_ref : str   — reference to the character sheet
        book_id : str
        """
        start = time.perf_counter()
        scene: dict[str, Any] = kwargs["scene"]
        style: str = kwargs.get("style", "watercolor")
        child_description: str = kwargs.get("child_description", "")
        emotion: str = kwargs.get("emotion", "joy")
        previous_prompts: list[dict[str, Any]] = kwargs.get("previous_prompts", [])
        character_sheet_ref: str = kwargs.get("character_sheet_ref", "")
        book_id: str = kwargs.get("book_id", "unknown")

        style_info = STYLE_DIRECTIVES.get(style, STYLE_DIRECTIVES["watercolor"])
        emotion_info = EMOTION_VISUALS.get(emotion, EMOTION_VISUALS["joy"])

        system_template = self._load_prompt("art_director_v1")
        system_prompt = self._substitute_variables(
            system_template,
            {
                "style": style,
                "style_keywords": ", ".join(style_info["keywords"]),
                "style_mood": style_info["mood"],
                "emotion": emotion,
                "emotion_colors": emotion_info["colors"],
                "emotion_composition": emotion_info["composition"],
                "emotion_lighting": emotion_info["lighting"],
            },
        )

        previous_context = ""
        if previous_prompts:
            prev_summaries = [
                f"Page {p.get('page_number', '?')}: {p.get('image_prompt', '')[:200]}"
                for p in previous_prompts[-3:]
            ]
            previous_context = "Previous page prompts:\n" + "\n".join(prev_summaries)

        user_prompt = (
            f"Create a detailed illustration prompt for this page.\n\n"
            f"Scene: {scene.get('environment', '')} — {scene.get('action', '')}\n"
            f"Illustration hint: {scene.get('illustration_hint', '')}\n"
            f"Emotion: {emotion}\n"
            f"Child description: {child_description}\n"
            f"Character sheet reference: {character_sheet_ref}\n\n"
            f"{previous_context}\n\n"
            f"Return JSON with: 'image_prompt', 'negative_prompt', "
            f"'composition', 'color_palette' (array), 'camera_angle'."
        )

        prompt_schema: dict[str, Any] = {
            "type": "object",
            "required": [
                "image_prompt", "negative_prompt", "composition",
                "color_palette", "camera_angle",
            ],
            "properties": {
                "image_prompt": {"type": "string"},
                "negative_prompt": {"type": "string"},
                "composition": {"type": "string"},
                "color_palette": {"type": "array", "items": {"type": "string"}},
                "camera_angle": {"type": "string"},
            },
        }

        options = GenerationOptions(
            max_tokens=2048,
            temperature=0.7,
            response_format="json",
        )

        try:
            result = await self.router.generate_structured(
                prompt=user_prompt,
                system_prompt=system_prompt,
                schema=prompt_schema,
                options=options,
            )
        except Exception as exc:
            latency = self._elapsed_ms(start)
            return AgentResult(
                agent_id=self.agent_id,
                success=False,
                errors=[f"Art direction generation failed: {exc}"],
                latency_ms=latency,
            )

        # Ensure negative prompt includes base items
        neg = result.get("negative_prompt", "")
        if "extra fingers" not in neg:
            result["negative_prompt"] = f"{NEGATIVE_PROMPT_BASE}, {neg}" if neg else NEGATIVE_PROMPT_BASE

        # Inject style keywords into image prompt if missing
        image_prompt = result.get("image_prompt", "")
        for kw in style_info["keywords"][:3]:
            if kw.lower() not in image_prompt.lower():
                image_prompt = f"{image_prompt}, {kw}"
        result["image_prompt"] = image_prompt

        # Add page metadata
        result["page_number"] = scene.get("page_number", 0)
        result["style"] = style
        result["emotion"] = emotion

        latency = self._elapsed_ms(start)
        self._log_event(
            book_id,
            "art_director_complete",
            {"page_number": scene.get("page_number", 0), "style": style},
            latency_ms=latency,
        )

        return AgentResult(
            agent_id=self.agent_id,
            success=True,
            data=result,
            latency_ms=latency,
        )
