"""Temporal.io worker process.

Spec ref: Ch4.3 — Temporal.io serves as the workflow orchestrator.
The worker polls for tasks and executes book generation workflows.

Run with: python -m worker.main
"""

from __future__ import annotations

import asyncio
import logging

from temporalio.client import Client
from temporalio.worker import Worker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("storymagic.worker")

TEMPORAL_ADDRESS = "localhost:7233"
TEMPORAL_NAMESPACE = "storymagic"
TASK_QUEUE = "book-generation"


async def run_worker() -> None:
    """Connect to Temporal and start the worker."""
    logger.info("Connecting to Temporal at %s", TEMPORAL_ADDRESS)

    client = await Client.connect(
        TEMPORAL_ADDRESS,
        namespace=TEMPORAL_NAMESPACE,
    )

    logger.info("Starting worker on task queue: %s", TASK_QUEUE)

    # Import workflows and activities
    # These will be registered once the full pipeline is built
    worker = Worker(
        client,
        task_queue=TASK_QUEUE,
        workflows=[],  # Will add BookGenerationWorkflow
        activities=[],  # Will add agent activities
    )

    logger.info("Worker started. Polling for tasks...")
    await worker.run()


def main() -> None:
    """Entry point for the worker process."""
    asyncio.run(run_worker())


if __name__ == "__main__":
    main()
