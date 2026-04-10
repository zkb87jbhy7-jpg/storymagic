"""
Base Agent — Abstract foundation for all StoryMagic AI agents.

Spec ref: Chapter 5 — Every agent inherits from BaseAgent, which provides
common infrastructure: prompt loading, variable substitution, event logging,
and output validation.
"""

from __future__ import annotations

import logging
import re
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

logger = logging.getLogger("storymagic.agents")


# ---------------------------------------------------------------------------
# Result dataclass
# ---------------------------------------------------------------------------


@dataclass
class AgentResult:
    """Standardised result envelope returned by every agent."""

    agent_id: str
    success: bool
    data: dict[str, Any] = field(default_factory=dict)
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    quality_score: float | None = None
    latency_ms: float = 0.0
    provider_id: str | None = None
    retries_used: int = 0
    metadata: dict[str, Any] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Abstract Base
# ---------------------------------------------------------------------------


class BaseAgent(ABC):
    """Abstract base for all StoryMagic AI agents.

    Every concrete agent MUST implement :meth:`execute`.  The constructor
    receives an :class:`AIRouter` instance, which is the only gateway to
    LLM / image / voice providers.
    """

    agent_id: str = "base"

    def __init__(self, router: Any) -> None:
        """
        Parameters
        ----------
        router:
            An ``AIRouter`` instance used to dispatch AI calls.
        """
        from ..providers.router import AIRouter

        self.router: AIRouter = router
        self._prompts_dir = Path(__file__).resolve().parent.parent / "prompts" / "templates"

    # ------------------------------------------------------------------
    # Abstract
    # ------------------------------------------------------------------

    @abstractmethod
    async def execute(self, **kwargs: Any) -> AgentResult:
        """Run the agent's core logic and return a result envelope."""
        ...

    # ------------------------------------------------------------------
    # Prompt helpers
    # ------------------------------------------------------------------

    def _load_prompt(self, prompt_key: str) -> str:
        """Load a prompt template from the templates directory.

        Looks for ``<prompt_key>.txt`` inside ``ai/prompts/templates/``.
        Falls back to a minimal placeholder if the file is missing so that
        development can proceed without crashing.
        """
        path = self._prompts_dir / f"{prompt_key}.txt"
        if path.exists():
            return path.read_text(encoding="utf-8")
        logger.warning("Prompt template not found: %s — using fallback", path)
        return f"You are the {prompt_key} agent. Follow instructions carefully."

    @staticmethod
    def _substitute_variables(template: str, variables: dict[str, str]) -> str:
        """Replace ``{var}`` placeholders in *template* with values from *variables*.

        Unknown placeholders are left untouched so that downstream agents
        can do their own substitution.
        """

        def _replacer(match: re.Match[str]) -> str:
            key = match.group(1)
            return str(variables.get(key, match.group(0)))

        return re.sub(r"\{(\w+)\}", _replacer, template)

    # ------------------------------------------------------------------
    # Event logging
    # ------------------------------------------------------------------

    def _log_event(
        self,
        book_id: str,
        event_type: str,
        payload: dict[str, Any] | None = None,
        quality_score: float | None = None,
        latency_ms: float | None = None,
        provider_id: str | None = None,
    ) -> None:
        """Log an event to the book_events stream.

        In production this writes to the append-only event log (CQRS).
        During development it falls through to structured logging.
        """
        event = {
            "book_id": book_id,
            "event_type": event_type,
            "agent_id": self.agent_id,
            "payload": payload or {},
            "quality_score": quality_score,
            "latency_ms": latency_ms,
            "provider_id": provider_id,
            "timestamp": time.time(),
        }
        logger.info("book_event: %s", event)

    # ------------------------------------------------------------------
    # Output validation
    # ------------------------------------------------------------------

    @staticmethod
    def _validate_output(output: dict[str, Any], schema: dict[str, Any]) -> bool:
        """Validate *output* against an expected JSON-style *schema*.

        Uses a lightweight recursive checker.  For full JSON-Schema
        validation in production swap this for ``jsonschema.validate``.
        """

        def _check(data: Any, spec: Any) -> bool:  # noqa: C901
            if isinstance(spec, dict):
                spec_type = spec.get("type")
                if spec_type == "object":
                    if not isinstance(data, dict):
                        return False
                    for prop, prop_spec in spec.get("properties", {}).items():
                        if prop in spec.get("required", []) and prop not in data:
                            return False
                        if prop in data and not _check(data[prop], prop_spec):
                            return False
                    return True
                if spec_type == "array":
                    if not isinstance(data, list):
                        return False
                    item_spec = spec.get("items")
                    if item_spec:
                        return all(_check(item, item_spec) for item in data)
                    return True
                if spec_type == "string":
                    return isinstance(data, str)
                if spec_type == "number":
                    return isinstance(data, (int, float))
                if spec_type == "integer":
                    return isinstance(data, int)
                if spec_type == "boolean":
                    return isinstance(data, bool)
            return True

        return _check(output, schema)

    # ------------------------------------------------------------------
    # Timing helper
    # ------------------------------------------------------------------

    @staticmethod
    def _elapsed_ms(start: float) -> float:
        """Return milliseconds elapsed since *start* (from ``time.perf_counter()``)."""
        return (time.perf_counter() - start) * 1000.0
