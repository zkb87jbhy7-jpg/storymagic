"""
Prompt Manager — Loads, caches, and substitutes prompt templates.

Provides version management for prompt templates.  In production, prompts
can be loaded from a database for A/B testing and hot-swapping.
File-based loading is the default fallback.
"""

from __future__ import annotations

import logging
import re
from pathlib import Path
from typing import Any

logger = logging.getLogger("storymagic.prompts.manager")

_TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"


class PromptVersion:
    """Metadata for a specific prompt version."""

    __slots__ = ("key", "version", "content", "is_active")

    def __init__(self, key: str, version: str, content: str, *, is_active: bool = True) -> None:
        self.key = key
        self.version = version
        self.content = content
        self.is_active = is_active

    def __repr__(self) -> str:
        return f"PromptVersion(key={self.key!r}, version={self.version!r}, active={self.is_active})"


class PromptManager:
    """Centralised prompt template management.

    Usage::

        pm = PromptManager()
        prompt = pm.load_prompt("story_architect")
        filled = pm.substitute_variables(prompt, {"child_name": "Yael"})
    """

    def __init__(
        self,
        templates_dir: Path | str | None = None,
        db_loader: Any | None = None,
    ) -> None:
        """
        Parameters
        ----------
        templates_dir:
            Directory containing ``.txt`` prompt template files.
            Defaults to ``ai/prompts/templates/``.
        db_loader:
            Optional async callable ``(key: str) -> PromptVersion | None``
            that fetches a prompt from the database.  When provided, the
            database is checked first and the file system is the fallback.
        """
        self._templates_dir = Path(templates_dir) if templates_dir else _TEMPLATES_DIR
        self._db_loader = db_loader
        self._cache: dict[str, PromptVersion] = {}

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def load_prompt(self, key: str, version: str | None = None) -> str:
        """Load a prompt template by key.

        Resolution order:
        1. In-memory cache
        2. Database (if ``db_loader`` is configured)
        3. File system — ``<templates_dir>/<key>_v<N>.txt`` or ``<key>.txt``

        Parameters
        ----------
        key:
            Logical name of the prompt (e.g. ``"story_architect"``).
        version:
            Explicit version tag (e.g. ``"v1"``).  When ``None``, the active
            version is loaded.

        Returns
        -------
        str
            The prompt template text with ``{variable}`` placeholders intact.
        """
        cache_key = f"{key}:{version or 'active'}"
        if cache_key in self._cache:
            return self._cache[cache_key].content

        # Try database
        if self._db_loader is not None:
            pv = self._try_db_load(key, version)
            if pv is not None:
                self._cache[cache_key] = pv
                return pv.content

        # Try file system
        content = self._load_from_file(key, version)
        if content is not None:
            resolved_version = version or self._detect_file_version(key)
            pv = PromptVersion(key=key, version=resolved_version, content=content)
            self._cache[cache_key] = pv
            return content

        # Fallback
        logger.warning("Prompt '%s' not found — returning minimal fallback", key)
        fallback = f"You are the {key} agent. Follow instructions carefully."
        self._cache[cache_key] = PromptVersion(key=key, version="fallback", content=fallback)
        return fallback

    def get_active_version(self, key: str) -> PromptVersion | None:
        """Return the active :class:`PromptVersion` for *key*, or ``None``."""
        cache_key = f"{key}:active"
        if cache_key in self._cache:
            return self._cache[cache_key]

        content = self._load_from_file(key, None)
        if content is not None:
            ver = self._detect_file_version(key)
            pv = PromptVersion(key=key, version=ver, content=content)
            self._cache[cache_key] = pv
            return pv

        return None

    @staticmethod
    def substitute_variables(template: str, variables: dict[str, str]) -> str:
        """Replace ``{var}`` placeholders in *template*.

        Unknown placeholders are left untouched so downstream systems
        can perform their own substitution passes.
        """

        def _replacer(match: re.Match[str]) -> str:
            var = match.group(1)
            return str(variables.get(var, match.group(0)))

        return re.sub(r"\{(\w+)\}", _replacer, template)

    def invalidate_cache(self, key: str | None = None) -> None:
        """Clear the cache for a specific key or all keys."""
        if key is None:
            self._cache.clear()
            logger.info("Prompt cache cleared (all)")
        else:
            to_remove = [k for k in self._cache if k.startswith(f"{key}:")]
            for k in to_remove:
                del self._cache[k]
            logger.info("Prompt cache cleared for key=%s (%d entries)", key, len(to_remove))

    def register_prompt(self, key: str, version: str, content: str, *, active: bool = True) -> None:
        """Register a prompt version in memory (useful for testing)."""
        pv = PromptVersion(key=key, version=version, content=content, is_active=active)
        cache_key = f"{key}:{version}"
        self._cache[cache_key] = pv
        if active:
            self._cache[f"{key}:active"] = pv
        logger.info("Registered prompt %s version %s (active=%s)", key, version, active)

    def list_available(self) -> list[str]:
        """List all prompt keys available on the file system."""
        keys: set[str] = set()
        if self._templates_dir.exists():
            for path in self._templates_dir.glob("*.txt"):
                stem = path.stem
                # Strip version suffix: "story_architect_v1" -> "story_architect"
                match = re.match(r"^(.+?)_v\d+$", stem)
                if match:
                    keys.add(match.group(1))
                else:
                    keys.add(stem)
        return sorted(keys)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _load_from_file(self, key: str, version: str | None) -> str | None:
        """Try to load from the templates directory."""
        if version:
            candidates = [f"{key}_{version}.txt"]
        else:
            candidates = self._versioned_candidates(key)

        for filename in candidates:
            path = self._templates_dir / filename
            if path.exists():
                logger.debug("Loading prompt from %s", path)
                return path.read_text(encoding="utf-8")

        return None

    def _versioned_candidates(self, key: str) -> list[str]:
        """Generate candidate filenames in version-descending order."""
        candidates: list[str] = []
        if self._templates_dir.exists():
            matching = sorted(
                self._templates_dir.glob(f"{key}_v*.txt"),
                key=lambda p: self._extract_version_number(p.stem),
                reverse=True,
            )
            candidates.extend(p.name for p in matching)
        candidates.append(f"{key}.txt")
        return candidates

    def _detect_file_version(self, key: str) -> str:
        """Detect the highest file version for a key."""
        if self._templates_dir.exists():
            matching = sorted(
                self._templates_dir.glob(f"{key}_v*.txt"),
                key=lambda p: self._extract_version_number(p.stem),
                reverse=True,
            )
            if matching:
                match = re.search(r"_v(\d+)$", matching[0].stem)
                if match:
                    return f"v{match.group(1)}"
        return "v0"

    @staticmethod
    def _extract_version_number(stem: str) -> int:
        match = re.search(r"_v(\d+)$", stem)
        return int(match.group(1)) if match else 0

    def _try_db_load(self, key: str, version: str | None) -> PromptVersion | None:
        """Attempt to load from the database loader (sync wrapper)."""
        try:
            result = self._db_loader(key, version)
            if result is not None:
                return result
        except Exception as exc:
            logger.warning("DB prompt load failed for %s: %s", key, exc)
        return None
