"""
Agent A-13: Narration Director — Produces Performance Markup for narration.

Spec ref: Chapter 5.14 — AI-driven context understanding (not keyword matching).
Speaker assignment, emotion (10 types), pace, pauses, emphasized words,
sound effects from 30-effect library (Appendix B).
"""

from __future__ import annotations

import logging
import time
from typing import Any

from ..providers.base import GenerationOptions
from .base_agent import AgentResult, BaseAgent

logger = logging.getLogger("storymagic.agents.narration_director")

# Sound effects library — Appendix B (30 effects)
SOUND_EFFECTS_LIBRARY: dict[str, dict[str, Any]] = {
    "door": {"file": "door_creak", "duration_s": 1.2},
    "water": {"file": "splash", "duration_s": 0.8},
    "sea": {"file": "splash", "duration_s": 0.8},
    "ocean": {"file": "splash", "duration_s": 0.8},
    "wind": {"file": "wind_howl", "duration_s": 2.0},
    "bird": {"file": "bird_chirp", "duration_s": 0.5},
    "magic": {"file": "magic_sparkle", "duration_s": 1.0},
    "spell": {"file": "magic_sparkle", "duration_s": 1.0},
    "wand": {"file": "magic_sparkle", "duration_s": 1.0},
    "thunder": {"file": "thunder_rumble", "duration_s": 1.5},
    "storm": {"file": "thunder_rumble", "duration_s": 1.5},
    "laugh": {"file": "children_laugh", "duration_s": 1.0},
    "footsteps": {"file": "soft_footsteps", "duration_s": 0.6},
    "bells": {"file": "gentle_bells", "duration_s": 1.2},
    "rain": {"file": "rain_drops", "duration_s": 2.0},
    "cat": {"file": "cat_meow", "duration_s": 0.4},
    "dog": {"file": "dog_bark", "duration_s": 0.3},
    "horse": {"file": "horse_gallop", "duration_s": 1.5},
    "dragon": {"file": "dragon_roar_gentle", "duration_s": 1.0},
    "fairy": {"file": "fairy_sparkle", "duration_s": 0.8},
    "rocket": {"file": "rocket_launch", "duration_s": 1.5},
    "splash": {"file": "water_splash", "duration_s": 0.6},
    "knock": {"file": "door_knock", "duration_s": 0.5},
    "owl": {"file": "owl_hoot", "duration_s": 0.8},
    "frog": {"file": "frog_croak", "duration_s": 0.3},
    "rooster": {"file": "rooster_crow", "duration_s": 1.0},
    "clock": {"file": "clock_tick", "duration_s": 0.4},
    "whistle": {"file": "whistle_blow", "duration_s": 0.6},
    "trumpet": {"file": "trumpet_fanfare", "duration_s": 1.2},
    "drum": {"file": "drum_roll", "duration_s": 1.5},
    "guitar": {"file": "guitar_strum", "duration_s": 0.8},
    "piano": {"file": "piano_chord", "duration_s": 1.0},
    "harp": {"file": "harp_glissando", "duration_s": 1.5},
    "flute": {"file": "flute_melody", "duration_s": 2.0},
    "yawn": {"file": "sleepy_yawn", "duration_s": 1.0},
}

# Valid emotions for performance markup
VALID_EMOTIONS = frozenset({
    "happy", "scared", "whispering", "shouting", "singing",
    "brave", "gentle", "sad", "excited", "curious",
})


class NarrationDirectorAgent(BaseAgent):
    """A-13 — Generates complete Performance Markup for narration."""

    agent_id = "narration_director"

    async def execute(self, **kwargs: Any) -> AgentResult:
        """
        Parameters
        ----------
        pages : list[dict]          — [{page_number, text}]
        style : str                 — book style (affects narration tone)
        character_profiles : list   — [{name, vocal_characteristics}]
        book_id : str
        """
        start = time.perf_counter()
        pages: list[dict[str, Any]] = kwargs["pages"]
        style: str = kwargs.get("style", "classic_storybook")
        character_profiles: list[dict[str, Any]] = kwargs.get("character_profiles", [])
        book_id: str = kwargs.get("book_id", "unknown")

        # Build sound effects reference for the LLM
        sfx_reference = "\n".join(
            f"- '{keyword}' -> {info['file']} ({info['duration_s']}s)"
            for keyword, info in SOUND_EFFECTS_LIBRARY.items()
        )

        characters_text = "\n".join(
            f"- {cp.get('name', 'Unknown')}: {cp.get('vocal_characteristics', 'neutral')}"
            for cp in character_profiles
        ) or "- Narrator: warm, clear adult voice"

        pages_text = "\n\n".join(
            f"PAGE {p.get('page_number', i + 1)}:\n{p.get('text', '')}"
            for i, p in enumerate(pages)
        )

        system_prompt = (
            "You are an artistic narration director for audiobooks. "
            "Create Performance Markup for each segment of text that "
            "defines how the narration should be performed.\n\n"
            "IMPORTANT: Use AI understanding of context — 'he whispered' is "
            "not always a gentle whisper; it might be tense or frightened.\n\n"
            "For each text segment, specify:\n"
            "- speaker: who is speaking (Narrator or character name)\n"
            "- emotion: one of: happy, scared, whispering, shouting, singing, "
            "brave, gentle, sad, excited, curious\n"
            "- pace: slow, normal, or fast\n"
            "- pause_before: seconds of silence before this segment\n"
            "- pause_after: seconds of silence after this segment\n"
            "- emphasized_words: array of word indices (0-based) to emphasize\n"
            "- sound_effect: a sound effect to play during/after this segment, "
            "or null. Choose from the library below.\n\n"
            f"Available sound effects:\n{sfx_reference}\n\n"
            f"Character voices:\n{characters_text}\n\n"
            f"Book style: {style}\n\n"
            "Assign distinct vocal characteristics to each character and keep "
            "them consistent throughout. Mark dramatic pauses, crescendos, "
            "and decrescendos.\n"
        )

        user_prompt = (
            f"Generate Performance Markup for the entire book:\n\n"
            f"{pages_text}\n\n"
            f"Return JSON with 'pages' array, each containing:\n"
            f"- 'page_number'\n"
            f"- 'segments': array of markup objects, each with 'text', "
            f"'speaker', 'emotion', 'pace', 'pause_before', 'pause_after', "
            f"'emphasized_words' (array of integers), "
            f"'sound_effect' (string or null)"
        )

        markup_schema: dict[str, Any] = {
            "type": "object",
            "required": ["pages"],
            "properties": {
                "pages": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["page_number", "segments"],
                        "properties": {
                            "page_number": {"type": "integer"},
                            "segments": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "required": [
                                        "text", "speaker", "emotion", "pace",
                                        "pause_before", "pause_after",
                                    ],
                                    "properties": {
                                        "text": {"type": "string"},
                                        "speaker": {"type": "string"},
                                        "emotion": {"type": "string"},
                                        "pace": {"type": "string"},
                                        "pause_before": {"type": "number"},
                                        "pause_after": {"type": "number"},
                                        "emphasized_words": {
                                            "type": "array",
                                            "items": {"type": "integer"},
                                        },
                                        "sound_effect": {"type": "string"},
                                    },
                                },
                            },
                        },
                    },
                }
            },
        }

        options = GenerationOptions(
            max_tokens=8192,
            temperature=0.6,
            response_format="json",
        )

        try:
            result = await self.router.generate_structured(
                prompt=user_prompt,
                system_prompt=system_prompt,
                schema=markup_schema,
                options=options,
            )
        except Exception as exc:
            latency = self._elapsed_ms(start)
            return AgentResult(
                agent_id=self.agent_id,
                success=False,
                errors=[f"Narration markup generation failed: {exc}"],
                latency_ms=latency,
            )

        markup_pages = result.get("pages", [])
        warnings: list[str] = []

        # Validate and normalise
        for page in markup_pages:
            for segment in page.get("segments", []):
                # Validate emotion
                emotion = segment.get("emotion", "")
                if emotion not in VALID_EMOTIONS:
                    closest = self._closest_emotion(emotion)
                    warnings.append(
                        f"Page {page.get('page_number', '?')}: "
                        f"unknown emotion '{emotion}', mapped to '{closest}'"
                    )
                    segment["emotion"] = closest

                # Validate sound effect against library
                sfx = segment.get("sound_effect")
                if sfx and sfx not in SOUND_EFFECTS_LIBRARY:
                    # Try to find a match
                    matched = self._match_sound_effect(sfx)
                    if matched:
                        segment["sound_effect"] = matched
                    else:
                        warnings.append(
                            f"Page {page.get('page_number', '?')}: "
                            f"unknown sound effect '{sfx}', removed"
                        )
                        segment["sound_effect"] = None

                # Enrich sound effect with file info
                if segment.get("sound_effect") and segment["sound_effect"] in SOUND_EFFECTS_LIBRARY:
                    sfx_info = SOUND_EFFECTS_LIBRARY[segment["sound_effect"]]
                    segment["sound_effect_file"] = sfx_info["file"]
                    segment["sound_effect_duration"] = sfx_info["duration_s"]

                # Validate pace
                if segment.get("pace") not in ("slow", "normal", "fast"):
                    segment["pace"] = "normal"

        latency = self._elapsed_ms(start)
        self._log_event(
            book_id,
            "narration_director_complete",
            {
                "page_count": len(markup_pages),
                "total_segments": sum(
                    len(p.get("segments", [])) for p in markup_pages
                ),
            },
            latency_ms=latency,
        )

        return AgentResult(
            agent_id=self.agent_id,
            success=True,
            data={"pages": markup_pages},
            warnings=warnings,
            latency_ms=latency,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _closest_emotion(emotion: str) -> str:
        """Map an unknown emotion string to the closest valid one."""
        mappings: dict[str, str] = {
            "joy": "happy",
            "fear": "scared",
            "anger": "shouting",
            "surprise": "excited",
            "calm": "gentle",
            "warmth": "gentle",
            "tension": "scared",
            "triumph": "brave",
            "courage": "brave",
            "love": "gentle",
            "whisper": "whispering",
            "shout": "shouting",
            "sing": "singing",
        }
        return mappings.get(emotion.lower(), "gentle")

    @staticmethod
    def _match_sound_effect(sfx: str) -> str | None:
        """Try to match a sound effect name to a library entry."""
        sfx_lower = sfx.lower()
        for keyword in SOUND_EFFECTS_LIBRARY:
            if keyword in sfx_lower or sfx_lower in keyword:
                return keyword
        return None
