"""Quality control layers for StoryMagic book generation.

Spec ref: Ch6 — Four quality gates chained in sequence.
"""

from app.quality.consistency_gate import ConsistencyGate, ConsistencyResult
from app.quality.likeness_gate import LikenessGate, LikenessResult
from app.quality.pipeline import QualityPipeline, QualityPipelineResult
from app.quality.safety_gate import SafetyGate, SafetyGateResult
from app.quality.technical_quality_gate import TechnicalQualityGate, TechnicalQualityResult

__all__ = [
    "SafetyGate",
    "SafetyGateResult",
    "TechnicalQualityGate",
    "TechnicalQualityResult",
    "ConsistencyGate",
    "ConsistencyResult",
    "LikenessGate",
    "LikenessResult",
    "QualityPipeline",
    "QualityPipelineResult",
]
