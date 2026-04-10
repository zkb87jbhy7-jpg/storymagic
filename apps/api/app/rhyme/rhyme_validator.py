"""
Hebrew Rhyme Validator — Compares final words of alternating lines
against the rhyme dictionary.

Validates AABB and ABAB rhyme schemes by checking whether the last
word of each line pair exists as a known rhyme pair.
"""

from __future__ import annotations

import logging
import re
from typing import Any

from .hebrew_dictionary import HEBREW_RHYME_PAIRS, RhymePair

logger = logging.getLogger("storymagic.rhyme.validator")


class RhymeValidator:
    """Validates Hebrew rhyming text against the rhyme dictionary."""

    def __init__(self) -> None:
        # Build lookup sets for fast validation
        self._pair_set: set[tuple[str, str]] = set()
        self._word_to_pairs: dict[str, list[RhymePair]] = {}

        for pair in HEBREW_RHYME_PAIRS:
            # Both orderings
            self._pair_set.add((pair.word1, pair.word2))
            self._pair_set.add((pair.word2, pair.word1))

            self._word_to_pairs.setdefault(pair.word1, []).append(pair)
            self._word_to_pairs.setdefault(pair.word2, []).append(pair)

        # Build ending-group lookup for approximate matching
        self._ending_groups: dict[str, set[str]] = {}
        for pair in HEBREW_RHYME_PAIRS:
            self._ending_groups.setdefault(pair.ending, set()).add(pair.word1)
            self._ending_groups.setdefault(pair.ending, set()).add(pair.word2)

    def validate_page(
        self,
        text: str,
        page_number: int,
        scheme: str = "AABB",
    ) -> list[dict[str, Any]]:
        """Validate rhymes in a page of text.

        Parameters
        ----------
        text:
            The full text of a single page.
        page_number:
            The page number (for error reporting).
        scheme:
            Rhyme scheme to check: ``"AABB"`` or ``"ABAB"``.

        Returns
        -------
        list[dict]
            A list of issues found. Empty means all rhymes validate.
        """
        lines = self._extract_lines(text)
        if len(lines) < 2:
            return []

        issues: list[dict[str, Any]] = []

        if scheme == "AABB":
            issues = self._validate_aabb(lines, page_number)
        elif scheme == "ABAB":
            issues = self._validate_abab(lines, page_number)
        else:
            issues = self._validate_aabb(lines, page_number)

        return issues

    def is_rhyming_pair(self, word1: str, word2: str) -> bool:
        """Check if two words form a known rhyme pair."""
        w1 = self._normalize(word1)
        w2 = self._normalize(word2)

        # Exact match in dictionary
        if (w1, w2) in self._pair_set:
            return True

        # Check if they share an ending
        if self._share_ending(w1, w2):
            return True

        # Check suffix-based rhyming (same last 2+ characters)
        if len(w1) >= 2 and len(w2) >= 2 and w1[-2:] == w2[-2:]:
            return True

        return False

    def suggest_rhymes(self, word: str, max_suggestions: int = 10) -> list[str]:
        """Suggest rhyming words for a given word."""
        normalized = self._normalize(word)
        suggestions: list[str] = []

        # Direct dictionary matches
        if normalized in self._word_to_pairs:
            for pair in self._word_to_pairs[normalized]:
                other = pair.word2 if pair.word1 == normalized else pair.word1
                if other not in suggestions:
                    suggestions.append(other)

        # Ending-based suggestions
        for ending, words in self._ending_groups.items():
            if normalized.endswith(ending):
                for w in words:
                    if w != normalized and w not in suggestions:
                        suggestions.append(w)

        return suggestions[:max_suggestions]

    # ------------------------------------------------------------------
    # Scheme validators
    # ------------------------------------------------------------------

    def _validate_aabb(
        self, lines: list[str], page_number: int,
    ) -> list[dict[str, Any]]:
        """Validate AABB scheme: consecutive line pairs should rhyme."""
        issues: list[dict[str, Any]] = []
        for i in range(0, len(lines) - 1, 2):
            word_a = self._get_last_word(lines[i])
            word_b = self._get_last_word(lines[i + 1])

            if word_a and word_b and not self.is_rhyming_pair(word_a, word_b):
                issues.append({
                    "page_number": page_number,
                    "line_a": i + 1,
                    "line_b": i + 2,
                    "word_a": word_a,
                    "word_b": word_b,
                    "scheme": "AABB",
                    "message": (
                        f"Lines {i + 1} and {i + 2} do not rhyme: "
                        f"'{word_a}' and '{word_b}'"
                    ),
                })
        return issues

    def _validate_abab(
        self, lines: list[str], page_number: int,
    ) -> list[dict[str, Any]]:
        """Validate ABAB scheme: alternating line pairs should rhyme."""
        issues: list[dict[str, Any]] = []
        # Check lines 1&3, 2&4, 5&7, 6&8, etc.
        for start in range(0, len(lines) - 2, 4):
            chunk = lines[start:start + 4]
            if len(chunk) >= 3:
                # A lines: 0 and 2
                word_a1 = self._get_last_word(chunk[0])
                word_a2 = self._get_last_word(chunk[2])
                if word_a1 and word_a2 and not self.is_rhyming_pair(word_a1, word_a2):
                    issues.append({
                        "page_number": page_number,
                        "line_a": start + 1,
                        "line_b": start + 3,
                        "word_a": word_a1,
                        "word_b": word_a2,
                        "scheme": "ABAB",
                        "message": (
                            f"Lines {start + 1} and {start + 3} do not rhyme: "
                            f"'{word_a1}' and '{word_a2}'"
                        ),
                    })
            if len(chunk) >= 4:
                # B lines: 1 and 3
                word_b1 = self._get_last_word(chunk[1])
                word_b2 = self._get_last_word(chunk[3])
                if word_b1 and word_b2 and not self.is_rhyming_pair(word_b1, word_b2):
                    issues.append({
                        "page_number": page_number,
                        "line_a": start + 2,
                        "line_b": start + 4,
                        "word_a": word_b1,
                        "word_b": word_b2,
                        "scheme": "ABAB",
                        "message": (
                            f"Lines {start + 2} and {start + 4} do not rhyme: "
                            f"'{word_b1}' and '{word_b2}'"
                        ),
                    })
        return issues

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _extract_lines(text: str) -> list[str]:
        """Split text into non-empty lines."""
        lines = text.strip().split("\n")
        return [line.strip() for line in lines if line.strip()]

    @staticmethod
    def _get_last_word(line: str) -> str:
        """Extract the last word from a line, stripping punctuation."""
        cleaned = re.sub(r'[.,!?;:"\'"()\[\]{}]', "", line.strip())
        words = cleaned.split()
        return words[-1] if words else ""

    @staticmethod
    def _normalize(word: str) -> str:
        """Normalize a Hebrew word for comparison (strip nikud and punctuation)."""
        # Remove nikud (Hebrew diacritics U+0591-U+05C7)
        cleaned = re.sub(r"[\u0591-\u05C7]", "", word)
        # Remove common punctuation
        cleaned = re.sub(r'[.,!?;:"\'"()\[\]{}]', "", cleaned)
        return cleaned.strip()

    def _share_ending(self, word1: str, word2: str) -> bool:
        """Check if two words share an ending sound group."""
        for ending, words in self._ending_groups.items():
            if word1 in words and word2 in words:
                return True
        return False
