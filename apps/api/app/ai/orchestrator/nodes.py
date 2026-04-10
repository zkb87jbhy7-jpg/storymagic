"""Graph node functions for the LangGraph book generation pipeline.

Spec ref: Ch5.17 — Each node wraps one agent call, reads from state, and writes
results back.  Progress percentage is updated per the phase ranges defined in
the spec (Phase 1 = 0-5%, Phase 2 = 5-20%, etc.).

Every node follows the same contract:
    async def node_name(state: BookGenerationState) -> dict:
        # ... call the agent / service ...
        return {updated_keys}

LangGraph merges the returned dict into the graph state automatically.
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any

from app.ai.orchestrator.state import BookGenerationState
from app.ai.providers.base import (
    GenerationOptions,
    ImageGenerationOptions,
    VoiceGenerationOptions,
)
from app.ai.providers.registry import ProviderRegistry
from app.ai.providers.router import AIRouter
from app.config import get_settings

logger = logging.getLogger("storymagic.orchestrator.nodes")


def _get_router() -> AIRouter:
    """Obtain a singleton AIRouter instance from the provider registry."""
    registry = ProviderRegistry()
    return AIRouter(registry)


def _bump_retry(state: BookGenerationState, key: str) -> dict[str, int]:
    """Increment a retry counter and return the updated retry_counts dict."""
    counts = dict(state.get("retry_counts", {}))
    counts[key] = counts.get(key, 0) + 1
    return counts


def _append_error(state: BookGenerationState, phase: str, msg: str) -> list[dict[str, Any]]:
    """Append an error entry and return the updated errors list."""
    errors = list(state.get("errors", []))
    errors.append({"phase": phase, "message": msg, "timestamp": time.time()})
    return errors


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Phase 1 (0–5%): Story Architect
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


async def generate_blueprint(state: BookGenerationState) -> dict[str, Any]:
    """Phase 1: Story Architect Agent creates the blueprint.

    Reads child_name, child_age, prompt, mood, page_count, language, is_rhyming.
    Writes blueprint dict with title, theme, arc, page_scenes.
    """
    logger.info("Phase 1: Generating blueprint for book_id=%s", state.get("book_id"))
    router = _get_router()

    system_prompt = (
        "You are the Story Architect Agent. Given a child's profile and story prompt, "
        "create a detailed story blueprint in JSON with keys: title, theme, moral, "
        "narrative_arc (exposition, rising_action, climax, falling_action, resolution), "
        "page_scenes (list of {page_number, scene_description, emotional_beat, "
        "key_elements, illustration_hint}). "
        f"Target audience: age {state.get('child_age', 4)}. "
        f"Page count: {state.get('page_count', 12)}. "
        f"Language: {state.get('language', 'he')}. "
        f"Mood: {state.get('mood', 'adventurous')}. "
        f"Rhyming: {state.get('is_rhyming', False)}."
    )

    user_prompt = (
        f"Child's name: {state.get('child_name', 'Child')}\n"
        f"Child's age: {state.get('child_age', 4)}\n"
        f"Child's gender: {state.get('child_gender', 'neutral')}\n"
        f"Story prompt: {state.get('prompt', 'A magical adventure')}\n"
        f"Style: {state.get('style', 'watercolor')}\n"
        "Create a complete story blueprint."
    )

    schema = {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "theme": {"type": "string"},
            "moral": {"type": "string"},
            "narrative_arc": {
                "type": "object",
                "properties": {
                    "exposition": {"type": "string"},
                    "rising_action": {"type": "string"},
                    "climax": {"type": "string"},
                    "falling_action": {"type": "string"},
                    "resolution": {"type": "string"},
                },
            },
            "page_scenes": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "page_number": {"type": "integer"},
                        "scene_description": {"type": "string"},
                        "emotional_beat": {"type": "string"},
                        "key_elements": {"type": "array", "items": {"type": "string"}},
                        "illustration_hint": {"type": "string"},
                    },
                },
            },
        },
        "required": ["title", "theme", "moral", "narrative_arc", "page_scenes"],
    }

    try:
        blueprint = await router.generate_structured(
            user_prompt,
            system_prompt,
            schema,
            GenerationOptions(max_tokens=4096, temperature=0.8),
        )
    except Exception as exc:
        logger.error("Blueprint generation failed: %s", exc)
        return {
            "errors": _append_error(state, "generate_blueprint", str(exc)),
            "current_phase": "generate_blueprint",
            "progress_percent": 0.0,
        }

    return {
        "blueprint": blueprint,
        "current_phase": "generate_blueprint",
        "progress_percent": 5.0,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Phase 2 (5–20%): Text + Illustration Prompts + Character Sheet (parallel)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


async def write_text(state: BookGenerationState) -> dict[str, Any]:
    """Phase 2a: Hebrew Poet Agent writes the story text for all pages.

    Uses the blueprint's page_scenes to produce one text block per page,
    respecting language, rhyming mode, and age-appropriate vocabulary.
    """
    logger.info("Phase 2a: Writing text for book_id=%s", state.get("book_id"))
    router = _get_router()
    blueprint = state.get("blueprint", {})
    page_scenes = blueprint.get("page_scenes", [])

    system_prompt = (
        "You are the Hebrew Poet Agent. Write children's story text for each page. "
        f"Language: {state.get('language', 'he')}. "
        f"Rhyming: {state.get('is_rhyming', False)}. "
        f"Age: {state.get('child_age', 4)}. "
        f"Child's name: {state.get('child_name', 'Child')}. "
        "Return a JSON array of strings, one text per page. "
        "Each text should be age-appropriate, engaging, and match the scene description."
    )

    scenes_text = "\n".join(
        f"Page {s.get('page_number', i+1)}: {s.get('scene_description', '')}"
        for i, s in enumerate(page_scenes)
    )
    user_prompt = f"Story title: {blueprint.get('title', '')}\nTheme: {blueprint.get('theme', '')}\n\nScenes:\n{scenes_text}"

    try:
        result = await router.generate_structured(
            user_prompt,
            system_prompt,
            {"type": "array", "items": {"type": "string"}},
            GenerationOptions(max_tokens=8192, temperature=0.7),
        )
        page_texts = result if isinstance(result, list) else []
    except Exception as exc:
        logger.error("Text writing failed: %s", exc)
        return {
            "errors": _append_error(state, "write_text", str(exc)),
            "retry_counts": _bump_retry(state, "text"),
        }

    return {
        "page_texts": page_texts,
        "current_phase": "write_text",
        "progress_percent": 12.0,
    }


async def create_illustration_prompts(state: BookGenerationState) -> dict[str, Any]:
    """Phase 2b: Art Director Agent creates illustration prompts from the blueprint.

    Each prompt includes style keywords, character description, scene composition,
    lighting, and mood — tailored for the image generation provider.
    """
    logger.info("Phase 2b: Creating illustration prompts for book_id=%s", state.get("book_id"))
    router = _get_router()
    blueprint = state.get("blueprint", {})
    page_scenes = blueprint.get("page_scenes", [])

    system_prompt = (
        "You are the Art Director Agent. Create detailed illustration prompts for "
        "each page of a children's book. Each prompt must include: "
        "style description, character appearance, scene composition, lighting, "
        "color palette, mood, and camera angle. "
        f"Art style: {state.get('style', 'watercolor')}. "
        f"Child description: {state.get('child_description', '')}. "
        "Return a JSON array of prompt strings."
    )

    scenes_text = "\n".join(
        f"Page {s.get('page_number', i+1)}: {s.get('scene_description', '')} "
        f"[hint: {s.get('illustration_hint', '')}]"
        for i, s in enumerate(page_scenes)
    )
    user_prompt = f"Book title: {blueprint.get('title', '')}\nStyle: {state.get('style', 'watercolor')}\n\n{scenes_text}"

    try:
        result = await router.generate_structured(
            user_prompt,
            system_prompt,
            {"type": "array", "items": {"type": "string"}},
            GenerationOptions(max_tokens=4096, temperature=0.6),
        )
        prompts = result if isinstance(result, list) else []
    except Exception as exc:
        logger.error("Illustration prompt creation failed: %s", exc)
        return {
            "errors": _append_error(state, "create_illustration_prompts", str(exc)),
        }

    return {
        "illustration_prompts": prompts,
        "current_phase": "create_illustration_prompts",
        "progress_percent": 15.0,
    }


async def generate_character_sheet(state: BookGenerationState) -> dict[str, Any]:
    """Phase 2c: Character Sheet Pipeline produces the 4-view reference sheet.

    Spec: S-03 — front, profile, 3/4, back views used as reference for
    every subsequent illustration to maintain consistency.
    """
    logger.info("Phase 2c: Generating character sheet for book_id=%s", state.get("book_id"))
    router = _get_router()

    child_desc = state.get("child_description", "")
    style = state.get("style", "watercolor")

    try:
        result = await router.generate_character_sheet(
            child_desc,
            style,
            ImageGenerationOptions(
                style=style,
                face_embedding_ref=state.get("face_embedding_ref", ""),
            ),
        )
        urls = {
            "front": result.front_url,
            "profile": result.profile_url,
            "three_quarter": result.three_quarter_url,
            "back": result.back_url,
        }
    except Exception as exc:
        logger.error("Character sheet generation failed: %s", exc)
        return {
            "errors": _append_error(state, "generate_character_sheet", str(exc)),
            "character_sheet_urls": {},
        }

    return {
        "character_sheet_urls": urls,
        "current_phase": "generate_character_sheet",
        "progress_percent": 20.0,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Phase 3 (20–35%): Age Adaptation + optional Accessibility
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


async def adapt_age(state: BookGenerationState) -> dict[str, Any]:
    """Phase 3a: Age Adaptation Agent adjusts text complexity and vocabulary.

    Ensures the text matches the cognitive and reading level for the child's age.
    """
    logger.info("Phase 3a: Adapting text for age=%s", state.get("child_age"))
    router = _get_router()
    page_texts = state.get("page_texts", [])

    system_prompt = (
        "You are the Age Adaptation Agent. Adjust the following children's story texts "
        f"for a {state.get('child_age', 4)}-year-old child. "
        f"Language: {state.get('language', 'he')}. "
        "Simplify vocabulary, adjust sentence length, and ensure age-appropriate content. "
        "Return the adjusted texts as a JSON array of strings."
    )
    user_prompt = "\n---\n".join(
        f"Page {i+1}: {t}" for i, t in enumerate(page_texts)
    )

    try:
        result = await router.generate_structured(
            user_prompt,
            system_prompt,
            {"type": "array", "items": {"type": "string"}},
            GenerationOptions(max_tokens=8192, temperature=0.5),
        )
        adapted = result if isinstance(result, list) else page_texts
    except Exception as exc:
        logger.error("Age adaptation failed: %s", exc)
        return {
            "errors": _append_error(state, "adapt_age", str(exc)),
            "progress_percent": 28.0,
        }

    return {
        "page_texts": adapted,
        "current_phase": "adapt_age",
        "progress_percent": 28.0,
    }


async def adapt_accessibility(state: BookGenerationState) -> dict[str, Any]:
    """Phase 3b: Accessibility Adaptation Agent applies accessibility adjustments.

    Runs only when accessibility_prefs is non-empty (dyslexia-friendly text,
    high contrast cues, simplified language for cognitive accessibility, etc.).
    """
    logger.info("Phase 3b: Applying accessibility adaptations")
    router = _get_router()
    prefs = state.get("accessibility_prefs", {})
    page_texts = state.get("page_texts", [])

    system_prompt = (
        "You are the Accessibility Adaptation Agent. Adjust the following story texts "
        "based on these accessibility preferences:\n"
        f"{prefs}\n"
        "For dyslexia: use shorter sentences, avoid complex words, add extra spacing cues. "
        "For visual impairment: add descriptive audio cues in brackets. "
        "For cognitive accessibility: simplify narrative structure. "
        "Return adapted texts as a JSON array of strings."
    )
    user_prompt = "\n---\n".join(
        f"Page {i+1}: {t}" for i, t in enumerate(page_texts)
    )

    try:
        result = await router.generate_structured(
            user_prompt,
            system_prompt,
            {"type": "array", "items": {"type": "string"}},
            GenerationOptions(max_tokens=8192, temperature=0.4),
        )
        adapted = result if isinstance(result, list) else page_texts
    except Exception as exc:
        logger.error("Accessibility adaptation failed: %s", exc)
        return {"errors": _append_error(state, "adapt_accessibility", str(exc))}

    return {
        "page_texts": adapted,
        "current_phase": "adapt_accessibility",
        "progress_percent": 35.0,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Phase 4 (35–45%): Emotional Tone Analysis
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


async def analyze_emotions(state: BookGenerationState) -> dict[str, Any]:
    """Phase 4: Emotional Tone Agent analyzes the emotional arc.

    Spec: If issues are found, specific pages can be sent back to Hebrew Poet
    (maximum two correction loops — handled by the conditional edge).
    """
    logger.info("Phase 4: Analyzing emotional arc")
    router = _get_router()
    page_texts = state.get("page_texts", [])
    blueprint = state.get("blueprint", {})

    system_prompt = (
        "You are the Emotional Tone Agent. Analyze the emotional arc of each page "
        "and the overall story. Check that emotions progress naturally, the mood "
        f"matches the target ({state.get('mood', 'adventurous')}), and nothing is "
        f"inappropriate for age {state.get('child_age', 4)}. "
        "Return JSON with: overall_score (0-100), page_emotions (array of "
        "{page_number, emotion, intensity, issues}), and issues (array of "
        "{page_number, description, severity})."
    )
    user_prompt = (
        f"Target mood: {state.get('mood', 'adventurous')}\n"
        f"Narrative arc: {blueprint.get('narrative_arc', {})}\n\n"
        + "\n---\n".join(f"Page {i+1}: {t}" for i, t in enumerate(page_texts))
    )

    try:
        analysis = await router.generate_structured(
            user_prompt,
            system_prompt,
            {
                "type": "object",
                "properties": {
                    "overall_score": {"type": "number"},
                    "page_emotions": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "page_number": {"type": "integer"},
                                "emotion": {"type": "string"},
                                "intensity": {"type": "number"},
                                "issues": {"type": "array", "items": {"type": "string"}},
                            },
                        },
                    },
                    "issues": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "page_number": {"type": "integer"},
                                "description": {"type": "string"},
                                "severity": {"type": "string"},
                            },
                        },
                    },
                },
            },
            GenerationOptions(max_tokens=4096, temperature=0.3),
        )
    except Exception as exc:
        logger.error("Emotional analysis failed: %s", exc)
        analysis = {"overall_score": 0, "page_emotions": [], "issues": []}
        return {
            "emotional_analysis": analysis,
            "errors": _append_error(state, "analyze_emotions", str(exc)),
            "progress_percent": 40.0,
        }

    # If issues exist and we haven't exhausted emotional retries, bump counter
    updates: dict[str, Any] = {
        "emotional_analysis": analysis,
        "current_phase": "analyze_emotions",
        "progress_percent": 45.0,
    }
    issues = analysis.get("issues", [])
    if issues:
        updates["retry_counts"] = _bump_retry(state, "emotional")

    return updates


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Phase 5 (45–50%): Illustration Layouts
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


async def determine_layouts(state: BookGenerationState) -> dict[str, Any]:
    """Phase 5: Illustration Layout Agent determines page layouts.

    Decides text placement, illustration size and position, and whether
    the page is full-bleed, split, or text-over-image.
    """
    logger.info("Phase 5: Determining page layouts")
    router = _get_router()
    page_texts = state.get("page_texts", [])
    illustration_prompts = state.get("illustration_prompts", [])

    system_prompt = (
        "You are the Illustration Layout Agent. For each page, determine the optimal "
        "layout: text_position (top, bottom, left, right, overlay), illustration_size "
        "(full_bleed, half_page, quarter_page, vignette), aspect_ratio, "
        "and text_style (font_size, alignment). "
        "Return a JSON array of layout objects."
    )
    pages_desc = "\n".join(
        f"Page {i+1}: Text length={len(t)} chars, Illustration: {illustration_prompts[i] if i < len(illustration_prompts) else 'N/A'}"
        for i, t in enumerate(page_texts)
    )

    try:
        result = await router.generate_structured(
            pages_desc,
            system_prompt,
            {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "page_number": {"type": "integer"},
                        "text_position": {"type": "string"},
                        "illustration_size": {"type": "string"},
                        "aspect_ratio": {"type": "string"},
                        "text_style": {
                            "type": "object",
                            "properties": {
                                "font_size": {"type": "string"},
                                "alignment": {"type": "string"},
                            },
                        },
                    },
                },
            },
            GenerationOptions(max_tokens=2048, temperature=0.3),
        )
        layouts = result if isinstance(result, list) else []
    except Exception as exc:
        logger.error("Layout determination failed: %s", exc)
        return {
            "errors": _append_error(state, "determine_layouts", str(exc)),
            "layout_data": [],
            "progress_percent": 48.0,
        }

    return {
        "layout_data": layouts,
        "current_phase": "determine_layouts",
        "progress_percent": 50.0,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Phase 6 (50–55%): Text Quality Evaluation
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


async def evaluate_text_quality(state: BookGenerationState) -> dict[str, Any]:
    """Phase 6: Quality Critic Agent evaluates text quality.

    Spec: Critical issues trigger restart from Phase 2 (max 1 full restart).
    Major issues send specific pages back to the relevant agent.
    """
    logger.info("Phase 6: Evaluating text quality")
    router = _get_router()
    page_texts = state.get("page_texts", [])

    system_prompt = (
        "You are the Quality Critic Agent. Evaluate the quality of children's story text. "
        "Score each aspect 0-100: grammar, vocabulary_age_match, narrative_coherence, "
        "engagement, educational_value, emotional_depth, rhyme_quality. "
        "Return JSON with: overall_score (0-100, weighted average), "
        "aspect_scores (dict), page_issues (array of {page_number, issue, severity}), "
        "critical_issues (array of strings). "
        f"Age target: {state.get('child_age', 4)}. Language: {state.get('language', 'he')}."
    )
    user_prompt = "\n---\n".join(
        f"Page {i+1}:\n{t}" for i, t in enumerate(page_texts)
    )

    try:
        evaluation = await router.generate_structured(
            user_prompt,
            system_prompt,
            {
                "type": "object",
                "properties": {
                    "overall_score": {"type": "number"},
                    "aspect_scores": {"type": "object"},
                    "page_issues": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "page_number": {"type": "integer"},
                                "issue": {"type": "string"},
                                "severity": {"type": "string"},
                            },
                        },
                    },
                    "critical_issues": {"type": "array", "items": {"type": "string"}},
                },
            },
            GenerationOptions(max_tokens=2048, temperature=0.2),
        )
        score = float(evaluation.get("overall_score", 0))
    except Exception as exc:
        logger.error("Text quality evaluation failed: %s", exc)
        score = 0.0
        return {
            "text_quality_score": score,
            "errors": _append_error(state, "evaluate_text_quality", str(exc)),
            "progress_percent": 52.0,
        }

    updates: dict[str, Any] = {
        "text_quality_score": score,
        "current_phase": "evaluate_text_quality",
        "progress_percent": 55.0,
    }
    # If quality fails, bump retry counter for conditional edge routing
    if score < 75.0:
        updates["retry_counts"] = _bump_retry(state, "text")
    return updates


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Phase 7 (55–85%): Illustration Generation (batch, 4 parallel)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


async def generate_illustrations(state: BookGenerationState) -> dict[str, Any]:
    """Phase 7: Generate illustrations for all pages.

    Spec: Batch processing sends up to 4 images to the GPU cluster simultaneously.
    Progress updates fire per page.
    """
    logger.info("Phase 7: Generating illustrations")
    router = _get_router()
    prompts = state.get("illustration_prompts", [])
    character_urls = state.get("character_sheet_urls", {})
    page_count = state.get("page_count", len(prompts))
    existing = list(state.get("illustrations", []))

    # Only generate for pages that don't have illustrations yet or need regen
    quality_scores = state.get("illustration_quality_scores", [])
    pages_to_generate: list[int] = []
    for i in range(min(page_count, len(prompts))):
        if i >= len(existing):
            pages_to_generate.append(i)
        elif i < len(quality_scores) and quality_scores[i] < 75.0:
            pages_to_generate.append(i)

    if not pages_to_generate:
        pages_to_generate = list(range(min(page_count, len(prompts))))

    batch_size = 4
    illustrations = list(existing)

    # Extend the list to match page_count if needed
    while len(illustrations) < page_count:
        illustrations.append({})

    for batch_start in range(0, len(pages_to_generate), batch_size):
        batch = pages_to_generate[batch_start : batch_start + batch_size]

        async def _generate_one(page_idx: int) -> dict[str, Any]:
            prompt = prompts[page_idx] if page_idx < len(prompts) else ""
            negative = (
                "blurry, extra fingers, distorted hands, asymmetric eyes, "
                "text, watermark, low quality, deformed"
            )
            try:
                result = await router.generate_image(
                    prompt,
                    negative,
                    ImageGenerationOptions(
                        style=state.get("style", "watercolor"),
                        character_sheet_ref=character_urls.get("front", ""),
                        face_embedding_ref=state.get("face_embedding_ref", ""),
                    ),
                )
                return {
                    "page_number": page_idx + 1,
                    "image_url": result.image_url,
                    "thumbnail_url": result.thumbnail_url,
                    "print_url": result.print_url,
                    "width": result.width,
                    "height": result.height,
                    "seed": result.seed,
                    "provider_id": result.provider_id,
                }
            except Exception as exc:
                logger.error("Illustration failed for page %d: %s", page_idx + 1, exc)
                return {"page_number": page_idx + 1, "error": str(exc)}

        results = await asyncio.gather(*[_generate_one(idx) for idx in batch])
        for res in results:
            pg = res.get("page_number", 1) - 1
            if pg < len(illustrations):
                illustrations[pg] = res

    # Calculate progress based on completion ratio
    progress = 55.0 + (30.0 * len([i for i in illustrations if i.get("image_url")]) / max(page_count, 1))

    return {
        "illustrations": illustrations,
        "current_phase": "generate_illustrations",
        "progress_percent": min(progress, 85.0),
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Phase 8 (85–88%): Illustration Quality Evaluation
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


async def evaluate_illustration_quality(state: BookGenerationState) -> dict[str, Any]:
    """Phase 8: Quality Critic evaluates each illustration.

    Spec: Technical Quality Gate checks dimensions and blur.
    Likeness Gate checks face similarity. Issues trigger repair or regen.
    """
    logger.info("Phase 8: Evaluating illustration quality")
    router = _get_router()
    illustrations = state.get("illustrations", [])
    face_ref = state.get("face_embedding_ref", "")

    scores: list[float] = []
    for illust in illustrations:
        if not illust.get("image_url"):
            scores.append(0.0)
            continue

        # Use vision API to evaluate
        system_prompt = (
            "You are a Quality Critic for children's book illustrations. "
            "Evaluate this illustration on: technical_quality (resolution, sharpness), "
            "artistic_quality (composition, color harmony), child_appropriateness, "
            "character_consistency, anatomical_correctness. "
            "Return JSON: {overall_score: 0-100, issues: [{type, description, severity}]}"
        )
        user_prompt = (
            f"Illustration URL: {illust.get('image_url', '')}\n"
            f"Expected dimensions: {illust.get('width', 0)}x{illust.get('height', 0)}\n"
            f"Art style: {state.get('style', 'watercolor')}"
        )

        try:
            evaluation = await router.generate_structured(
                user_prompt,
                system_prompt,
                {
                    "type": "object",
                    "properties": {
                        "overall_score": {"type": "number"},
                        "issues": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "type": {"type": "string"},
                                    "description": {"type": "string"},
                                    "severity": {"type": "string"},
                                },
                            },
                        },
                    },
                },
                GenerationOptions(max_tokens=1024, temperature=0.2),
            )
            scores.append(float(evaluation.get("overall_score", 0)))
        except Exception as exc:
            logger.error("Illustration quality eval failed: %s", exc)
            scores.append(0.0)

    # If there are failures, bump illustration retry counter
    updates: dict[str, Any] = {
        "illustration_quality_scores": scores,
        "current_phase": "evaluate_illustration_quality",
        "progress_percent": 88.0,
    }
    if any(s < 75.0 for s in scores):
        updates["retry_counts"] = _bump_retry(state, "illustrations")

    return updates


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Phase 9 (88–92%): Consistency Check
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


async def check_consistency(state: BookGenerationState) -> dict[str, Any]:
    """Phase 9: Consistency Guardian Agent runs cross-book validation.

    Spec: Multi-Reference Consistency Check comparing face embeddings,
    character descriptions, style keywords, and color palettes across all pages.
    """
    logger.info("Phase 9: Checking cross-book consistency")
    router = _get_router()
    illustration_prompts = state.get("illustration_prompts", [])
    illustrations = state.get("illustrations", [])

    system_prompt = (
        "You are the Consistency Guardian Agent. Analyze cross-page consistency: "
        "character_consistency (same appearance across all pages), "
        "style_consistency (same art style throughout), "
        "color_palette_consistency (harmonious colors across pages), "
        "narrative_visual_alignment (illustrations match the story text). "
        "Return JSON: {overall_score: 0-100, character_issues: [], "
        "style_issues: [], color_issues: [], alignment_issues: []}."
    )

    prompts_desc = "\n".join(
        f"Page {i+1} prompt: {p}" for i, p in enumerate(illustration_prompts)
    )
    illustrations_desc = "\n".join(
        f"Page {i+1} image: {il.get('image_url', 'N/A')}"
        for i, il in enumerate(illustrations)
    )

    try:
        evaluation = await router.generate_structured(
            f"Illustration prompts:\n{prompts_desc}\n\nGenerated illustrations:\n{illustrations_desc}",
            system_prompt,
            {
                "type": "object",
                "properties": {
                    "overall_score": {"type": "number"},
                    "character_issues": {"type": "array", "items": {"type": "string"}},
                    "style_issues": {"type": "array", "items": {"type": "string"}},
                    "color_issues": {"type": "array", "items": {"type": "string"}},
                    "alignment_issues": {"type": "array", "items": {"type": "string"}},
                },
            },
            GenerationOptions(max_tokens=2048, temperature=0.2),
        )
        score = float(evaluation.get("overall_score", 0))
    except Exception as exc:
        logger.error("Consistency check failed: %s", exc)
        score = 0.0

    return {
        "consistency_score": score,
        "current_phase": "check_consistency",
        "progress_percent": 92.0,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Phase 10 (92–95%): Narration Generation
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


async def generate_narration(state: BookGenerationState) -> dict[str, Any]:
    """Phase 10: Narration Director Agent produces Performance Markup + voice.

    First generates SSML-like performance markup for each page, then calls
    the voice provider to synthesize audio.
    """
    logger.info("Phase 10: Generating narration")
    router = _get_router()
    page_texts = state.get("page_texts", [])

    # Step 1: Generate performance markup
    system_prompt = (
        "You are the Narration Director Agent. For each page of text, create "
        "performance markup specifying: speaker, emotion (happy/scared/whispering/"
        "shouting/singing/brave/gentle), pace (slow/normal/fast), "
        "pause_before (seconds), pause_after (seconds), emphasized_words (indices), "
        "sound_effect (optional). Return a JSON array."
    )
    user_prompt = "\n---\n".join(
        f"Page {i+1}: {t}" for i, t in enumerate(page_texts)
    )

    try:
        markup = await router.generate_structured(
            user_prompt,
            system_prompt,
            {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "speaker": {"type": "string"},
                        "emotion": {"type": "string"},
                        "pace": {"type": "string"},
                        "pause_before": {"type": "number"},
                        "pause_after": {"type": "number"},
                        "emphasized_words": {"type": "array", "items": {"type": "integer"}},
                        "sound_effect": {"type": "string"},
                    },
                },
            },
            GenerationOptions(max_tokens=2048, temperature=0.3),
        )
        performance_markup = markup if isinstance(markup, list) else []
    except Exception as exc:
        logger.error("Performance markup generation failed: %s", exc)
        performance_markup = []

    # Step 2: Generate voice audio — concatenate all pages
    combined_text = " ".join(page_texts)
    try:
        voice_result = await router.generate_voice(
            combined_text,
            voice_id="default",
            options=VoiceGenerationOptions(
                language=state.get("language", "he"),
            ),
        )
        voice_url = voice_result.audio_url
    except Exception as exc:
        logger.error("Voice generation failed: %s", exc)
        voice_url = ""

    return {
        "performance_markup": performance_markup,
        "voice_narration_url": voice_url,
        "current_phase": "generate_narration",
        "progress_percent": 95.0,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Phase 11 (95–97%): Parental Guide + Cultural Sensitivity (parallel)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


async def generate_parental_guide(state: BookGenerationState) -> dict[str, Any]:
    """Phase 11a: Parental Guidance Agent creates the guide.

    Produces discussion questions, vocabulary list, educational themes,
    and age-appropriate reading tips.
    """
    logger.info("Phase 11a: Generating parental guide")
    router = _get_router()
    page_texts = state.get("page_texts", [])
    blueprint = state.get("blueprint", {})

    system_prompt = (
        "You are the Parental Guidance Agent. Create a guide for parents including: "
        "discussion_questions (list), vocabulary_words (list with definitions), "
        "educational_themes (list), reading_tips (list), "
        "emotional_themes (list with how to discuss), age_appropriateness_notes. "
        f"Child age: {state.get('child_age', 4)}. Language: {state.get('language', 'he')}. "
        "Return as JSON object."
    )
    user_prompt = (
        f"Story: {blueprint.get('title', '')}\n"
        f"Theme: {blueprint.get('theme', '')}\n"
        f"Moral: {blueprint.get('moral', '')}\n\n"
        + "\n".join(f"Page {i+1}: {t}" for i, t in enumerate(page_texts))
    )

    try:
        guide = await router.generate_structured(
            user_prompt,
            system_prompt,
            {
                "type": "object",
                "properties": {
                    "discussion_questions": {"type": "array", "items": {"type": "string"}},
                    "vocabulary_words": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "word": {"type": "string"},
                                "definition": {"type": "string"},
                            },
                        },
                    },
                    "educational_themes": {"type": "array", "items": {"type": "string"}},
                    "reading_tips": {"type": "array", "items": {"type": "string"}},
                    "emotional_themes": {"type": "array", "items": {"type": "string"}},
                    "age_appropriateness_notes": {"type": "string"},
                },
            },
            GenerationOptions(max_tokens=2048, temperature=0.5),
        )
    except Exception as exc:
        logger.error("Parental guide generation failed: %s", exc)
        guide = {}

    return {
        "parental_guide": guide,
        "current_phase": "generate_parental_guide",
        "progress_percent": 96.0,
    }


async def check_cultural_sensitivity(state: BookGenerationState) -> dict[str, Any]:
    """Phase 11b: Cultural Sensitivity Agent checks content for cultural issues.

    Runs in parallel with the parental guide. Flags stereotypes, cultural
    inaccuracies, or potentially offensive content.
    """
    logger.info("Phase 11b: Checking cultural sensitivity")
    router = _get_router()
    page_texts = state.get("page_texts", [])

    system_prompt = (
        "You are the Cultural Sensitivity Agent. Review children's story text for "
        "cultural stereotypes, misrepresentations, potentially offensive content, "
        "gender bias, and inclusivity issues. "
        "Return JSON: {passed: bool, issues: [{page_number, description, severity, suggestion}], "
        "overall_assessment: string}."
    )
    user_prompt = "\n---\n".join(
        f"Page {i+1}: {t}" for i, t in enumerate(page_texts)
    )

    try:
        result = await router.generate_structured(
            user_prompt,
            system_prompt,
            {
                "type": "object",
                "properties": {
                    "passed": {"type": "boolean"},
                    "issues": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "page_number": {"type": "integer"},
                                "description": {"type": "string"},
                                "severity": {"type": "string"},
                                "suggestion": {"type": "string"},
                            },
                        },
                    },
                    "overall_assessment": {"type": "string"},
                },
            },
            GenerationOptions(max_tokens=2048, temperature=0.2),
        )
    except Exception as exc:
        logger.error("Cultural sensitivity check failed: %s", exc)
        result = {"passed": True, "issues": [], "overall_assessment": "check_failed"}

    # Cultural issues are logged but don't block (they feed into parental guide)
    errors = list(state.get("errors", []))
    if not result.get("passed", True):
        for issue in result.get("issues", []):
            errors.append({
                "phase": "cultural_sensitivity",
                "message": issue.get("description", ""),
                "severity": issue.get("severity", "warning"),
                "timestamp": time.time(),
            })

    return {
        "errors": errors,
        "current_phase": "check_cultural_sensitivity",
        "progress_percent": 97.0,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Phase 12 (97–100%): Book Assembly
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


async def assemble_book(state: BookGenerationState) -> dict[str, Any]:
    """Phase 12: Book Assembly Service creates the interactive book JSON.

    Combines all generated assets — text, illustrations, layouts, narration,
    and parental guide — into the final interactive_book_data structure.
    """
    logger.info("Phase 12: Assembling book")
    blueprint = state.get("blueprint", {})
    page_texts = state.get("page_texts", [])
    illustrations = state.get("illustrations", [])
    layout_data = state.get("layout_data", [])
    performance_markup = state.get("performance_markup", [])
    page_count = state.get("page_count", len(page_texts))

    # Build the page array
    pages: list[dict[str, Any]] = []
    for i in range(page_count):
        page: dict[str, Any] = {
            "page_number": i + 1,
            "text": page_texts[i] if i < len(page_texts) else "",
            "illustration": illustrations[i] if i < len(illustrations) else {},
            "layout": layout_data[i] if i < len(layout_data) else {},
            "performance_markup": performance_markup[i] if i < len(performance_markup) else {},
        }
        pages.append(page)

    interactive_data: dict[str, Any] = {
        "version": "1.0",
        "title": blueprint.get("title", ""),
        "theme": blueprint.get("theme", ""),
        "moral": blueprint.get("moral", ""),
        "child_name": state.get("child_name", ""),
        "child_age": state.get("child_age", 0),
        "language": state.get("language", "he"),
        "style": state.get("style", "watercolor"),
        "page_count": page_count,
        "pages": pages,
        "voice_narration_url": state.get("voice_narration_url", ""),
        "character_sheet_urls": state.get("character_sheet_urls", {}),
        "quality_scores": {
            "text_quality": state.get("text_quality_score", 0.0),
            "illustration_quality": state.get("illustration_quality_scores", []),
            "consistency": state.get("consistency_score", 0.0),
            "likeness": state.get("likeness_scores", []),
        },
        "parental_guide": state.get("parental_guide", {}),
    }

    return {
        "interactive_book_data": interactive_data,
        "current_phase": "assemble_book",
        "progress_percent": 100.0,
    }
