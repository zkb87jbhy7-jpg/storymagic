"""Shared test fixtures for the StoryMagic API test suite."""

from __future__ import annotations

import pytest


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"
