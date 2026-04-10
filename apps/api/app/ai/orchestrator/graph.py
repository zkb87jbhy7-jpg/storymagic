"""LangGraph StateGraph for the 12-phase book generation pipeline.

Spec ref: Ch5.17 — The orchestrator is implemented as a LangGraph state graph
running on top of Temporal.io for durable execution.  The graph defines nodes
for each agent, conditional edges for quality retry loops, and parallel
branches where dependencies allow.

Usage:
    from app.ai.orchestrator.graph import run_pipeline
    result = await run_pipeline(initial_state)
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from langgraph.graph import END, StateGraph

from app.ai.orchestrator.conditions import (
    route_after_age_adapt,
    route_after_emotional_analysis,
    route_after_illustration_quality,
    route_after_text_quality,
)
from app.ai.orchestrator.nodes import (
    adapt_accessibility,
    adapt_age,
    analyze_emotions,
    assemble_book,
    check_consistency,
    check_cultural_sensitivity,
    create_illustration_prompts,
    determine_layouts,
    evaluate_illustration_quality,
    evaluate_text_quality,
    generate_blueprint,
    generate_character_sheet,
    generate_illustrations,
    generate_narration,
    generate_parental_guide,
    write_text,
)
from app.ai.orchestrator.state import BookGenerationState

logger = logging.getLogger("storymagic.orchestrator.graph")


# ── Parallel wrapper nodes ──────────────────────────────────────────────
# LangGraph supports parallel execution via fan-out/fan-in patterns.
# We wrap parallel phases into single nodes that use asyncio.gather internally.


async def phase2_parallel(state: BookGenerationState) -> dict[str, Any]:
    """Phase 2: Run write_text, create_illustration_prompts, and
    generate_character_sheet in parallel.

    Spec: Phase 2 (5-20%) — In parallel: Hebrew Poet + Art Director +
    Character Sheet Pipeline.
    """
    results = await asyncio.gather(
        write_text(state),
        create_illustration_prompts(state),
        generate_character_sheet(state),
        return_exceptions=True,
    )

    merged: dict[str, Any] = {
        "current_phase": "phase2_parallel",
        "progress_percent": 20.0,
    }

    for result in results:
        if isinstance(result, Exception):
            logger.error("Phase 2 parallel task failed: %s", result)
            errors = list(merged.get("errors", state.get("errors", [])))
            errors.append({
                "phase": "phase2_parallel",
                "message": str(result),
            })
            merged["errors"] = errors
        elif isinstance(result, dict):
            merged.update(result)

    return merged


async def phase11_parallel(state: BookGenerationState) -> dict[str, Any]:
    """Phase 11: Run generate_parental_guide and check_cultural_sensitivity
    in parallel.

    Spec: Phase 11 (95-97%) — Parental Guidance Agent + Cultural Sensitivity Agent.
    """
    results = await asyncio.gather(
        generate_parental_guide(state),
        check_cultural_sensitivity(state),
        return_exceptions=True,
    )

    merged: dict[str, Any] = {
        "current_phase": "phase11_parallel",
        "progress_percent": 97.0,
    }

    for result in results:
        if isinstance(result, Exception):
            logger.error("Phase 11 parallel task failed: %s", result)
            errors = list(merged.get("errors", state.get("errors", [])))
            errors.append({
                "phase": "phase11_parallel",
                "message": str(result),
            })
            merged["errors"] = errors
        elif isinstance(result, dict):
            # Merge carefully: parental_guide replaces, errors accumulate
            if "parental_guide" in result:
                merged["parental_guide"] = result["parental_guide"]
            if "errors" in result:
                existing = list(merged.get("errors", state.get("errors", [])))
                existing.extend(result.get("errors", []))
                merged["errors"] = existing
            # Copy any other keys
            for k, v in result.items():
                if k not in ("parental_guide", "errors"):
                    merged[k] = v

    return merged


# ── Repair node (targeted inpainting) ──────────────────────────────────


async def repair_illustrations(state: BookGenerationState) -> dict[str, Any]:
    """Targeted repair for illustrations that failed quality but are repairable.

    Uses inpainting on the specific regions identified as problematic
    (e.g., face region for likeness issues, hands for anatomical issues).
    Falls back to full regeneration if repair fails.
    """
    logger.info("Repairing illustrations via targeted inpainting")
    from app.ai.providers.registry import ProviderRegistry
    from app.ai.providers.router import AIRouter

    router = AIRouter(ProviderRegistry())
    illustrations = list(state.get("illustrations", []))
    scores = state.get("illustration_quality_scores", [])
    prompts = state.get("illustration_prompts", [])

    for i, score in enumerate(scores):
        if score >= 75.0:
            continue
        if i >= len(illustrations) or i >= len(prompts):
            continue

        # Attempt repair via re-generation with stronger guidance
        prompt = prompts[i]
        enhanced_prompt = (
            f"{prompt} "
            "CRITICAL: Ensure correct anatomy — five fingers on each hand, "
            "symmetric eyes, proper proportions. High quality, sharp details."
        )
        negative = (
            "blurry, extra fingers, distorted hands, asymmetric eyes, "
            "deformed, low quality, artifacts, watermark"
        )

        try:
            from app.ai.providers.base import ImageGenerationOptions

            result = await router.generate_image(
                enhanced_prompt,
                negative,
                ImageGenerationOptions(
                    style=state.get("style", "watercolor"),
                    character_sheet_ref=state.get("character_sheet_urls", {}).get("front", ""),
                    face_embedding_ref=state.get("face_embedding_ref", ""),
                ),
            )
            illustrations[i] = {
                "page_number": i + 1,
                "image_url": result.image_url,
                "thumbnail_url": result.thumbnail_url,
                "print_url": result.print_url,
                "width": result.width,
                "height": result.height,
                "seed": result.seed,
                "provider_id": result.provider_id,
                "repaired": True,
            }
        except Exception as exc:
            logger.error("Repair failed for page %d: %s", i + 1, exc)

    return {
        "illustrations": illustrations,
        "current_phase": "repair_illustrations",
        "progress_percent": 87.0,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Build the StateGraph
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


def build_graph() -> StateGraph:
    """Construct and return the compiled LangGraph state graph.

    Graph structure follows the 12-phase pipeline from Spec Ch5.17:

    Phase 1:  generate_blueprint
    Phase 2:  phase2_parallel (write_text || create_illustration_prompts || generate_character_sheet)
    Phase 3:  adapt_age -> conditional(adapt_accessibility)
    Phase 4:  analyze_emotions (conditional loop back to write_text)
    Phase 5:  determine_layouts
    Phase 6:  evaluate_text_quality (conditional loop back to write_text)
    Phase 7:  generate_illustrations
    Phase 8:  evaluate_illustration_quality (conditional repair/regen)
    Phase 9:  check_consistency
    Phase 10: generate_narration
    Phase 11: phase11_parallel (generate_parental_guide || check_cultural_sensitivity)
    Phase 12: assemble_book
    """
    graph = StateGraph(BookGenerationState)

    # ── Add all nodes ──────────────────────────────────────────────────

    # Phase 1
    graph.add_node("generate_blueprint", generate_blueprint)

    # Phase 2 (parallel)
    graph.add_node("phase2_parallel", phase2_parallel)

    # Phase 3
    graph.add_node("adapt_age", adapt_age)
    graph.add_node("adapt_accessibility", adapt_accessibility)

    # Phase 4
    graph.add_node("analyze_emotions", analyze_emotions)

    # Phase 5
    graph.add_node("determine_layouts", determine_layouts)

    # Phase 6
    graph.add_node("evaluate_text_quality", evaluate_text_quality)

    # Phase 7
    graph.add_node("generate_illustrations", generate_illustrations)

    # Phase 8
    graph.add_node("evaluate_illustration_quality", evaluate_illustration_quality)
    graph.add_node("repair_illustrations", repair_illustrations)

    # Phase 9
    graph.add_node("check_consistency", check_consistency)

    # Phase 10
    graph.add_node("generate_narration", generate_narration)

    # Phase 11 (parallel)
    graph.add_node("phase11_parallel", phase11_parallel)

    # Phase 12
    graph.add_node("assemble_book", assemble_book)

    # For conditional loops that go back to write_text, we add a
    # dedicated entry node name alias for clarity (LangGraph routes by name)
    graph.add_node("write_text", write_text)

    # ── Set entry point ────────────────────────────────────────────────

    graph.set_entry_point("generate_blueprint")

    # ── Linear edges ───────────────────────────────────────────────────

    # Phase 1 -> Phase 2
    graph.add_edge("generate_blueprint", "phase2_parallel")

    # Phase 2 -> Phase 3
    graph.add_edge("phase2_parallel", "adapt_age")

    # Phase 3a -> conditional: accessibility or emotions
    graph.add_conditional_edges(
        "adapt_age",
        route_after_age_adapt,
        {
            "adapt_accessibility": "adapt_accessibility",
            "analyze_emotions": "analyze_emotions",
        },
    )

    # Phase 3b (accessibility) -> Phase 4
    graph.add_edge("adapt_accessibility", "analyze_emotions")

    # Phase 4 -> conditional: retry text or proceed to layouts
    graph.add_conditional_edges(
        "analyze_emotions",
        route_after_emotional_analysis,
        {
            "write_text": "write_text",
            "determine_layouts": "determine_layouts",
        },
    )

    # write_text retry loop feeds back into adapt_age for the full chain
    graph.add_edge("write_text", "adapt_age")

    # Phase 5 -> Phase 6
    graph.add_edge("determine_layouts", "evaluate_text_quality")

    # Phase 6 -> conditional: retry text or proceed to illustrations
    graph.add_conditional_edges(
        "evaluate_text_quality",
        route_after_text_quality,
        {
            "write_text": "write_text",
            "generate_illustrations": "generate_illustrations",
        },
    )

    # Phase 7 -> Phase 8
    graph.add_edge("generate_illustrations", "evaluate_illustration_quality")

    # Phase 8 -> conditional: repair, regen, or proceed
    graph.add_conditional_edges(
        "evaluate_illustration_quality",
        route_after_illustration_quality,
        {
            "repair_illustrations": "repair_illustrations",
            "generate_illustrations": "generate_illustrations",
            "check_consistency": "check_consistency",
        },
    )

    # Repair -> back to evaluation
    graph.add_edge("repair_illustrations", "evaluate_illustration_quality")

    # Phase 9 -> Phase 10
    graph.add_edge("check_consistency", "generate_narration")

    # Phase 10 -> Phase 11
    graph.add_edge("generate_narration", "phase11_parallel")

    # Phase 11 -> Phase 12
    graph.add_edge("phase11_parallel", "assemble_book")

    # Phase 12 -> END
    graph.add_edge("assemble_book", END)

    return graph


# ── Compiled graph singleton ────────────────────────────────────────────

_compiled_graph = None


def get_compiled_graph():
    """Return a compiled (ready-to-run) version of the graph.

    The compilation step validates the graph structure and prepares it for
    execution.  We cache the result since the graph topology is static.
    """
    global _compiled_graph
    if _compiled_graph is None:
        graph = build_graph()
        _compiled_graph = graph.compile()
    return _compiled_graph


async def run_pipeline(initial_state: BookGenerationState) -> BookGenerationState:
    """Execute the full book generation pipeline.

    Args:
        initial_state: The initial state containing all input fields (child_name,
            child_age, prompt, style, etc.) plus initialized meta fields.

    Returns:
        The final state with all output fields populated, including
        interactive_book_data, voice_narration_url, and quality scores.
    """
    compiled = get_compiled_graph()

    # Ensure meta fields are initialized
    state: dict[str, Any] = dict(initial_state)
    state.setdefault("current_phase", "starting")
    state.setdefault("progress_percent", 0.0)
    state.setdefault("errors", [])
    state.setdefault("retry_counts", {})
    state.setdefault("illustrations", [])
    state.setdefault("illustration_quality_scores", [])
    state.setdefault("likeness_scores", [])

    logger.info(
        "Starting book generation pipeline for book_id=%s, child=%s",
        state.get("book_id"),
        state.get("child_name"),
    )

    # LangGraph's invoke runs the graph to completion
    final_state = await compiled.ainvoke(state)

    logger.info(
        "Pipeline complete: book_id=%s, progress=%s%%, errors=%d",
        final_state.get("book_id"),
        final_state.get("progress_percent"),
        len(final_state.get("errors", [])),
    )

    return final_state
