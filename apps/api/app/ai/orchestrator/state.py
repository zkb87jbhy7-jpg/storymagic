"""BookGenerationState — LangGraph state definition for the book generation pipeline.

Spec ref: Ch5.17 — The orchestrator is implemented as a LangGraph state graph.
All intermediate values flow through this typed state dict so that every node
can read what it needs and write its outputs atomically.
"""

from __future__ import annotations

from typing import Any, TypedDict


class BookGenerationState(TypedDict, total=False):
    """Full state carried through the 12-phase book generation graph.

    Fields are grouped into four categories:
    - Input: provided by the caller when the pipeline starts.
    - Intermediate: produced by one node and consumed by later nodes.
    - Quality: scores computed by quality-gate nodes.
    - Output: final deliverables written by the last phases.
    - Meta: progress tracking, error handling, and retry bookkeeping.
    """

    # ── Input fields ───────────────────────────────────────────────────
    book_id: str
    child_name: str
    child_age: int
    child_gender: str
    prompt: str
    style: str
    mood: str
    page_count: int
    language: str
    is_rhyming: bool
    child_description: str
    face_embedding_ref: str
    accessibility_prefs: dict[str, Any]

    # ── Intermediate fields ────────────────────────────────────────────
    blueprint: dict[str, Any]
    page_texts: list[str]
    illustration_prompts: list[str]
    character_sheet_urls: dict[str, str]
    illustrations: list[dict[str, Any]]
    emotional_analysis: dict[str, Any]
    layout_data: list[dict[str, Any]]

    # ── Quality fields ─────────────────────────────────────────────────
    text_quality_score: float
    illustration_quality_scores: list[float]
    consistency_score: float
    likeness_scores: list[float]

    # ── Output fields ──────────────────────────────────────────────────
    voice_narration_url: str
    parental_guide: dict[str, Any]
    performance_markup: list[dict[str, Any]]
    interactive_book_data: dict[str, Any]

    # ── Meta fields ────────────────────────────────────────────────────
    current_phase: str
    progress_percent: float
    errors: list[dict[str, Any]]
    retry_counts: dict[str, int]
