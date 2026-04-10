"""Provider Registry — manages all AI provider instances.

Spec ref: Ch4.5 — A ProviderRegistry manages all plugins and returns
the best available provider based on health check status, cost, speed,
and historical quality score.
"""

from __future__ import annotations

import logging
from typing import TypeVar

from .base import (
    FaceProcessingProvider,
    ImageGenerationProvider,
    ProviderCapability,
    ProviderMetrics,
    ProviderStatus,
    TextGenerationProvider,
    VoiceGenerationProvider,
)
from .circuit_breaker import CircuitBreaker

logger = logging.getLogger("storymagic.ai.registry")

ProviderT = TypeVar(
    "ProviderT",
    TextGenerationProvider,
    ImageGenerationProvider,
    VoiceGenerationProvider,
    FaceProcessingProvider,
)


class _RegisteredProvider:
    """Internal wrapper holding a provider, its metrics, and circuit breaker."""

    def __init__(self, provider: ProviderT, priority: int, cost: float) -> None:
        self.provider = provider
        self.metrics = ProviderMetrics(
            provider_id=provider.provider_id,
            capability=provider.capability,
            priority=priority,
            cost_per_unit=cost,
        )
        self.circuit_breaker = CircuitBreaker(provider.provider_id)


class ProviderRegistry:
    """Central registry for all AI providers."""

    def __init__(self) -> None:
        self._providers: dict[str, _RegisteredProvider] = {}

    def register(
        self,
        provider: ProviderT,
        priority: int = 0,
        cost_per_unit: float = 0.0,
    ) -> None:
        """Register a provider. Lower priority number = preferred."""
        pid = provider.provider_id
        self._providers[pid] = _RegisteredProvider(provider, priority, cost_per_unit)
        logger.info(
            "Registered provider %s (capability=%s, priority=%d)",
            pid,
            provider.capability.value,
            priority,
        )

    def deregister(self, provider_id: str) -> None:
        """Remove a provider from the registry."""
        self._providers.pop(provider_id, None)
        logger.info("Deregistered provider %s", provider_id)

    def get_best(
        self,
        capability: ProviderCapability,
        experiment_id: str | None = None,
    ) -> ProviderT | None:
        """Return the best healthy provider for a capability.

        Selection: healthy first, then by priority (lowest wins),
        then by cost (lowest wins).
        """
        candidates = [
            rp
            for rp in self._providers.values()
            if rp.provider.capability == capability
            and rp.metrics.status != ProviderStatus.UNHEALTHY
            and not rp.circuit_breaker.is_open
        ]
        if not candidates:
            return None

        candidates.sort(key=lambda rp: (rp.metrics.priority, rp.metrics.cost_per_unit))
        return candidates[0].provider

    def get_all(
        self,
        capability: ProviderCapability,
    ) -> list[ProviderT]:
        """Return all providers for a capability, ordered by priority."""
        candidates = [
            rp
            for rp in self._providers.values()
            if rp.provider.capability == capability
        ]
        candidates.sort(key=lambda rp: rp.metrics.priority)
        return [rp.provider for rp in candidates]

    def get_circuit_breaker(self, provider_id: str) -> CircuitBreaker | None:
        rp = self._providers.get(provider_id)
        return rp.circuit_breaker if rp else None

    def get_metrics(self, provider_id: str) -> ProviderMetrics | None:
        rp = self._providers.get(provider_id)
        return rp.metrics if rp else None

    def list_all(self) -> list[ProviderMetrics]:
        return [rp.metrics for rp in self._providers.values()]

    async def health_check_all(self) -> dict[str, bool]:
        """Run health checks on all providers and update status."""
        results: dict[str, bool] = {}
        for pid, rp in self._providers.items():
            try:
                healthy = await rp.provider.health_check()
                rp.metrics.status = (
                    ProviderStatus.HEALTHY if healthy else ProviderStatus.UNHEALTHY
                )
                results[pid] = healthy
            except Exception:
                rp.metrics.status = ProviderStatus.UNHEALTHY
                results[pid] = False
        return results
