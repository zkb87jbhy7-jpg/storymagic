"""Edge condition functions for the LangGraph book generation graph.

Spec ref: Ch5.17 — Conditional edges control retry loops and optional branches.
Each function inspects the current BookGenerationState and returns a boolean or
a routing string used by LangGraph ``add_conditional_edges``.
"""

from __future__ import annotations

from typing import Any

from app.ai.orchestrator.state import BookGenerationState

# ── Quality thresholds ──────────────────────────────────────────────────

TEXT_QUALITY_THRESHOLD = 75.0
ILLUSTRATION_QUALITY_THRESHOLD = 75.0
MAX_TEXT_RETRIES = 1
MAX_ILLUSTRATION_RETRIES = 2


# ── Boolean condition helpers ───────────────────────────────────────────


def should_retry_text(state: BookGenerationState) -> bool:
    """Return True if text quality is below threshold and retries remain.

    Spec: Phase 6 — Critical issues trigger restart from Phase 2, max 1 full restart.
    """
    score = state.get("text_quality_score", 100.0)
    retries = state.get("retry_counts", {}).get("text", 0)
    return score < TEXT_QUALITY_THRESHOLD and retries < MAX_TEXT_RETRIES


def should_retry_illustrations(state: BookGenerationState) -> bool:
    """Return True if any illustration scored below threshold and retries remain.

    Spec: Phase 8 — Issues trigger repair then regen, max 2 retries per page.
    """
    scores = state.get("illustration_quality_scores", [])
    retries = state.get("retry_counts", {}).get("illustrations", 0)
    if not scores:
        return False
    return any(s < ILLUSTRATION_QUALITY_THRESHOLD for s in scores) and retries < MAX_ILLUSTRATION_RETRIES


def should_repair_illustration(state: BookGenerationState) -> bool:
    """Return True if the quality issue is repairable via inpainting rather than full regen.

    Heuristic: if the score is above 50, we attempt targeted repair first.
    Below 50 indicates fundamental issues requiring full regeneration.
    """
    scores = state.get("illustration_quality_scores", [])
    if not scores:
        return False
    failing = [s for s in scores if s < ILLUSTRATION_QUALITY_THRESHOLD]
    if not failing:
        return False
    # If worst score > 50, attempt repair; otherwise full regen
    return min(failing) >= 50.0


def needs_accessibility(state: BookGenerationState) -> bool:
    """Return True if accessibility preferences were provided.

    Spec: Phase 3 — Accessibility Adaptation Agent runs if prefs are set.
    """
    prefs = state.get("accessibility_prefs", {})
    return bool(prefs)


def all_illustrations_done(state: BookGenerationState) -> bool:
    """Return True when all page illustrations have been generated."""
    illustrations = state.get("illustrations", [])
    page_count = state.get("page_count", 0)
    return len(illustrations) >= page_count


def text_quality_passed(state: BookGenerationState) -> bool:
    """Return True if text quality meets or exceeds the threshold.

    Spec: Phase 6 — score >= 75 passes.
    """
    return state.get("text_quality_score", 0.0) >= TEXT_QUALITY_THRESHOLD


# ── String routing functions (for add_conditional_edges) ────────────────


def route_after_text_quality(state: BookGenerationState) -> str:
    """Route after text quality evaluation.

    Returns:
        "generate_illustrations" — quality passed, proceed.
        "write_text"            — quality failed, retry (if retries remain).
        "generate_illustrations" — quality failed but no retries left, proceed anyway.
    """
    if text_quality_passed(state):
        return "generate_illustrations"
    if should_retry_text(state):
        return "write_text"
    # Exhausted retries — proceed with best effort
    return "generate_illustrations"


def route_after_illustration_quality(state: BookGenerationState) -> str:
    """Route after illustration quality evaluation.

    Returns:
        "check_consistency"       — all illustrations pass.
        "repair_illustrations"    — repairable issues found.
        "generate_illustrations"  — non-repairable issues, needs full regen.
        "check_consistency"       — retries exhausted, proceed.
    """
    if not should_retry_illustrations(state):
        return "check_consistency"
    if should_repair_illustration(state):
        return "repair_illustrations"
    return "generate_illustrations"


def route_after_age_adapt(state: BookGenerationState) -> str:
    """Route after age adaptation: optionally run accessibility adaptation."""
    if needs_accessibility(state):
        return "adapt_accessibility"
    return "analyze_emotions"


def route_after_emotional_analysis(state: BookGenerationState) -> str:
    """Route after emotional analysis.

    Spec: Phase 4 — If issues found, send back to Hebrew Poet, max 2 correction loops.
    """
    analysis = state.get("emotional_analysis", {})
    issues = analysis.get("issues", [])
    retries = state.get("retry_counts", {}).get("emotional", 0)
    if issues and retries < 2:
        return "write_text"
    return "determine_layouts"
