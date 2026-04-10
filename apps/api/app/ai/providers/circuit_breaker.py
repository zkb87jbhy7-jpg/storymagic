"""Circuit breaker for AI provider fault tolerance.

Spec ref: Ch4.5 — Built-in circuit breaker marks a provider as unhealthy
after 3 failures within 5 minutes, pauses for 2 minutes, then retries.

States:
  CLOSED  → normal operation, calls pass through
  OPEN    → provider is down, calls fail immediately
  HALF_OPEN → single probe call allowed to test recovery
"""

from __future__ import annotations

import asyncio
import time
from enum import Enum
from typing import Any, Callable, Coroutine, TypeVar

T = TypeVar("T")


class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


class CircuitBreakerOpen(Exception):
    """Raised when the circuit breaker is open and calls are blocked."""

    def __init__(self, provider_id: str, retry_after: float) -> None:
        self.provider_id = provider_id
        self.retry_after = retry_after
        super().__init__(
            f"Circuit breaker open for {provider_id}. "
            f"Retry after {retry_after:.0f}s"
        )


class CircuitBreaker:
    """Async-safe circuit breaker for wrapping provider calls.

    Args:
        provider_id: Identifier for the provider this breaker protects.
        failure_threshold: Number of failures before opening (default 3).
        window_seconds: Time window for counting failures (default 300s = 5 min).
        recovery_seconds: Cool-down before half-open probe (default 120s = 2 min).
    """

    def __init__(
        self,
        provider_id: str,
        failure_threshold: int = 3,
        window_seconds: float = 300.0,
        recovery_seconds: float = 120.0,
    ) -> None:
        self.provider_id = provider_id
        self.failure_threshold = failure_threshold
        self.window_seconds = window_seconds
        self.recovery_seconds = recovery_seconds

        self._state = CircuitState.CLOSED
        self._failures: list[float] = []
        self._last_failure_time: float = 0.0
        self._lock = asyncio.Lock()

    @property
    def state(self) -> CircuitState:
        return self._state

    @property
    def is_open(self) -> bool:
        return self._state == CircuitState.OPEN

    def _prune_old_failures(self) -> None:
        """Remove failures outside the rolling window."""
        cutoff = time.monotonic() - self.window_seconds
        self._failures = [t for t in self._failures if t > cutoff]

    async def execute(
        self,
        func: Callable[..., Coroutine[Any, Any, T]],
        *args: Any,
        **kwargs: Any,
    ) -> T:
        """Execute a function through the circuit breaker.

        Raises CircuitBreakerOpen if the circuit is open and recovery
        time has not elapsed.
        """
        async with self._lock:
            now = time.monotonic()

            if self._state == CircuitState.OPEN:
                elapsed = now - self._last_failure_time
                if elapsed < self.recovery_seconds:
                    raise CircuitBreakerOpen(
                        self.provider_id,
                        self.recovery_seconds - elapsed,
                    )
                # Recovery period elapsed → transition to half-open
                self._state = CircuitState.HALF_OPEN

        # Execute the call (outside lock to allow concurrency)
        try:
            result = await func(*args, **kwargs)
        except Exception:
            await self._record_failure()
            raise
        else:
            await self._record_success()
            return result

    async def _record_failure(self) -> None:
        async with self._lock:
            now = time.monotonic()
            self._failures.append(now)
            self._last_failure_time = now
            self._prune_old_failures()

            if self._state == CircuitState.HALF_OPEN:
                # Probe failed → back to open
                self._state = CircuitState.OPEN
            elif len(self._failures) >= self.failure_threshold:
                self._state = CircuitState.OPEN

    async def _record_success(self) -> None:
        async with self._lock:
            if self._state == CircuitState.HALF_OPEN:
                # Probe succeeded → close the circuit
                self._state = CircuitState.CLOSED
                self._failures.clear()

    async def reset(self) -> None:
        """Manually reset the circuit breaker to closed."""
        async with self._lock:
            self._state = CircuitState.CLOSED
            self._failures.clear()
            self._last_failure_time = 0.0
