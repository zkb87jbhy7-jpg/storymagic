"""Quality Pipeline — Chains all four quality layers in sequence.

Spec ref: Ch6.5 — The QualityPipeline chains all layers in sequence:
1. SafetyGate on text — failure causes immediate halt (critical failure).
2. TechnicalQualityGate on each illustration — failure marks for repair/regen.
3. LikenessGate on each illustration — failure marks for repair/regen.
4. ConsistencyGate on the complete book — runs after all pages processed.
Results are stored as book events.
"""

from __future__ import annotations

import logging
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from app.quality.consistency_gate import ConsistencyGate, ConsistencyResult
from app.quality.likeness_gate import LikenessAction, LikenessBatchResult, LikenessGate
from app.quality.safety_gate import RiskLevel, SafetyGate, SafetyGateResult
from app.quality.technical_quality_gate import TechnicalQualityGate, TechnicalQualityResult

logger = logging.getLogger("storymagic.quality.pipeline")


class PipelineStatus(Enum):
    """Overall pipeline execution status."""
    PASSED = "passed"
    PASSED_WITH_WARNINGS = "passed_with_warnings"
    FAILED_SAFETY = "failed_safety"
    FAILED_QUALITY = "failed_quality"
    NEEDS_REPAIR = "needs_repair"
    NEEDS_REGENERATION = "needs_regeneration"


@dataclass
class IllustrationQualityResult:
    """Combined quality result for a single illustration."""
    page_number: int
    technical: TechnicalQualityResult | None = None
    likeness: Any = None  # LikenessResult (avoid circular for typing)
    passed: bool = True
    needs_repair: bool = False
    needs_regeneration: bool = False
    issues: list[str] = field(default_factory=list)


@dataclass
class QualityPipelineResult:
    """Complete result of the quality pipeline across all content."""
    status: PipelineStatus
    safety: SafetyGateResult | None = None
    illustration_results: list[IllustrationQualityResult] = field(default_factory=list)
    likeness_batch: LikenessBatchResult | None = None
    consistency: ConsistencyResult | None = None
    pages_needing_repair: list[int] = field(default_factory=list)
    pages_needing_regeneration: list[int] = field(default_factory=list)
    overall_score: float = 0.0
    total_duration_ms: float = 0.0
    halted: bool = False
    halt_reason: str = ""
    event_ids: list[str] = field(default_factory=list)


class QualityPipeline:
    """Orchestrates the four quality gates in the correct sequence.

    Execution order:
    1. SafetyGate (text) -- fail = immediate halt, no further processing.
    2. TechnicalQualityGate (per illustration) -- fail = mark for repair/regen.
    3. LikenessGate (per illustration) -- fail = mark for repair/regen.
    4. ConsistencyGate (whole book) -- runs last after all pages.

    Usage:
        pipeline = QualityPipeline()
        result = await pipeline.run(
            text=["page 1 text", "page 2 text"],
            illustrations=[{...}, {...}],
            face_embedding="emb_ref_123",
            child_age=4,
            language="he",
            illustration_prompts=["prompt 1", "prompt 2"],
        )
    """

    def __init__(self) -> None:
        self.safety_gate = SafetyGate()
        self.technical_gate = TechnicalQualityGate()
        self.likeness_gate = LikenessGate()
        self.consistency_gate = ConsistencyGate()

    async def run(
        self,
        text: list[str],
        illustrations: list[dict[str, Any]],
        face_embedding: str = "",
        child_age: int = 4,
        language: str = "he",
        illustration_prompts: list[str] | None = None,
        book_id: str = "",
        image_data_map: dict[int, bytes] | None = None,
    ) -> QualityPipelineResult:
        """Execute the full quality pipeline.

        Args:
            text: List of page texts (one per page).
            illustrations: List of illustration dicts per page, each containing
                at minimum: image_url, width, height, and optionally face_embedding.
            face_embedding: Original child face embedding reference.
            child_age: Target child's age for safety calibration.
            language: Primary language ("en" or "he").
            illustration_prompts: Prompts used for illustrations (for consistency check).
            book_id: Book ID for event logging.
            image_data_map: Optional mapping of page_index -> raw image bytes for blur check.

        Returns:
            QualityPipelineResult with all layer results and overall status.
        """
        start = time.perf_counter()
        event_ids: list[str] = []
        prompts = illustration_prompts or []
        img_data = image_data_map or {}

        # ── Layer 1: Safety Gate ────────────────────────────────────────
        logger.info("Quality Pipeline Layer 1: Safety Gate (book_id=%s)", book_id)

        combined_text = "\n\n".join(text)
        safety_result = await self.safety_gate.check_text(
            combined_text,
            age=child_age,
            language=language,
        )

        # Log safety event
        safety_event_id = await self._log_event(
            book_id,
            "quality_safety_gate",
            {
                "passed": safety_result.passed,
                "risk_level": safety_result.risk_level.value,
                "findings_count": len(safety_result.findings),
                "blocked": safety_result.blocked,
                "duration_ms": safety_result.check_duration_ms,
            },
        )
        if safety_event_id:
            event_ids.append(safety_event_id)

        # CRITICAL: Safety failure = immediate halt
        if not safety_result.passed:
            elapsed = (time.perf_counter() - start) * 1000
            logger.warning(
                "Quality Pipeline HALTED: Safety gate failed (book_id=%s, risk=%s)",
                book_id,
                safety_result.risk_level.value,
            )
            return QualityPipelineResult(
                status=PipelineStatus.FAILED_SAFETY,
                safety=safety_result,
                overall_score=0.0,
                total_duration_ms=elapsed,
                halted=True,
                halt_reason=f"Safety gate failed: {safety_result.risk_level.value} risk, {len(safety_result.findings)} findings",
                event_ids=event_ids,
            )

        # ── Layer 2: Technical Quality Gate (per illustration) ──────────
        logger.info("Quality Pipeline Layer 2: Technical Quality Gate")

        illustration_results: list[IllustrationQualityResult] = []
        pages_repair: list[int] = []
        pages_regen: list[int] = []

        for i, illust in enumerate(illustrations):
            page_num = illust.get("page_number", i + 1)
            width = illust.get("width", 0)
            height = illust.get("height", 0)
            image_url = illust.get("image_url", "")
            page_img_data = img_data.get(i)

            tech_result = await self.technical_gate.run_all_checks(
                image_data=page_img_data,
                image_url=image_url,
                width=width,
                height=height,
            )

            illust_result = IllustrationQualityResult(
                page_number=page_num,
                technical=tech_result,
                passed=tech_result.passed,
            )

            if not tech_result.passed:
                illust_result.needs_repair = True
                illust_result.issues.extend(
                    issue.description for issue in tech_result.issues
                )
                pages_repair.append(page_num)

            illustration_results.append(illust_result)

        # Log technical quality event
        tech_event_id = await self._log_event(
            book_id,
            "quality_technical_gate",
            {
                "total_illustrations": len(illustrations),
                "passed": len([r for r in illustration_results if r.passed]),
                "failed": len([r for r in illustration_results if not r.passed]),
                "pages_needing_repair": pages_repair,
            },
        )
        if tech_event_id:
            event_ids.append(tech_event_id)

        # ── Layer 3: Likeness Gate (per illustration) ───────────────────
        logger.info("Quality Pipeline Layer 3: Likeness Gate")

        likeness_batch: LikenessBatchResult | None = None
        if face_embedding:
            likeness_batch = await self.likeness_gate.check_all(
                illustrations,
                face_embedding,
            )

            # Merge likeness results into illustration results
            for lr in likeness_batch.results:
                page_idx = lr.page_number - 1
                if 0 <= page_idx < len(illustration_results):
                    illustration_results[page_idx].likeness = lr
                    if not lr.passed:
                        illustration_results[page_idx].passed = False
                        illustration_results[page_idx].issues.append(
                            f"Likeness score {lr.similarity:.2f} below threshold {lr.threshold}"
                        )
                        if lr.action == LikenessAction.REPAIR:
                            illustration_results[page_idx].needs_repair = True
                            if lr.page_number not in pages_repair:
                                pages_repair.append(lr.page_number)
                        elif lr.action == LikenessAction.REGENERATE:
                            illustration_results[page_idx].needs_regeneration = True
                            pages_regen.append(lr.page_number)
                            # Regen supersedes repair
                            if lr.page_number in pages_repair:
                                pages_repair.remove(lr.page_number)

            # Log likeness event
            likeness_event_id = await self._log_event(
                book_id,
                "quality_likeness_gate",
                {
                    "overall_score": likeness_batch.overall_score,
                    "passed": likeness_batch.passed,
                    "pages_repair": likeness_batch.pages_needing_repair,
                    "pages_regen": likeness_batch.pages_needing_regen,
                },
            )
            if likeness_event_id:
                event_ids.append(likeness_event_id)

        # ── Layer 4: Consistency Gate (whole book) ──────────────────────
        logger.info("Quality Pipeline Layer 4: Consistency Gate")

        face_embeddings = [
            illust.get("face_embedding", "")
            for illust in illustrations
        ]

        consistency_result = await self.consistency_gate.run_all_checks(
            illustration_prompts=prompts,
            illustrations=illustrations,
            face_embeddings=face_embeddings if face_embedding else None,
        )

        # Log consistency event
        consistency_event_id = await self._log_event(
            book_id,
            "quality_consistency_gate",
            {
                "overall_score": consistency_result.overall_score,
                "character_score": consistency_result.character_consistency_score,
                "style_score": consistency_result.style_consistency_score,
                "color_score": consistency_result.color_consistency_score,
                "face_score": consistency_result.face_consistency_score,
                "passed": consistency_result.passed,
                "issues_count": len(consistency_result.issues),
            },
        )
        if consistency_event_id:
            event_ids.append(consistency_event_id)

        # ── Determine overall status ────────────────────────────────────
        elapsed = (time.perf_counter() - start) * 1000

        # Compute overall score (weighted)
        safety_score = 100.0 if safety_result.passed else 0.0
        tech_score = (
            sum(100.0 if r.passed else 0.0 for r in illustration_results)
            / max(len(illustration_results), 1)
        )
        likeness_score = likeness_batch.overall_score if likeness_batch else 100.0
        consistency_score = consistency_result.overall_score

        overall_score = (
            safety_score * 0.30
            + tech_score * 0.25
            + likeness_score * 0.25
            + consistency_score * 0.20
        )

        # Determine status
        if pages_regen:
            status = PipelineStatus.NEEDS_REGENERATION
        elif pages_repair:
            status = PipelineStatus.NEEDS_REPAIR
        elif any(not r.passed for r in illustration_results) or not consistency_result.passed:
            status = PipelineStatus.FAILED_QUALITY
        elif (
            safety_result.findings
            or consistency_result.issues
            or any(r.issues for r in illustration_results)
        ):
            status = PipelineStatus.PASSED_WITH_WARNINGS
        else:
            status = PipelineStatus.PASSED

        logger.info(
            "Quality Pipeline complete: status=%s score=%.1f duration=%.0fms (book_id=%s)",
            status.value,
            overall_score,
            elapsed,
            book_id,
        )

        return QualityPipelineResult(
            status=status,
            safety=safety_result,
            illustration_results=illustration_results,
            likeness_batch=likeness_batch,
            consistency=consistency_result,
            pages_needing_repair=pages_repair,
            pages_needing_regeneration=pages_regen,
            overall_score=overall_score,
            total_duration_ms=elapsed,
            halted=False,
            event_ids=event_ids,
        )

    @staticmethod
    async def _log_event(
        book_id: str,
        event_type: str,
        payload: dict[str, Any],
    ) -> str:
        """Log a quality pipeline event to the event store.

        Returns the event ID string, or empty string on failure.
        """
        if not book_id:
            return ""

        try:
            from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
            from sqlalchemy.orm import sessionmaker

            from app.config import get_settings
            from app.utils.events import log_event

            settings = get_settings()
            engine = create_async_engine(settings.database_url, echo=False)
            async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

            async with async_session() as session:
                event_id = await log_event(
                    session,
                    book_id=uuid.UUID(book_id),
                    event_type=event_type,
                    payload=payload,
                )
                await session.commit()

            await engine.dispose()
            return str(event_id)

        except Exception as exc:
            logger.error("Failed to log quality event %s: %s", event_type, exc)
            return ""
