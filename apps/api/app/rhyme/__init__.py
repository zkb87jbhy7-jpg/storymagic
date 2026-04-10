"""
Hebrew rhyme system for StoryMagic.

Provides a 200+ pair rhyme dictionary, validation, and RAG retrieval
for the Hebrew Poet agent (A-02).
"""

from .hebrew_dictionary import RhymePair, get_all_pairs, get_pairs_by_ending, get_pairs_by_topic
from .rhyme_rag import RhymeRAG
from .rhyme_validator import RhymeValidator

__all__ = [
    "RhymePair",
    "RhymeRAG",
    "RhymeValidator",
    "get_all_pairs",
    "get_pairs_by_ending",
    "get_pairs_by_topic",
]
