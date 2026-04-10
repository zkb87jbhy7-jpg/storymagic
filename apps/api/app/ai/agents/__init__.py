"""
StoryMagic AI Agents — Multi-agent system for book generation.

Spec ref: Chapter 5 — 15 agents orchestrated by LangGraph on Temporal.io.
"""

from .base_agent import AgentResult, BaseAgent
from .story_architect import StoryArchitectAgent
from .hebrew_poet import HebrewPoetAgent
from .age_adaptation import AgeAdaptationAgent
from .art_director import ArtDirectorAgent
from .emotional_tone import EmotionalToneAgent
from .illustration_layout import IllustrationLayoutAgent
from .quality_critic import QualityCriticAgent
from .consistency_guardian import ConsistencyGuardianAgent
from .parental_guidance import ParentalGuidanceAgent
from .cultural_sensitivity import CulturalSensitivityAgent
from .bilingual_adaptation import BilingualAdaptationAgent
from .accessibility_adaptation import AccessibilityAdaptationAgent
from .narration_director import NarrationDirectorAgent
from .illustration_repair import IllustrationRepairAgent
from .recommendation import RecommendationAgent

__all__ = [
    # Base
    "AgentResult",
    "BaseAgent",
    # A-01 through A-15
    "StoryArchitectAgent",
    "HebrewPoetAgent",
    "AgeAdaptationAgent",
    "ArtDirectorAgent",
    "EmotionalToneAgent",
    "IllustrationLayoutAgent",
    "QualityCriticAgent",
    "ConsistencyGuardianAgent",
    "ParentalGuidanceAgent",
    "CulturalSensitivityAgent",
    "BilingualAdaptationAgent",
    "AccessibilityAdaptationAgent",
    "NarrationDirectorAgent",
    "IllustrationRepairAgent",
    "RecommendationAgent",
]
