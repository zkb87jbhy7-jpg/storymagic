"""Safety Gate — Layer L-01 of the quality pipeline.

Spec ref: Ch6.1 — SafetyGate runs on every generated text.  Contains a
blocklist of 500+ words organized by category with separate lists for Hebrew
and English.  Sensitivity is calibrated by age.  Pattern detection catches
phone numbers, URLs, and email addresses.  Secondary AI check runs on
suspicious content.  Zero tolerance: high risk = absolute block + audit log.
"""

from __future__ import annotations

import logging
import re
import time
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any

logger = logging.getLogger("storymagic.quality.safety_gate")

# Directory containing blocklist files
BLOCKLISTS_DIR = Path(__file__).parent / "blocklists"


class RiskLevel(Enum):
    """Risk classification for safety findings."""
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SafetyCategory(Enum):
    """Categories of safety violations."""
    VIOLENCE = "violence"
    SEXUAL = "sexual"
    DRUGS = "drugs"
    PROFANITY = "profanity"
    SELF_HARM = "self_harm"
    SCARY = "scary_for_young"
    DISCRIMINATION = "discrimination"
    GAMBLING = "gambling"
    WEAPONS = "weapons"
    PII = "pii"
    BLOCKED_NAME = "blocked_name"
    AI_FLAGGED = "ai_flagged"


@dataclass
class SafetyFinding:
    """A single safety violation found in the text."""
    word_or_pattern: str
    category: SafetyCategory
    risk_level: RiskLevel
    position: int
    context: str
    explanation: str = ""


@dataclass
class SafetyGateResult:
    """Result of a SafetyGate check."""
    passed: bool
    risk_level: RiskLevel
    findings: list[SafetyFinding] = field(default_factory=list)
    blocked: bool = False
    audit_logged: bool = False
    check_duration_ms: float = 0.0
    ai_secondary_check: bool = False
    ai_check_result: dict[str, Any] = field(default_factory=dict)


# ── Regex patterns for PII detection ──────────────────────────────────

# Phone numbers: international and local formats
PHONE_PATTERN = re.compile(
    r"(?:\+?\d{1,3}[-.\s]?)?"  # optional country code
    r"(?:\(?\d{2,4}\)?[-.\s]?)"  # area code
    r"(?:\d{3,4}[-.\s]?\d{3,4})",  # number
    re.UNICODE,
)

# URLs
URL_PATTERN = re.compile(
    r"https?://[^\s<>\"']+|"
    r"www\.[^\s<>\"']+|"
    r"[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:/[^\s<>\"']*)?",
    re.IGNORECASE,
)

# Email addresses
EMAIL_PATTERN = re.compile(
    r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
    re.IGNORECASE,
)

# ── Age-calibrated scary words ────────────────────────────────────────

YOUNG_CHILD_SCARY_WORDS = frozenset({
    # English
    "monster", "ghost", "darkness", "scary", "death", "blood",
    "demon", "devil", "zombie", "skeleton", "witch", "vampire",
    "werewolf", "nightmare", "haunted", "creepy", "terrifying",
    "coffin", "grave", "corpse",
    # Hebrew
    "מפלצת", "רוח רפאים", "חושך", "מפחיד", "מוות", "דם",
    "שד", "שטן", "זומבי", "שלד", "מכשפה", "ערפד",
    "סיוט", "ארון קבורה", "קבר", "גופה",
})

# Words allowed for ages 6-10 that would be blocked for 2-5
MODERATE_TENSION_ALLOWED_6_10 = frozenset({
    "monster", "ghost", "darkness", "scary", "nightmare", "witch",
    "מפלצת", "רוח רפאים", "חושך", "מפחיד", "סיוט", "מכשפה",
})


class SafetyGate:
    """Content safety gate for children's story text.

    Loads blocklists from files, applies age-calibrated filtering,
    detects PII patterns, and optionally invokes an AI secondary check.

    Usage:
        gate = SafetyGate()
        result = await gate.check_text("Once upon a time...", age=4, language="en")
        if not result.passed:
            # handle blocked content
    """

    def __init__(self) -> None:
        self._blocklists: dict[str, set[str]] = {}
        self._blocked_names: set[str] = set()
        self._loaded = False

    def _load_blocklists(self) -> None:
        """Load all blocklist files from disk."""
        if self._loaded:
            return

        # Load English blocklist
        en_path = BLOCKLISTS_DIR / "en_blocked.txt"
        if en_path.exists():
            self._blocklists["en"] = self._parse_blocklist(en_path)
            logger.info("Loaded %d English blocked words", len(self._blocklists["en"]))

        # Load Hebrew blocklist
        he_path = BLOCKLISTS_DIR / "he_blocked.txt"
        if he_path.exists():
            self._blocklists["he"] = self._parse_blocklist(he_path)
            logger.info("Loaded %d Hebrew blocked words", len(self._blocklists["he"]))

        # Load blocked names
        names_path = BLOCKLISTS_DIR / "blocked_names.txt"
        if names_path.exists():
            self._blocked_names = self._parse_blocklist(names_path)
            logger.info("Loaded %d blocked names", len(self._blocked_names))

        self._loaded = True

    @staticmethod
    def _parse_blocklist(path: Path) -> set[str]:
        """Parse a blocklist file, ignoring comments and empty lines."""
        words: set[str] = set()
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                words.add(line.lower())
        return words

    def _check_blocklist(
        self,
        text: str,
        language: str,
        age: int,
    ) -> list[SafetyFinding]:
        """Check text against the language-specific blocklist."""
        findings: list[SafetyFinding] = []
        text_lower = text.lower()

        # Get the appropriate blocklist
        blocklist = self._blocklists.get(language, set())
        # Also check the other language as a safety measure
        all_blocked = blocklist | self._blocklists.get("en", set()) | self._blocklists.get("he", set())

        for blocked_word in all_blocked:
            # Use word boundary matching for single words, substring for phrases
            if " " in blocked_word:
                # Multi-word phrase: direct substring search
                idx = text_lower.find(blocked_word)
                if idx >= 0:
                    # Check if it's a young-child scary word allowed for older children
                    if blocked_word in MODERATE_TENSION_ALLOWED_6_10 and age >= 6:
                        continue
                    context_start = max(0, idx - 20)
                    context_end = min(len(text), idx + len(blocked_word) + 20)
                    findings.append(SafetyFinding(
                        word_or_pattern=blocked_word,
                        category=self._categorize_word(blocked_word),
                        risk_level=RiskLevel.HIGH,
                        position=idx,
                        context=text[context_start:context_end],
                    ))
            else:
                # Single word: use regex word boundary
                pattern = re.compile(
                    r"(?<!\w)" + re.escape(blocked_word) + r"(?!\w)",
                    re.IGNORECASE | re.UNICODE,
                )
                for match in pattern.finditer(text_lower):
                    # Age-calibrated check for scary words
                    if blocked_word in YOUNG_CHILD_SCARY_WORDS:
                        if age >= 6 and blocked_word in MODERATE_TENSION_ALLOWED_6_10:
                            continue
                    context_start = max(0, match.start() - 20)
                    context_end = min(len(text), match.end() + 20)
                    findings.append(SafetyFinding(
                        word_or_pattern=blocked_word,
                        category=self._categorize_word(blocked_word),
                        risk_level=self._assess_risk(blocked_word, age),
                        position=match.start(),
                        context=text[context_start:context_end],
                    ))

        return findings

    def _check_blocked_names(self, text: str) -> list[SafetyFinding]:
        """Check for public figures' children names."""
        findings: list[SafetyFinding] = []
        text_lower = text.lower()

        for name in self._blocked_names:
            if name in text_lower:
                idx = text_lower.find(name)
                context_start = max(0, idx - 20)
                context_end = min(len(text), idx + len(name) + 20)
                findings.append(SafetyFinding(
                    word_or_pattern=name,
                    category=SafetyCategory.BLOCKED_NAME,
                    risk_level=RiskLevel.MEDIUM,
                    position=idx,
                    context=text[context_start:context_end],
                    explanation="Name matches a blocked public figure's child name",
                ))

        return findings

    def _check_pii_patterns(self, text: str) -> list[SafetyFinding]:
        """Detect phone numbers, URLs, and email addresses via regex."""
        findings: list[SafetyFinding] = []

        for match in PHONE_PATTERN.finditer(text):
            # Filter out short number sequences that are likely page numbers or ages
            matched = match.group().strip()
            digits_only = re.sub(r"[^\d]", "", matched)
            if len(digits_only) >= 7:  # Real phone numbers have 7+ digits
                findings.append(SafetyFinding(
                    word_or_pattern=matched,
                    category=SafetyCategory.PII,
                    risk_level=RiskLevel.HIGH,
                    position=match.start(),
                    context=text[max(0, match.start()-10):match.end()+10],
                    explanation="Phone number detected in children's content",
                ))

        for match in URL_PATTERN.finditer(text):
            findings.append(SafetyFinding(
                word_or_pattern=match.group(),
                category=SafetyCategory.PII,
                risk_level=RiskLevel.HIGH,
                position=match.start(),
                context=text[max(0, match.start()-10):match.end()+10],
                explanation="URL detected in children's content",
            ))

        for match in EMAIL_PATTERN.finditer(text):
            findings.append(SafetyFinding(
                word_or_pattern=match.group(),
                category=SafetyCategory.PII,
                risk_level=RiskLevel.HIGH,
                position=match.start(),
                context=text[max(0, match.start()-10):match.end()+10],
                explanation="Email address detected in children's content",
            ))

        return findings

    @staticmethod
    def _categorize_word(word: str) -> SafetyCategory:
        """Attempt to categorize a blocked word by its nature."""
        word_lower = word.lower()

        violence_keywords = {"kill", "murder", "stab", "shoot", "gun", "knife", "weapon",
                             "bomb", "attack", "להרוג", "רצח", "לדקור", "לירות", "נשק"}
        sexual_keywords = {"sex", "nude", "naked", "porn", "erotic", "מין", "עירום", "פורנוגרפיה"}
        drug_keywords = {"cocaine", "heroin", "marijuana", "drug", "סמים", "קוקאין", "הרואין"}
        profanity_keywords = {"fuck", "shit", "damn", "bitch", "זונה", "חרא", "דפוק"}
        self_harm_keywords = {"suicide", "self-harm", "cut myself", "התאבדות", "פגיעה עצמית"}
        scary_keywords = {"monster", "ghost", "demon", "zombie", "מפלצת", "רוח רפאים", "שד"}

        if any(kw in word_lower for kw in violence_keywords):
            return SafetyCategory.VIOLENCE
        if any(kw in word_lower for kw in sexual_keywords):
            return SafetyCategory.SEXUAL
        if any(kw in word_lower for kw in drug_keywords):
            return SafetyCategory.DRUGS
        if any(kw in word_lower for kw in profanity_keywords):
            return SafetyCategory.PROFANITY
        if any(kw in word_lower for kw in self_harm_keywords):
            return SafetyCategory.SELF_HARM
        if any(kw in word_lower for kw in scary_keywords):
            return SafetyCategory.SCARY

        return SafetyCategory.VIOLENCE  # default to most conservative

    @staticmethod
    def _assess_risk(word: str, age: int) -> RiskLevel:
        """Assess risk level based on the word and child's age."""
        word_lower = word.lower()

        # Always critical: sexual, self-harm, hard drugs
        critical_patterns = {"sex", "porn", "suicide", "self-harm", "rape",
                             "מין", "פורנוגרפיה", "התאבדות", "אונס"}
        if any(pat in word_lower for pat in critical_patterns):
            return RiskLevel.CRITICAL

        # High risk: violence, weapons, hard profanity
        high_patterns = {"kill", "murder", "gun", "bomb", "fuck",
                         "להרוג", "רצח", "אקדח", "פצצה"}
        if any(pat in word_lower for pat in high_patterns):
            return RiskLevel.HIGH

        # Age-calibrated: scary words
        if word_lower in YOUNG_CHILD_SCARY_WORDS:
            if age <= 5:
                return RiskLevel.HIGH
            return RiskLevel.MEDIUM

        return RiskLevel.MEDIUM

    async def _run_ai_secondary_check(
        self,
        text: str,
        age: int,
        language: str,
    ) -> dict[str, Any]:
        """Run a secondary AI check on suspicious content.

        Spec: Secondary AI check runs on suspicious content that passes the blocklist.
        """
        try:
            from app.ai.providers.base import GenerationOptions
            from app.ai.providers.registry import ProviderRegistry
            from app.ai.providers.router import AIRouter

            router = AIRouter(ProviderRegistry())

            system_prompt = (
                "You are a children's content safety reviewer. Analyze the following text "
                "and determine if it contains ANY content inappropriate for a children's "
                f"book targeted at age {age}. Consider: violence, sexual content, "
                "scary imagery, drug references, profanity, self-harm, discrimination, "
                "or any other content unsuitable for children. "
                "Return JSON: {safe: bool, risk_level: 'none'|'low'|'medium'|'high'|'critical', "
                "issues: [{description, category, severity}]}."
            )

            result = await router.generate_structured(
                f"Text to check (language: {language}):\n\n{text}",
                system_prompt,
                {
                    "type": "object",
                    "properties": {
                        "safe": {"type": "boolean"},
                        "risk_level": {"type": "string"},
                        "issues": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "description": {"type": "string"},
                                    "category": {"type": "string"},
                                    "severity": {"type": "string"},
                                },
                            },
                        },
                    },
                },
                GenerationOptions(max_tokens=1024, temperature=0.1),
            )
            return result
        except Exception as exc:
            logger.error("AI secondary safety check failed: %s", exc)
            # Fail-safe: if AI check fails, flag as suspicious
            return {
                "safe": False,
                "risk_level": "medium",
                "issues": [{"description": f"AI check failed: {exc}", "category": "unknown", "severity": "medium"}],
            }

    async def check_text(
        self,
        text: str,
        age: int,
        language: str = "he",
    ) -> SafetyGateResult:
        """Run the full safety check on text content.

        Args:
            text: The text content to check.
            age: The target child's age (2-12).
            language: The primary language ("en" or "he").

        Returns:
            SafetyGateResult with pass/fail status, findings, and risk level.
        """
        start_time = time.perf_counter()
        self._load_blocklists()

        all_findings: list[SafetyFinding] = []

        # Step 1: Check against blocklists
        blocklist_findings = self._check_blocklist(text, language, age)
        all_findings.extend(blocklist_findings)

        # Step 2: Check blocked names
        name_findings = self._check_blocked_names(text)
        all_findings.extend(name_findings)

        # Step 3: Check PII patterns
        pii_findings = self._check_pii_patterns(text)
        all_findings.extend(pii_findings)

        # Step 4: Determine if AI secondary check is needed
        # Run AI check if: no blocklist hits but text is long enough to potentially
        # contain subtle inappropriate content, or if there are borderline findings
        ai_check_result: dict[str, Any] = {}
        needs_ai_check = (
            len(all_findings) == 0 and len(text) > 100
        ) or any(f.risk_level == RiskLevel.MEDIUM for f in all_findings)

        if needs_ai_check:
            ai_check_result = await self._run_ai_secondary_check(text, age, language)
            if not ai_check_result.get("safe", True):
                for issue in ai_check_result.get("issues", []):
                    all_findings.append(SafetyFinding(
                        word_or_pattern="[AI-detected]",
                        category=SafetyCategory.AI_FLAGGED,
                        risk_level=RiskLevel(ai_check_result.get("risk_level", "medium")),
                        position=0,
                        context=issue.get("description", ""),
                        explanation=issue.get("description", "AI-detected safety issue"),
                    ))

        # Step 5: Determine overall risk and pass/fail
        if not all_findings:
            overall_risk = RiskLevel.NONE
            passed = True
            blocked = False
        else:
            # Take the highest risk level from all findings
            risk_order = [RiskLevel.NONE, RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL]
            max_risk_idx = max(risk_order.index(f.risk_level) for f in all_findings)
            overall_risk = risk_order[max_risk_idx]

            # Zero tolerance: high or critical = absolute block
            if overall_risk in (RiskLevel.HIGH, RiskLevel.CRITICAL):
                passed = False
                blocked = True
            elif overall_risk == RiskLevel.MEDIUM:
                # Medium risk passes but is logged for review
                passed = True
                blocked = False
            else:
                passed = True
                blocked = False

        elapsed_ms = (time.perf_counter() - start_time) * 1000

        result = SafetyGateResult(
            passed=passed,
            risk_level=overall_risk,
            findings=all_findings,
            blocked=blocked,
            audit_logged=blocked,  # Audit log entry created for blocks
            check_duration_ms=elapsed_ms,
            ai_secondary_check=needs_ai_check,
            ai_check_result=ai_check_result,
        )

        if blocked:
            logger.warning(
                "SafetyGate BLOCKED content: risk=%s findings=%d age=%d",
                overall_risk.value,
                len(all_findings),
                age,
            )
        elif all_findings:
            logger.info(
                "SafetyGate passed with warnings: findings=%d risk=%s age=%d",
                len(all_findings),
                overall_risk.value,
                age,
            )

        return result
