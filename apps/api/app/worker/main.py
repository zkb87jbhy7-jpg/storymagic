"""Temporal worker for StoryMagic book generation.

Spec ref: Ch5.17 — Every phase is logged as a Temporal.io activity.
This worker connects to the Temporal server, registers all workflows and
activities, and starts polling the task queue for work.

Usage:
    python -m app.worker.main
"""

from __future__ import annotations

import asyncio
import logging
import signal
import sys
from typing import Any

from temporalio.client import Client
from temporalio.worker import Worker

from app.config import get_settings
from app.workflows.activities import (
    assemble_pdf_activity,
    cleanup_partial_generation_activity,
    generate_image_activity,
    generate_voice_activity,
    log_book_event_activity,
    run_agent,
    run_langgraph_pipeline,
    run_partial_regeneration_activity,
)
from app.workflows.book_generation import (
    BookGenerationWorkflow,
    BookRegenerationWorkflow,
)

logger = logging.getLogger("storymagic.worker")

# All workflows registered with this worker
WORKFLOWS = [
    BookGenerationWorkflow,
    BookRegenerationWorkflow,
]

# All activities registered with this worker
ACTIVITIES = [
    run_langgraph_pipeline,
    run_agent,
    generate_image_activity,
    generate_voice_activity,
    assemble_pdf_activity,
    log_book_event_activity,
    cleanup_partial_generation_activity,
    run_partial_regeneration_activity,
]


async def create_worker() -> Worker:
    """Create and configure the Temporal worker.

    Connects to the Temporal server using settings from environment variables,
    registers all workflows and activities, and returns a ready-to-run Worker.
    """
    settings = get_settings()

    logger.info(
        "Connecting to Temporal server at %s, namespace=%s",
        settings.temporal_address,
        settings.temporal_namespace,
    )

    client = await Client.connect(
        settings.temporal_address,
        namespace=settings.temporal_namespace,
    )

    worker = Worker(
        client,
        task_queue=settings.temporal_task_queue,
        workflows=WORKFLOWS,
        activities=ACTIVITIES,
        max_concurrent_activities=10,
        max_concurrent_workflow_tasks=5,
    )

    logger.info(
        "Worker created: task_queue=%s, workflows=%d, activities=%d",
        settings.temporal_task_queue,
        len(WORKFLOWS),
        len(ACTIVITIES),
    )

    return worker


async def run_worker() -> None:
    """Start the Temporal worker and run until interrupted.

    Handles graceful shutdown on SIGINT/SIGTERM.
    """
    worker = await create_worker()

    shutdown_event = asyncio.Event()

    def _signal_handler(sig: int, frame: Any) -> None:
        logger.info("Received signal %s, initiating graceful shutdown...", sig)
        shutdown_event.set()

    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, _signal_handler)
    signal.signal(signal.SIGTERM, _signal_handler)

    logger.info("Starting Temporal worker... Press Ctrl+C to stop.")

    # Run the worker with graceful shutdown support
    async with worker:
        await shutdown_event.wait()

    logger.info("Worker shut down successfully.")


def main() -> None:
    """Entry point for the Temporal worker process."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    logger.info("StoryMagic Temporal Worker starting...")
    asyncio.run(run_worker())


if __name__ == "__main__":
    main()
