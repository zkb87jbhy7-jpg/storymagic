"""Consistency Gate — Layer L-03 of the quality pipeline.

Spec ref: Ch6.3 — ConsistencyGate runs on all book pages together.
Extracts character descriptions from every illustration prompt, compares
across pages, checks stylistic consistency, color palette consistency,
and runs Multi-Reference Consistency Check on face embeddings.
"""

from __future__ import annotations

import logging
import re
import time
from collections import Counter
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

logger = logging.getLogger("storymagic.quality.consistency_gate")


class ConsistencyIssueType(Enum):
    """Types of consistency issues."""
    CHARACTER_APPEARANCE = "character_appearance"
    STYLE_MISMATCH = "style_mismatch"
    COLOR_PALETTE = "color_palette"
    FACE_EMBEDDING = "face_embedding"


class ConsistencySeverity(Enum):
    """Severity of consistency issues."""
    INFO = "info"
    WARNING = "warning"
    FAILURE = "failure"


@dataclass
class ConsistencyIssue:
    """A single consistency issue found across pages."""
    issue_type: ConsistencyIssueType
    severity: ConsistencySeverity
    description: str
    pages_affected: list[int] = field(default_factory=list)
    details: dict[str, Any] = field(default_factory=dict)


@dataclass
class ConsistencyResult:
    """Result of a ConsistencyGate check across all book pages."""
    passed: bool
    overall_score: float  # 0-100
    character_consistency_score: float
    style_consistency_score: float
    color_consistency_score: float
    face_consistency_score: float
    issues: list[ConsistencyIssue] = field(default_factory=list)
    check_duration_ms: float = 0.0


# ── Character descriptor extraction patterns ──────────────────────────

# Common descriptors found in illustration prompts
HAIR_PATTERNS = re.compile(
    r"(?:hair|haired|curly|straight|wavy|braided|ponytail|pigtails|bald|"
    r"blonde|brunette|redhead|black hair|brown hair|red hair|"
    r"short hair|long hair|medium hair)",
    re.IGNORECASE,
)

CLOTHING_PATTERNS = re.compile(
    r"(?:wearing|dressed in|shirt|dress|pants|shorts|skirt|jacket|"
    r"coat|hat|cap|shoes|boots|sneakers|sandals|overalls|"
    r"red\s+\w+|blue\s+\w+|green\s+\w+|yellow\s+\w+|"
    r"striped|polka dot|plaid|uniform)",
    re.IGNORECASE,
)

ACCESSORY_PATTERNS = re.compile(
    r"(?:glasses|backpack|crown|necklace|bracelet|watch|ribbon|"
    r"bow|scarf|belt|bag|wand|cape|wings|tiara|helmet|"
    r"headband|earrings|pendant)",
    re.IGNORECASE,
)

STYLE_KEYWORDS = frozenset({
    "watercolor", "oil painting", "digital art", "cartoon", "anime",
    "realistic", "pastel", "crayon", "pencil", "storybook",
    "flat illustration", "3d render", "vector", "soft", "vibrant",
    "muted", "warm", "cool", "bright", "dark", "whimsical",
    "dreamy", "magical", "playful", "gentle", "bold",
})

COLOR_PATTERN = re.compile(
    r"\b(?:red|blue|green|yellow|orange|purple|pink|brown|black|white|"
    r"grey|gray|gold|silver|turquoise|teal|navy|crimson|scarlet|"
    r"magenta|coral|peach|lavender|mint|sage|ivory|cream|"
    r"amber|indigo|maroon|olive|cyan|beige|tan|chartreuse)\b",
    re.IGNORECASE,
)


def _extract_descriptors(prompt: str, pattern: re.Pattern) -> list[str]:
    """Extract all matching descriptors from a prompt."""
    return [m.group().lower().strip() for m in pattern.finditer(prompt)]


def _extract_style_keywords(prompt: str) -> set[str]:
    """Extract style keywords from a prompt."""
    prompt_lower = prompt.lower()
    found: set[str] = set()
    for kw in STYLE_KEYWORDS:
        if kw in prompt_lower:
            found.add(kw)
    return found


def _extract_colors(prompt: str) -> list[str]:
    """Extract color references from a prompt."""
    return [m.group().lower() for m in COLOR_PATTERN.finditer(prompt)]


class ConsistencyGate:
    """Cross-book consistency checker for illustrations and prompts.

    Checks four dimensions of consistency:
    1. Character appearance: same hair, clothing, accessories across pages.
    2. Style: same art style keywords throughout.
    3. Color palette: harmonious and consistent color usage.
    4. Face embeddings: same face across all illustrations.

    Usage:
        gate = ConsistencyGate()
        result = gate.check_character_consistency(prompts)
        result = gate.check_style_consistency(prompts)
        result = gate.check_color_palette(illustrations)
        result = await gate.multi_reference_check(embeddings)
    """

    def check_character_consistency(
        self,
        illustration_prompts: list[str],
    ) -> ConsistencyResult:
        """Check that character descriptions are consistent across pages.

        Extracts hair, clothing, and accessory descriptors from each prompt
        and flags changes between pages.
        """
        start = time.perf_counter()
        issues: list[ConsistencyIssue] = []

        if len(illustration_prompts) < 2:
            elapsed = (time.perf_counter() - start) * 1000
            return ConsistencyResult(
                passed=True,
                overall_score=100.0,
                character_consistency_score=100.0,
                style_consistency_score=100.0,
                color_consistency_score=100.0,
                face_consistency_score=100.0,
                check_duration_ms=elapsed,
            )

        # Extract descriptors per page
        page_hair: list[list[str]] = []
        page_clothing: list[list[str]] = []
        page_accessories: list[list[str]] = []

        for prompt in illustration_prompts:
            page_hair.append(_extract_descriptors(prompt, HAIR_PATTERNS))
            page_clothing.append(_extract_descriptors(prompt, CLOTHING_PATTERNS))
            page_accessories.append(_extract_descriptors(prompt, ACCESSORY_PATTERNS))

        # Check hair consistency (should be same across all pages)
        hair_sets = [frozenset(h) for h in page_hair if h]
        if len(set(hair_sets)) > 1:
            differing_pages = [
                i + 1 for i in range(1, len(hair_sets))
                if hair_sets[i] != hair_sets[0]
            ]
            if differing_pages:
                issues.append(ConsistencyIssue(
                    issue_type=ConsistencyIssueType.CHARACTER_APPEARANCE,
                    severity=ConsistencySeverity.WARNING,
                    description="Character hair description changes between pages",
                    pages_affected=differing_pages,
                    details={
                        "reference": list(hair_sets[0]) if hair_sets else [],
                        "variations": {
                            p: list(page_hair[p - 1])
                            for p in differing_pages
                            if p - 1 < len(page_hair)
                        },
                    },
                ))

        # Check for major clothing changes (some changes are expected for different scenes)
        # But core items should remain consistent
        all_clothing = [set(c) for c in page_clothing if c]
        if len(all_clothing) > 1:
            # Find the most common clothing items across pages
            all_items: list[str] = []
            for c in page_clothing:
                all_items.extend(c)
            common_items = Counter(all_items)
            expected_items = {
                item for item, count in common_items.items()
                if count >= len(illustration_prompts) * 0.5  # present in 50%+ of pages
            }

            for i, clothing in enumerate(page_clothing):
                missing = expected_items - set(clothing)
                if missing and clothing:  # only flag if the page has some clothing description
                    issues.append(ConsistencyIssue(
                        issue_type=ConsistencyIssueType.CHARACTER_APPEARANCE,
                        severity=ConsistencySeverity.INFO,
                        description=f"Page {i+1} missing common clothing items",
                        pages_affected=[i + 1],
                        details={"missing_items": list(missing)},
                    ))

        # Score: deduct points for issues
        deduction = len([i for i in issues if i.severity == ConsistencySeverity.FAILURE]) * 25
        deduction += len([i for i in issues if i.severity == ConsistencySeverity.WARNING]) * 10
        deduction += len([i for i in issues if i.severity == ConsistencySeverity.INFO]) * 3
        score = max(0.0, 100.0 - deduction)

        elapsed = (time.perf_counter() - start) * 1000
        return ConsistencyResult(
            passed=score >= 60.0,
            overall_score=score,
            character_consistency_score=score,
            style_consistency_score=100.0,
            color_consistency_score=100.0,
            face_consistency_score=100.0,
            issues=issues,
            check_duration_ms=elapsed,
        )

    def check_style_consistency(
        self,
        illustration_prompts: list[str],
    ) -> ConsistencyResult:
        """Check that style keywords are consistent across pages.

        All pages should use the same art style (watercolor, digital, etc.).
        """
        start = time.perf_counter()
        issues: list[ConsistencyIssue] = []

        if len(illustration_prompts) < 2:
            elapsed = (time.perf_counter() - start) * 1000
            return ConsistencyResult(
                passed=True,
                overall_score=100.0,
                character_consistency_score=100.0,
                style_consistency_score=100.0,
                color_consistency_score=100.0,
                face_consistency_score=100.0,
                check_duration_ms=elapsed,
            )

        page_styles = [_extract_style_keywords(p) for p in illustration_prompts]

        # Find the "reference" style (most common set of keywords)
        if page_styles:
            reference_style = page_styles[0]
        else:
            reference_style = set()

        mismatched_pages: list[int] = []
        for i, style in enumerate(page_styles[1:], start=2):
            if style and reference_style and style != reference_style:
                missing = reference_style - style
                extra = style - reference_style
                if missing or extra:
                    mismatched_pages.append(i)
                    issues.append(ConsistencyIssue(
                        issue_type=ConsistencyIssueType.STYLE_MISMATCH,
                        severity=ConsistencySeverity.WARNING,
                        description=f"Page {i} uses different style keywords than page 1",
                        pages_affected=[i],
                        details={
                            "reference_style": list(reference_style),
                            "page_style": list(style),
                            "missing": list(missing),
                            "extra": list(extra),
                        },
                    ))

        # Calculate consistency as Jaccard similarity between all page styles
        if len(page_styles) >= 2 and any(page_styles):
            all_keywords = set()
            for ps in page_styles:
                all_keywords.update(ps)
            if all_keywords:
                # Average Jaccard similarity
                similarities: list[float] = []
                for i in range(len(page_styles)):
                    for j in range(i + 1, len(page_styles)):
                        if page_styles[i] or page_styles[j]:
                            union = page_styles[i] | page_styles[j]
                            intersection = page_styles[i] & page_styles[j]
                            sim = len(intersection) / len(union) if union else 1.0
                            similarities.append(sim)
                avg_sim = sum(similarities) / len(similarities) if similarities else 1.0
                score = avg_sim * 100
            else:
                score = 100.0
        else:
            score = 100.0

        elapsed = (time.perf_counter() - start) * 1000
        return ConsistencyResult(
            passed=score >= 60.0,
            overall_score=score,
            character_consistency_score=100.0,
            style_consistency_score=score,
            color_consistency_score=100.0,
            face_consistency_score=100.0,
            issues=issues,
            check_duration_ms=elapsed,
        )

    def check_color_palette(
        self,
        illustrations: list[dict[str, Any]],
    ) -> ConsistencyResult:
        """Check color palette consistency across illustrations.

        Compares dominant colors extracted from illustration prompts
        to ensure a harmonious palette throughout the book.
        """
        start = time.perf_counter()
        issues: list[ConsistencyIssue] = []

        if len(illustrations) < 2:
            elapsed = (time.perf_counter() - start) * 1000
            return ConsistencyResult(
                passed=True,
                overall_score=100.0,
                character_consistency_score=100.0,
                style_consistency_score=100.0,
                color_consistency_score=100.0,
                face_consistency_score=100.0,
                check_duration_ms=elapsed,
            )

        # Extract colors from illustration data or prompts
        page_colors: list[list[str]] = []
        for illust in illustrations:
            prompt = illust.get("prompt", "")
            colors = _extract_colors(prompt)
            # Also check any metadata
            if "dominant_colors" in illust:
                colors.extend(illust["dominant_colors"])
            page_colors.append(colors)

        # Build a palette profile: which colors appear across pages
        all_colors: list[str] = []
        for pc in page_colors:
            all_colors.extend(pc)
        color_freq = Counter(all_colors)

        # The "book palette" is the set of colors appearing in 30%+ of pages
        pages_with_colors = len([pc for pc in page_colors if pc])
        if pages_with_colors == 0:
            score = 100.0
        else:
            palette_threshold = max(1, pages_with_colors * 0.3)
            book_palette = {
                c for c, count in color_freq.items()
                if count >= palette_threshold
            }

            # Check each page against the book palette
            off_palette_pages: list[int] = []
            for i, colors in enumerate(page_colors):
                if not colors:
                    continue
                page_set = set(colors)
                off_palette = page_set - book_palette
                if off_palette and len(off_palette) > len(page_set) * 0.5:
                    off_palette_pages.append(i + 1)
                    issues.append(ConsistencyIssue(
                        issue_type=ConsistencyIssueType.COLOR_PALETTE,
                        severity=ConsistencySeverity.INFO,
                        description=f"Page {i+1} uses colors outside the book's dominant palette",
                        pages_affected=[i + 1],
                        details={
                            "page_colors": list(page_set),
                            "book_palette": list(book_palette),
                            "off_palette": list(off_palette),
                        },
                    ))

            # Score based on how many pages stay within palette
            on_palette_ratio = 1.0 - (len(off_palette_pages) / max(pages_with_colors, 1))
            score = on_palette_ratio * 100

        elapsed = (time.perf_counter() - start) * 1000
        return ConsistencyResult(
            passed=score >= 60.0,
            overall_score=score,
            character_consistency_score=100.0,
            style_consistency_score=100.0,
            color_consistency_score=score,
            face_consistency_score=100.0,
            issues=issues,
            check_duration_ms=elapsed,
        )

    async def multi_reference_check(
        self,
        face_embeddings: list[str],
    ) -> ConsistencyResult:
        """Compare face embeddings across all illustrations.

        Spec: Multi-Reference Consistency Check comparing face embeddings
        across all illustrations against each other.

        Args:
            face_embeddings: List of embedding references (one per page).

        Returns:
            ConsistencyResult with face consistency score.
        """
        start = time.perf_counter()
        issues: list[ConsistencyIssue] = []

        # Filter out empty embeddings
        valid_embeddings = [
            (i, emb) for i, emb in enumerate(face_embeddings)
            if emb and emb.strip()
        ]

        if len(valid_embeddings) < 2:
            elapsed = (time.perf_counter() - start) * 1000
            return ConsistencyResult(
                passed=True,
                overall_score=100.0,
                character_consistency_score=100.0,
                style_consistency_score=100.0,
                color_consistency_score=100.0,
                face_consistency_score=100.0,
                check_duration_ms=elapsed,
            )

        try:
            from app.ai.providers.registry import ProviderRegistry
            from app.ai.providers.router import AIRouter

            router = AIRouter(ProviderRegistry())

            # Compare every pair of face embeddings
            similarities: list[float] = []
            low_similarity_pairs: list[tuple[int, int, float]] = []

            for i in range(len(valid_embeddings)):
                for j in range(i + 1, len(valid_embeddings)):
                    page_i, emb_i = valid_embeddings[i]
                    page_j, emb_j = valid_embeddings[j]

                    similarity = await router.compare_faces(emb_i, emb_j)
                    similarities.append(similarity)

                    if similarity < 0.75:
                        low_similarity_pairs.append(
                            (page_i + 1, page_j + 1, similarity)
                        )

            avg_similarity = sum(similarities) / len(similarities) if similarities else 1.0
            score = avg_similarity * 100

            for page_i, page_j, sim in low_similarity_pairs:
                issues.append(ConsistencyIssue(
                    issue_type=ConsistencyIssueType.FACE_EMBEDDING,
                    severity=ConsistencySeverity.WARNING if sim >= 0.6 else ConsistencySeverity.FAILURE,
                    description=(
                        f"Face similarity between page {page_i} and page {page_j} "
                        f"is {sim:.2f} (below 0.75 threshold)"
                    ),
                    pages_affected=[page_i, page_j],
                    details={"similarity": sim, "threshold": 0.75},
                ))

        except Exception as exc:
            logger.error("Multi-reference face check failed: %s", exc)
            score = 0.0
            issues.append(ConsistencyIssue(
                issue_type=ConsistencyIssueType.FACE_EMBEDDING,
                severity=ConsistencySeverity.WARNING,
                description=f"Face embedding comparison failed: {exc}",
            ))

        elapsed = (time.perf_counter() - start) * 1000
        return ConsistencyResult(
            passed=score >= 60.0,
            overall_score=score,
            character_consistency_score=100.0,
            style_consistency_score=100.0,
            color_consistency_score=100.0,
            face_consistency_score=score,
            issues=issues,
            check_duration_ms=elapsed,
        )

    async def run_all_checks(
        self,
        illustration_prompts: list[str],
        illustrations: list[dict[str, Any]],
        face_embeddings: list[str] | None = None,
    ) -> ConsistencyResult:
        """Run all consistency checks and combine results.

        Args:
            illustration_prompts: Prompts used for each page illustration.
            illustrations: Generated illustration data per page.
            face_embeddings: Optional face embeddings per page.

        Returns:
            Combined ConsistencyResult with all sub-scores.
        """
        start = time.perf_counter()

        # Run character and style checks (synchronous, fast)
        char_result = self.check_character_consistency(illustration_prompts)
        style_result = self.check_style_consistency(illustration_prompts)
        color_result = self.check_color_palette(illustrations)

        # Run face check (async, requires API calls)
        if face_embeddings:
            face_result = await self.multi_reference_check(face_embeddings)
        else:
            face_result = ConsistencyResult(
                passed=True,
                overall_score=100.0,
                character_consistency_score=100.0,
                style_consistency_score=100.0,
                color_consistency_score=100.0,
                face_consistency_score=100.0,
            )

        # Combine all issues
        all_issues = (
            char_result.issues
            + style_result.issues
            + color_result.issues
            + face_result.issues
        )

        # Weighted overall score
        overall = (
            char_result.character_consistency_score * 0.35
            + style_result.style_consistency_score * 0.25
            + color_result.color_consistency_score * 0.15
            + face_result.face_consistency_score * 0.25
        )

        elapsed = (time.perf_counter() - start) * 1000

        return ConsistencyResult(
            passed=overall >= 60.0,
            overall_score=overall,
            character_consistency_score=char_result.character_consistency_score,
            style_consistency_score=style_result.style_consistency_score,
            color_consistency_score=color_result.color_consistency_score,
            face_consistency_score=face_result.face_consistency_score,
            issues=all_issues,
            check_duration_ms=elapsed,
        )
