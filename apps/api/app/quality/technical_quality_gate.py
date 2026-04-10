"""Technical Quality Gate — Layer L-02 of the quality pipeline.

Spec ref: Ch6.2 — TechnicalQualityGate runs on every illustration.
Checks minimum dimensions (1024x1024 for print quality), blur detection
via Laplacian variance, and anomaly detection via vision API.
"""

from __future__ import annotations

import io
import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

import numpy as np
from PIL import Image

logger = logging.getLogger("storymagic.quality.technical_quality_gate")


class TechnicalIssueType(Enum):
    """Types of technical quality issues."""
    DIMENSION_TOO_SMALL = "dimension_too_small"
    WRONG_ASPECT_RATIO = "wrong_aspect_ratio"
    BLURRY = "blurry"
    ANOMALY_DETECTED = "anomaly_detected"


class TechnicalIssueSeverity(Enum):
    """Severity of technical issues."""
    PASS = "pass"
    WARNING = "warning"
    FAIL = "fail"


@dataclass
class TechnicalIssue:
    """A single technical quality issue."""
    issue_type: TechnicalIssueType
    severity: TechnicalIssueSeverity
    description: str
    measured_value: float | str = ""
    threshold: float | str = ""


@dataclass
class TechnicalQualityResult:
    """Result of a TechnicalQualityGate check on a single illustration."""
    passed: bool
    issues: list[TechnicalIssue] = field(default_factory=list)
    dimensions_ok: bool = True
    blur_ok: bool = True
    anomalies_ok: bool = True
    width: int = 0
    height: int = 0
    blur_score: float = 0.0
    anomaly_details: list[str] = field(default_factory=list)
    check_duration_ms: float = 0.0


# ── Configuration ──────────────────────────────────────────────────────

MIN_PRINT_WIDTH = 1024
MIN_PRINT_HEIGHT = 1024
LAPLACIAN_BLUR_THRESHOLD = 100.0  # Variance below this = blurry
ASPECT_RATIO_TOLERANCE = 0.05  # 5% deviation allowed


def _compute_laplacian_variance(image_data: bytes) -> float:
    """Compute the Laplacian variance of an image as a blur metric.

    The Laplacian highlights rapid intensity changes (edges). A low variance
    of the Laplacian means the image lacks sharp edges — i.e., it is blurry.

    Args:
        image_data: Raw image bytes (PNG, JPEG, etc.).

    Returns:
        The variance of the Laplacian filter response. Higher = sharper.
    """
    img = Image.open(io.BytesIO(image_data)).convert("L")
    arr = np.array(img, dtype=np.float64)

    # 3x3 Laplacian kernel
    kernel = np.array([
        [0,  1, 0],
        [1, -4, 1],
        [0,  1, 0],
    ], dtype=np.float64)

    # Manual convolution (avoids OpenCV dependency)
    h, w = arr.shape
    if h < 3 or w < 3:
        return 0.0

    padded = np.pad(arr, 1, mode="reflect")
    laplacian = np.zeros_like(arr)

    for dy in range(3):
        for dx in range(3):
            laplacian += padded[dy:dy+h, dx:dx+w] * kernel[dy, dx]

    return float(np.var(laplacian))


class TechnicalQualityGate:
    """Technical quality gate for illustration images.

    Checks:
    1. Dimensions: minimum 1024x1024 for print quality.
    2. Blur: Laplacian variance must exceed threshold.
    3. Anomalies: Vision API check for anatomical issues.

    Usage:
        gate = TechnicalQualityGate()
        result = gate.check_dimensions(1024, 1024)
        result = gate.check_blur(image_bytes)
        result = await gate.check_anomalies(image_url)
    """

    def check_dimensions(
        self,
        width: int,
        height: int,
        expected_aspect_ratio: float | None = None,
    ) -> TechnicalQualityResult:
        """Check if image dimensions meet minimum requirements.

        Args:
            width: Image width in pixels.
            height: Image height in pixels.
            expected_aspect_ratio: Expected width/height ratio (e.g., 1.0 for square).

        Returns:
            TechnicalQualityResult with dimensions_ok status.
        """
        start = time.perf_counter()
        issues: list[TechnicalIssue] = []
        dimensions_ok = True

        if width < MIN_PRINT_WIDTH or height < MIN_PRINT_HEIGHT:
            dimensions_ok = False
            issues.append(TechnicalIssue(
                issue_type=TechnicalIssueType.DIMENSION_TOO_SMALL,
                severity=TechnicalIssueSeverity.FAIL,
                description=(
                    f"Image dimensions {width}x{height} below minimum "
                    f"{MIN_PRINT_WIDTH}x{MIN_PRINT_HEIGHT} for print quality"
                ),
                measured_value=f"{width}x{height}",
                threshold=f"{MIN_PRINT_WIDTH}x{MIN_PRINT_HEIGHT}",
            ))

        if expected_aspect_ratio is not None and height > 0:
            actual_ratio = width / height
            deviation = abs(actual_ratio - expected_aspect_ratio) / expected_aspect_ratio
            if deviation > ASPECT_RATIO_TOLERANCE:
                dimensions_ok = False
                issues.append(TechnicalIssue(
                    issue_type=TechnicalIssueType.WRONG_ASPECT_RATIO,
                    severity=TechnicalIssueSeverity.FAIL,
                    description=(
                        f"Aspect ratio {actual_ratio:.3f} deviates {deviation:.1%} "
                        f"from expected {expected_aspect_ratio:.3f}"
                    ),
                    measured_value=actual_ratio,
                    threshold=expected_aspect_ratio,
                ))

        elapsed = (time.perf_counter() - start) * 1000
        return TechnicalQualityResult(
            passed=dimensions_ok and not issues,
            issues=issues,
            dimensions_ok=dimensions_ok,
            blur_ok=True,
            anomalies_ok=True,
            width=width,
            height=height,
            check_duration_ms=elapsed,
        )

    def check_blur(
        self,
        image_data: bytes,
        threshold: float = LAPLACIAN_BLUR_THRESHOLD,
    ) -> TechnicalQualityResult:
        """Check if an image is blurry using Laplacian variance.

        Args:
            image_data: Raw image bytes.
            threshold: Minimum acceptable Laplacian variance.

        Returns:
            TechnicalQualityResult with blur_ok status and blur_score.
        """
        start = time.perf_counter()
        issues: list[TechnicalIssue] = []

        try:
            # Get dimensions
            img = Image.open(io.BytesIO(image_data))
            width, height = img.size

            # Compute blur metric
            blur_score = _compute_laplacian_variance(image_data)
            blur_ok = blur_score >= threshold

            if not blur_ok:
                issues.append(TechnicalIssue(
                    issue_type=TechnicalIssueType.BLURRY,
                    severity=TechnicalIssueSeverity.FAIL,
                    description=(
                        f"Image blur score {blur_score:.1f} below threshold {threshold:.1f}"
                    ),
                    measured_value=blur_score,
                    threshold=threshold,
                ))

        except Exception as exc:
            logger.error("Blur check failed: %s", exc)
            blur_ok = False
            blur_score = 0.0
            width = 0
            height = 0
            issues.append(TechnicalIssue(
                issue_type=TechnicalIssueType.BLURRY,
                severity=TechnicalIssueSeverity.FAIL,
                description=f"Blur check failed: {exc}",
            ))

        elapsed = (time.perf_counter() - start) * 1000
        return TechnicalQualityResult(
            passed=blur_ok,
            issues=issues,
            dimensions_ok=True,
            blur_ok=blur_ok,
            anomalies_ok=True,
            width=width,
            height=height,
            blur_score=blur_score,
            check_duration_ms=elapsed,
        )

    async def check_anomalies(
        self,
        image_url: str,
    ) -> TechnicalQualityResult:
        """Check for anatomical anomalies via vision API.

        Spec: Anomaly detection via Gemini Vision API or equivalent that checks
        "Are there anatomical anomalies such as extra fingers, distorted hands,
        asymmetric eyes? PASS or FAIL with description."

        Args:
            image_url: URL of the illustration to check.

        Returns:
            TechnicalQualityResult with anomalies_ok status and details.
        """
        start = time.perf_counter()
        issues: list[TechnicalIssue] = []
        anomaly_details: list[str] = []

        try:
            from app.ai.providers.base import GenerationOptions
            from app.ai.providers.registry import ProviderRegistry
            from app.ai.providers.router import AIRouter

            router = AIRouter(ProviderRegistry())

            system_prompt = (
                "You are a quality inspector for children's book illustrations. "
                "Examine this illustration carefully for anatomical anomalies: "
                "extra fingers, missing fingers, distorted hands, asymmetric eyes, "
                "extra limbs, disproportionate body parts, floating objects that "
                "shouldn't float, text artifacts, watermarks, or any visual defects. "
                "Return JSON: {passed: bool, anomalies: [{type, description, severity}]}."
            )
            user_prompt = f"Image URL: {image_url}\nCheck for anatomical anomalies."

            result = await router.generate_structured(
                user_prompt,
                system_prompt,
                {
                    "type": "object",
                    "properties": {
                        "passed": {"type": "boolean"},
                        "anomalies": {
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
                GenerationOptions(max_tokens=1024, temperature=0.1),
            )

            anomalies_ok = result.get("passed", True)
            for anomaly in result.get("anomalies", []):
                anomaly_details.append(anomaly.get("description", ""))
                issues.append(TechnicalIssue(
                    issue_type=TechnicalIssueType.ANOMALY_DETECTED,
                    severity=(
                        TechnicalIssueSeverity.FAIL
                        if anomaly.get("severity") == "critical"
                        else TechnicalIssueSeverity.WARNING
                    ),
                    description=anomaly.get("description", "Anomaly detected"),
                    measured_value=anomaly.get("type", "unknown"),
                ))

        except Exception as exc:
            logger.error("Anomaly check failed: %s", exc)
            anomalies_ok = True  # Fail-open: don't block on API failure
            anomaly_details.append(f"Anomaly check failed: {exc}")

        elapsed = (time.perf_counter() - start) * 1000
        has_failures = any(i.severity == TechnicalIssueSeverity.FAIL for i in issues)

        return TechnicalQualityResult(
            passed=anomalies_ok and not has_failures,
            issues=issues,
            dimensions_ok=True,
            blur_ok=True,
            anomalies_ok=anomalies_ok,
            anomaly_details=anomaly_details,
            check_duration_ms=elapsed,
        )

    async def run_all_checks(
        self,
        image_data: bytes | None,
        image_url: str,
        width: int,
        height: int,
        expected_aspect_ratio: float | None = None,
    ) -> TechnicalQualityResult:
        """Run all technical quality checks on an illustration.

        Combines dimension, blur, and anomaly checks into a single result.

        Args:
            image_data: Raw image bytes (for blur check). Can be None to skip blur.
            image_url: URL of the illustration (for anomaly check).
            width: Image width.
            height: Image height.
            expected_aspect_ratio: Expected aspect ratio (optional).

        Returns:
            Combined TechnicalQualityResult.
        """
        start = time.perf_counter()
        all_issues: list[TechnicalIssue] = []

        # Check dimensions
        dim_result = self.check_dimensions(width, height, expected_aspect_ratio)
        all_issues.extend(dim_result.issues)

        # Check blur (only if image data is available)
        blur_ok = True
        blur_score = 0.0
        if image_data is not None:
            blur_result = self.check_blur(image_data)
            all_issues.extend(blur_result.issues)
            blur_ok = blur_result.blur_ok
            blur_score = blur_result.blur_score

        # Check anomalies
        anomaly_result = await self.check_anomalies(image_url)
        all_issues.extend(anomaly_result.issues)

        elapsed = (time.perf_counter() - start) * 1000
        has_failures = any(i.severity == TechnicalIssueSeverity.FAIL for i in all_issues)

        return TechnicalQualityResult(
            passed=not has_failures,
            issues=all_issues,
            dimensions_ok=dim_result.dimensions_ok,
            blur_ok=blur_ok,
            anomalies_ok=anomaly_result.anomalies_ok,
            width=width,
            height=height,
            blur_score=blur_score,
            anomaly_details=anomaly_result.anomaly_details,
            check_duration_ms=elapsed,
        )
