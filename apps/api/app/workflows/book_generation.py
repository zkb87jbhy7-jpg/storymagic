"""Temporal workflow wrapping the LangGraph book generation pipeline.

Spec ref: Ch5.17 — The orchestrator runs on top of Temporal.io for durable
execution.  This workflow starts the LangGraph pipeline, emits SSE progress
events, and handles timeout / retry / compensation.
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import timedelta
from typing import Any

from temporalio import workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    from app.ai.orchestrator.state import BookGenerationState

logger = logging.getLogger("storymagic.workflows.book_generation")


# ── Workflow input / output types ──────────────────────────────────────


@workflow.defn(name="BookGenerationWorkflow")
class BookGenerationWorkflow:
    """Temporal workflow for end-to-end book generation.

    Orchestrates the 12-phase LangGraph pipeline with durable execution
    guarantees.  Each heavy operation (AI calls, image generation, voice
    synthesis, PDF assembly) is delegated to a Temporal activity for
    independent timeout and retry management.
    """

    def __init__(self) -> None:
        self._progress: float = 0.0
        self._current_phase: str = "initializing"
        self._errors: list[dict[str, Any]] = []
        self._cancelled: bool = False

    @workflow.query
    def progress(self) -> dict[str, Any]:
        """Query the current pipeline progress for SSE streaming."""
        return {
            "progress_percent": self._progress,
            "current_phase": self._current_phase,
            "errors": self._errors,
        }

    @workflow.signal
    async def cancel_generation(self) -> None:
        """Signal to cancel the running generation."""
        self._cancelled = True

    @workflow.run
    async def run(self, input_state: dict[str, Any]) -> dict[str, Any]:
        """Execute the full book generation pipeline.

        Args:
            input_state: Initial BookGenerationState dict with all input fields.

        Returns:
            The final state dict with all outputs (interactive_book_data, etc.).
        """
        book_id = input_state.get("book_id", str(uuid.uuid4()))
        workflow.logger.info("Starting BookGenerationWorkflow for book_id=%s", book_id)

        self._current_phase = "starting"
        self._progress = 0.0

        try:
            # Run the LangGraph pipeline as a single activity.
            # The activity internally handles the graph traversal.
            # We use a generous timeout since the full pipeline can take minutes.
            result = await workflow.execute_activity(
                "run_langgraph_pipeline",
                args=[input_state],
                start_to_close_timeout=timedelta(minutes=15),
                retry_policy=RetryPolicy(
                    initial_interval=timedelta(seconds=5),
                    backoff_coefficient=2.0,
                    maximum_interval=timedelta(seconds=60),
                    maximum_attempts=2,
                    non_retryable_error_types=["CancellationError", "SafetyGateError"],
                ),
                heartbeat_timeout=timedelta(seconds=120),
            )

            self._progress = result.get("progress_percent", 100.0)
            self._current_phase = result.get("current_phase", "complete")
            self._errors = result.get("errors", [])

            # Log completion event
            await workflow.execute_activity(
                "log_book_event",
                args=[
                    book_id,
                    "generation_complete",
                    {
                        "progress": self._progress,
                        "phase": self._current_phase,
                        "error_count": len(self._errors),
                    },
                ],
                start_to_close_timeout=timedelta(seconds=30),
                retry_policy=RetryPolicy(maximum_attempts=3),
            )

            return result

        except asyncio.CancelledError:
            workflow.logger.warning("Workflow cancelled for book_id=%s", book_id)
            self._current_phase = "cancelled"

            # Compensation: clean up partial results
            await workflow.execute_activity(
                "cleanup_partial_generation",
                args=[book_id],
                start_to_close_timeout=timedelta(seconds=60),
                retry_policy=RetryPolicy(maximum_attempts=2),
            )

            return {
                "book_id": book_id,
                "current_phase": "cancelled",
                "progress_percent": self._progress,
                "errors": [{"phase": "workflow", "message": "Generation was cancelled"}],
            }

        except Exception as exc:
            workflow.logger.error(
                "Workflow failed for book_id=%s: %s", book_id, exc
            )
            self._current_phase = "failed"
            self._errors.append({"phase": "workflow", "message": str(exc)})

            # Log failure event
            try:
                await workflow.execute_activity(
                    "log_book_event",
                    args=[
                        book_id,
                        "generation_failed",
                        {"error": str(exc), "phase": self._current_phase},
                    ],
                    start_to_close_timeout=timedelta(seconds=30),
                    retry_policy=RetryPolicy(maximum_attempts=2),
                )
            except Exception:
                workflow.logger.error("Failed to log failure event")

            raise


@workflow.defn(name="BookRegenerationWorkflow")
class BookRegenerationWorkflow:
    """Workflow for partial regeneration (e.g., regenerate specific pages).

    Used when a user requests changes to specific pages after initial generation.
    """

    @workflow.run
    async def run(self, input_data: dict[str, Any]) -> dict[str, Any]:
        """Run partial regeneration.

        Args:
            input_data: Contains book_id, pages_to_regenerate, and the current state.
        """
        book_id = input_data.get("book_id", "")
        pages = input_data.get("pages_to_regenerate", [])
        workflow.logger.info(
            "Starting partial regen for book_id=%s, pages=%s", book_id, pages
        )

        result = await workflow.execute_activity(
            "run_partial_regeneration",
            args=[input_data],
            start_to_close_timeout=timedelta(minutes=10),
            retry_policy=RetryPolicy(
                maximum_attempts=2,
                initial_interval=timedelta(seconds=5),
            ),
            heartbeat_timeout=timedelta(seconds=120),
        )

        return result
