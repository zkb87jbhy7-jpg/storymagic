"""Likeness Gate — Layer L-04 of the quality pipeline.

Spec ref: Ch6.4 — LikenessGate verifies that the illustrated character
resembles the actual child.  Extracts face from the illustration, computes
embedding, and calculates cosine similarity against the original embedding.
Minimum threshold: 0.75.  Below threshold triggers repair then regen.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

import numpy as np

logger = logging.getLogger("storymagic.quality.likeness_gate")

# ── Configuration ──────────────────────────────────────────────────────

LIKENESS_THRESHOLD = 0.75
REPAIR_MIN_THRESHOLD = 0.5  # Below this, repair won't help — full regen needed


class LikenessAction(Enum):
    """Recommended action based on likeness score."""
    PASS = "pass"
    REPAIR = "repair"
    REGENERATE = "regenerate"


@dataclass
class LikenessResult:
    """Result of a LikenessGate check on a single illustration."""
    passed: bool
    similarity: float
    threshold: float
    action: LikenessAction
    page_number: int = 0
    details: dict[str, Any] = field(default_factory=dict)
    check_duration_ms: float = 0.0


@dataclass
class LikenessBatchResult:
    """Result of LikenessGate checks across all illustrations."""
    passed: bool
    overall_score: float  # Average similarity
    results: list[LikenessResult] = field(default_factory=list)
    pages_needing_repair: list[int] = field(default_factory=list)
    pages_needing_regen: list[int] = field(default_factory=list)
    check_duration_ms: float = 0.0


def cosine_similarity(embedding_a: list[float], embedding_b: list[float]) -> float:
    """Compute cosine similarity between two embedding vectors.

    Args:
        embedding_a: First embedding vector.
        embedding_b: Second embedding vector.

    Returns:
        Cosine similarity in range [-1, 1]. Typically 0-1 for face embeddings.
    """
    a = np.array(embedding_a, dtype=np.float64)
    b = np.array(embedding_b, dtype=np.float64)

    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return float(dot_product / (norm_a * norm_b))


class LikenessGate:
    """Verifies illustrated characters resemble the actual child.

    Uses face embedding comparison via the AI provider's face processing
    capability.  For each illustration, extracts the face, computes an
    embedding, and compares it against the original child's embedding.

    Usage:
        gate = LikenessGate()
        result = await gate.check_likeness(illust_embedding, original_embedding)
        batch = await gate.check_all(illustrations, original_embedding)
    """

    def __init__(self, threshold: float = LIKENESS_THRESHOLD) -> None:
        self.threshold = threshold

    async def check_likeness(
        self,
        illustration_face_embedding: str,
        original_embedding: str,
        page_number: int = 0,
    ) -> LikenessResult:
        """Check likeness of a single illustration against the original face.

        Spec: Cosine similarity threshold 0.75. Below triggers repair, then regen.

        Args:
            illustration_face_embedding: Embedding ref from the illustration.
            original_embedding: Original child face embedding ref.
            page_number: Page number for identification.

        Returns:
            LikenessResult with pass/fail, similarity, and recommended action.
        """
        start = time.perf_counter()

        if not illustration_face_embedding or not original_embedding:
            elapsed = (time.perf_counter() - start) * 1000
            return LikenessResult(
                passed=False,
                similarity=0.0,
                threshold=self.threshold,
                action=LikenessAction.REGENERATE,
                page_number=page_number,
                details={"reason": "Missing embedding reference"},
                check_duration_ms=elapsed,
            )

        try:
            from app.ai.providers.registry import ProviderRegistry
            from app.ai.providers.router import AIRouter

            router = AIRouter(ProviderRegistry())
            similarity = await router.compare_faces(
                illustration_face_embedding,
                original_embedding,
            )
        except Exception as exc:
            logger.error(
                "Face comparison failed for page %d: %s", page_number, exc
            )
            elapsed = (time.perf_counter() - start) * 1000
            return LikenessResult(
                passed=False,
                similarity=0.0,
                threshold=self.threshold,
                action=LikenessAction.REPAIR,
                page_number=page_number,
                details={"error": str(exc)},
                check_duration_ms=elapsed,
            )

        # Determine action based on similarity score
        if similarity >= self.threshold:
            action = LikenessAction.PASS
            passed = True
        elif similarity >= REPAIR_MIN_THRESHOLD:
            # Score is close enough that targeted repair (face inpainting) might work
            action = LikenessAction.REPAIR
            passed = False
        else:
            # Score too low — the face is fundamentally different, need full regen
            action = LikenessAction.REGENERATE
            passed = False

        elapsed = (time.perf_counter() - start) * 1000

        if not passed:
            logger.warning(
                "Likeness check FAILED for page %d: similarity=%.3f threshold=%.3f action=%s",
                page_number,
                similarity,
                self.threshold,
                action.value,
            )

        return LikenessResult(
            passed=passed,
            similarity=similarity,
            threshold=self.threshold,
            action=action,
            page_number=page_number,
            details={
                "illustration_embedding": illustration_face_embedding,
                "original_embedding": original_embedding,
            },
            check_duration_ms=elapsed,
        )

    async def check_all(
        self,
        illustrations: list[dict[str, Any]],
        original_embedding: str,
    ) -> LikenessBatchResult:
        """Check likeness for all illustrations in the book.

        Args:
            illustrations: List of illustration dicts, each containing a
                "face_embedding" key with the embedding ref.
            original_embedding: The original child face embedding ref.

        Returns:
            LikenessBatchResult with per-page results and aggregated scores.
        """
        start = time.perf_counter()
        results: list[LikenessResult] = []
        pages_repair: list[int] = []
        pages_regen: list[int] = []

        for i, illust in enumerate(illustrations):
            face_emb = illust.get("face_embedding", "")
            page_num = illust.get("page_number", i + 1)

            result = await self.check_likeness(
                face_emb,
                original_embedding,
                page_number=page_num,
            )
            results.append(result)

            if result.action == LikenessAction.REPAIR:
                pages_repair.append(page_num)
            elif result.action == LikenessAction.REGENERATE:
                pages_regen.append(page_num)

        # Overall score: average of valid similarities
        valid_sims = [r.similarity for r in results if r.similarity > 0]
        overall_score = sum(valid_sims) / len(valid_sims) if valid_sims else 0.0

        all_passed = all(r.passed for r in results)
        elapsed = (time.perf_counter() - start) * 1000

        return LikenessBatchResult(
            passed=all_passed,
            overall_score=overall_score * 100,  # Convert to 0-100 scale
            results=results,
            pages_needing_repair=pages_repair,
            pages_needing_regen=pages_regen,
            check_duration_ms=elapsed,
        )

    @staticmethod
    def compute_local_similarity(
        embedding_a: list[float],
        embedding_b: list[float],
    ) -> float:
        """Compute cosine similarity locally without making an API call.

        Useful for quick pre-checks when embeddings are available as vectors.

        Args:
            embedding_a: First embedding vector.
            embedding_b: Second embedding vector.

        Returns:
            Cosine similarity score.
        """
        return cosine_similarity(embedding_a, embedding_b)
