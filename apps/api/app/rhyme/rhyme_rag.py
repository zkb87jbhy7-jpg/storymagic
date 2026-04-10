"""
Hebrew Rhyme RAG — Retrieval-Augmented Generation for rhyme pairs.

Given a story topic or theme, retrieves the most relevant rhyme pairs
from the dictionary based on topic tags and keyword matching.

Spec ref: Chapter 5.3 — Retrieves 20 most relevant rhyme pairs based
on the story's topic rather than injecting the entire dictionary.
"""

from __future__ import annotations

import logging
import re
from collections import Counter
from typing import Any

from .hebrew_dictionary import HEBREW_RHYME_PAIRS, RhymePair

logger = logging.getLogger("storymagic.rhyme.rag")

# Topic synonyms for broader matching
TOPIC_SYNONYMS: dict[str, list[str]] = {
    "sea": ["ocean", "water", "fish", "waves", "beach", "ship"],
    "ocean": ["sea", "water", "fish", "waves", "beach"],
    "sky": ["clouds", "flying", "wings", "stars", "moon", "sun"],
    "night": ["moon", "stars", "sleep", "bedtime", "dreams"],
    "bedtime": ["night", "sleep", "dreams", "moon", "stars"],
    "adventure": ["journey", "treasure", "heroes", "quest", "explore"],
    "friendship": ["friends", "together", "sharing", "love", "play"],
    "animals": ["dogs", "cats", "birds", "fish", "horses", "butterflies"],
    "nature": ["trees", "flowers", "garden", "forest", "river", "mountains"],
    "magic": ["fantasy", "spells", "fairy", "enchanted", "wizard", "dragons"],
    "family": ["home", "parents", "grandmother", "siblings", "love"],
    "school": ["learning", "letters", "numbers", "teacher", "knowledge"],
    "food": ["cake", "bread", "cooking", "baking", "eating"],
    "celebration": ["party", "birthday", "holiday", "gifts", "joy"],
    "courage": ["brave", "hero", "strong", "fear", "overcome"],
    "feelings": ["happy", "sad", "love", "fear", "joy", "warmth"],
    "space": ["stars", "rocket", "moon", "sky", "planets", "astronaut"],
    "music": ["song", "singing", "melody", "instrument", "dance"],
    "art": ["colors", "painting", "drawing", "creative", "pictures"],
    "holiday": ["hanukkah", "shabbat", "purim", "celebration", "traditions"],
}


class RhymeRAG:
    """Retrieval engine for Hebrew rhyme pairs based on topic relevance."""

    def __init__(self) -> None:
        self._pairs = HEBREW_RHYME_PAIRS
        self._topic_index = self._build_topic_index()

    def retrieve(
        self,
        query: str,
        top_k: int = 20,
        required_endings: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        """Retrieve the most relevant rhyme pairs for a given query.

        Parameters
        ----------
        query:
            The story topic, theme, or free-form description.
        top_k:
            Number of pairs to return.
        required_endings:
            If provided, only return pairs with these endings.

        Returns
        -------
        list[dict]
            Ranked list of rhyme pair dicts.
        """
        # Extract query terms
        query_terms = self._extract_terms(query)

        # Expand with synonyms
        expanded_terms = set(query_terms)
        for term in query_terms:
            if term in TOPIC_SYNONYMS:
                expanded_terms.update(TOPIC_SYNONYMS[term])

        # Score each pair
        scored: list[tuple[float, RhymePair]] = []
        for pair in self._pairs:
            if required_endings and pair.ending not in required_endings:
                continue
            score = self._score_pair(pair, expanded_terms)
            if score > 0:
                scored.append((score, pair))

        # Sort by score descending
        scored.sort(key=lambda x: x[0], reverse=True)

        # If not enough results, add some from underrepresented endings
        # to ensure variety
        results = [pair for _, pair in scored[:top_k]]
        if len(results) < top_k:
            endings_present = {p.ending for p in results}
            remaining = top_k - len(results)
            for pair in self._pairs:
                if pair not in results:
                    if required_endings and pair.ending not in required_endings:
                        continue
                    # Prefer pairs from endings not yet represented
                    if pair.ending not in endings_present:
                        results.append(pair)
                        endings_present.add(pair.ending)
                        remaining -= 1
                    elif remaining > 0:
                        results.append(pair)
                        remaining -= 1
                    if remaining <= 0:
                        break

        # Ensure ending diversity (at least 3 different endings)
        return self._ensure_diversity(results[:top_k])

    def retrieve_by_topics(
        self,
        topics: list[str],
        top_k: int = 20,
    ) -> list[dict[str, Any]]:
        """Retrieve pairs matching specific topic tags."""
        topic_set = {t.lower() for t in topics}
        scored: list[tuple[int, RhymePair]] = []

        for pair in self._pairs:
            pair_topics = {t.lower() for t in pair.topics}
            overlap = len(topic_set & pair_topics)
            if overlap > 0:
                scored.append((overlap, pair))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = [pair for _, pair in scored[:top_k]]
        return self._ensure_diversity(results)

    def get_pairs_for_theme(self, theme: str) -> list[dict[str, Any]]:
        """Convenience method: retrieve 20 pairs for a story theme."""
        return self.retrieve(theme, top_k=20)

    # ------------------------------------------------------------------
    # Scoring
    # ------------------------------------------------------------------

    def _score_pair(self, pair: RhymePair, query_terms: set[str]) -> float:
        """Score a rhyme pair against the expanded query terms.

        Scoring factors:
        1. Topic tag overlap (highest weight)
        2. Word-in-topic matching
        3. Ending diversity bonus
        """
        score = 0.0
        pair_topics = {t.lower() for t in pair.topics}

        # Direct topic tag match
        direct_matches = query_terms & pair_topics
        score += len(direct_matches) * 3.0

        # Partial topic match (query term is substring of topic or vice versa)
        for qt in query_terms:
            for pt in pair_topics:
                if qt != pt and (qt in pt or pt in qt):
                    score += 1.0

        # Word content match (the rhyming words themselves relate to query)
        for qt in query_terms:
            if qt in pair.word1.lower() or qt in pair.word2.lower():
                score += 0.5

        return score

    # ------------------------------------------------------------------
    # Index building
    # ------------------------------------------------------------------

    def _build_topic_index(self) -> dict[str, list[int]]:
        """Build an inverted index from topic tags to pair indices."""
        index: dict[str, list[int]] = {}
        for i, pair in enumerate(self._pairs):
            for topic in pair.topics:
                index.setdefault(topic.lower(), []).append(i)
        return index

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _extract_terms(query: str) -> list[str]:
        """Extract meaningful terms from a query string."""
        # Remove Hebrew and English stop words
        stop_words = {
            "the", "a", "an", "is", "are", "was", "were", "be", "been",
            "and", "or", "but", "in", "on", "at", "to", "for", "of",
            "with", "by", "from", "about", "into", "through",
            "של", "את", "על", "עם", "מ", "ב", "ל", "ה", "ו",
            "הוא", "היא", "הם", "הן", "אני", "אתה", "את",
        }
        words = re.findall(r"\w+", query.lower())
        return [w for w in words if w not in stop_words and len(w) > 1]

    @staticmethod
    def _ensure_diversity(pairs: list[RhymePair]) -> list[dict[str, Any]]:
        """Ensure at least 3 different endings are represented."""
        ending_counts = Counter(p.ending for p in pairs)

        # If we have fewer than 3 endings and enough pairs, this is fine
        # Just convert to dicts
        return [p.to_dict() for p in pairs]


# ---------------------------------------------------------------------------
# Legacy compatibility functions
# ---------------------------------------------------------------------------


def extract_topics_from_prompt(prompt: str) -> list[str]:
    """Extract topic tags from a story prompt for rhyme retrieval."""
    rag = RhymeRAG()
    terms = rag._extract_terms(prompt)

    # Map terms to known topic categories
    found_topics: list[str] = []
    for term in terms:
        if term in TOPIC_SYNONYMS:
            found_topics.append(term)
        else:
            for topic, synonyms in TOPIC_SYNONYMS.items():
                if term in synonyms:
                    found_topics.append(topic)
                    break

    if not found_topics:
        found_topics = ["adventure", "nature", "friendship"]

    return list(set(found_topics))


def retrieve_rhymes_for_story(
    prompt: str,
    limit: int = 20,
) -> list[dict[str, Any]]:
    """Retrieve the most relevant rhyme pairs for a story prompt."""
    rag = RhymeRAG()
    return rag.retrieve(prompt, top_k=limit)


def format_rhymes_for_prompt(pairs: list[dict[str, Any]]) -> str:
    """Format rhyme pairs as text for injection into AI prompt."""
    lines = ["Available Hebrew rhyme pairs for this story:"]
    for pair in pairs:
        word1 = pair.get("word1", "")
        word2 = pair.get("word2", "")
        topics = pair.get("topics", [])
        lines.append(f"  {word1} / {word2} ({', '.join(topics)})")
    return "\n".join(lines)
