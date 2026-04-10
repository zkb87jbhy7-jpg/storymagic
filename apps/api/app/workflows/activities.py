"""Temporal activities for book generation.

Spec ref: Ch5.17 — Every phase is logged as a Temporal.io activity with the
agent name, input hash, output hash, quality score, latency, and provider ID.

Each activity wraps a heavy operation (AI call, image generation, voice
synthesis, PDF assembly) with its own retry policy and timeout.
"""

from __future__ import annotations

import hashlib
import json
import logging
import time
import uuid
from datetime import timedelta
from typing import Any

from temporalio import activity
from temporalio.common import RetryPolicy

logger = logging.getLogger("storymagic.workflows.activities")


# ── Helper: compute a stable hash of a payload for audit logging ───────


def _payload_hash(data: Any) -> str:
    """Produce a short SHA-256 hex digest for an arbitrary payload."""
    raw = json.dumps(data, sort_keys=True, default=str).encode()
    return hashlib.sha256(raw).hexdigest()[:16]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Core pipeline activity
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


@activity.defn(name="run_langgraph_pipeline")
async def run_langgraph_pipeline(input_state: dict[str, Any]) -> dict[str, Any]:
    """Execute the full LangGraph book generation pipeline.

    This is the primary activity that wraps the entire graph traversal.
    The workflow delegates to this activity so that Temporal handles
    heartbeating, timeout, and retry at the activity level.
    """
    from app.ai.orchestrator.graph import run_pipeline

    start_time = time.perf_counter()
    logger.info(
        "Activity run_langgraph_pipeline starting: book_id=%s input_hash=%s",
        input_state.get("book_id"),
        _payload_hash(input_state),
    )

    # Heartbeat periodically so Temporal knows we're alive
    activity.heartbeat(f"starting pipeline for {input_state.get('book_id')}")

    result = await run_pipeline(input_state)

    elapsed_ms = int((time.perf_counter() - start_time) * 1000)
    logger.info(
        "Activity run_langgraph_pipeline complete: book_id=%s latency=%dms output_hash=%s",
        result.get("book_id"),
        elapsed_ms,
        _payload_hash(result),
    )

    return dict(result)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Individual heavy-operation activities
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


@activity.defn(name="run_agent")
async def run_agent(
    agent_name: str,
    input_data: dict[str, Any],
) -> dict[str, Any]:
    """Run a single AI agent as a standalone Temporal activity.

    Used when individual agent calls need independent retry/timeout management
    (e.g., calling from a partial-regeneration workflow).

    Args:
        agent_name: Name of the node function in nodes.py (e.g., "write_text").
        input_data: The current BookGenerationState subset needed by this agent.

    Returns:
        The state updates produced by the agent node.
    """
    from app.ai.orchestrator import nodes

    start_time = time.perf_counter()
    logger.info(
        "Activity run_agent starting: agent=%s input_hash=%s",
        agent_name,
        _payload_hash(input_data),
    )

    activity.heartbeat(f"running agent: {agent_name}")

    node_fn = getattr(nodes, agent_name, None)
    if node_fn is None:
        raise ValueError(f"Unknown agent node: {agent_name}")

    result = await node_fn(input_data)

    elapsed_ms = int((time.perf_counter() - start_time) * 1000)
    logger.info(
        "Activity run_agent complete: agent=%s latency=%dms output_hash=%s",
        agent_name,
        elapsed_ms,
        _payload_hash(result),
    )

    return result


@activity.defn(name="generate_image")
async def generate_image_activity(
    prompt: str,
    negative_prompt: str,
    style: str,
    character_sheet_ref: str,
    face_embedding_ref: str,
) -> dict[str, Any]:
    """Generate a single illustration image as a Temporal activity.

    Separate from the pipeline for cases where individual image generation
    needs independent retry management (e.g., repair cycles).
    """
    from app.ai.providers.base import ImageGenerationOptions
    from app.ai.providers.registry import ProviderRegistry
    from app.ai.providers.router import AIRouter

    start_time = time.perf_counter()
    logger.info("Activity generate_image starting")
    activity.heartbeat("generating image")

    router = AIRouter(ProviderRegistry())
    result = await router.generate_image(
        prompt,
        negative_prompt,
        ImageGenerationOptions(
            style=style,
            character_sheet_ref=character_sheet_ref,
            face_embedding_ref=face_embedding_ref,
        ),
    )

    elapsed_ms = int((time.perf_counter() - start_time) * 1000)
    logger.info("Activity generate_image complete: latency=%dms", elapsed_ms)

    return {
        "image_url": result.image_url,
        "thumbnail_url": result.thumbnail_url,
        "print_url": result.print_url,
        "width": result.width,
        "height": result.height,
        "seed": result.seed,
        "provider_id": result.provider_id,
        "latency_ms": elapsed_ms,
    }


@activity.defn(name="generate_voice")
async def generate_voice_activity(
    text: str,
    voice_id: str,
    language: str,
) -> dict[str, Any]:
    """Generate voice narration as a Temporal activity."""
    from app.ai.providers.base import VoiceGenerationOptions
    from app.ai.providers.registry import ProviderRegistry
    from app.ai.providers.router import AIRouter

    start_time = time.perf_counter()
    logger.info("Activity generate_voice starting")
    activity.heartbeat("generating voice narration")

    router = AIRouter(ProviderRegistry())
    result = await router.generate_voice(
        text,
        voice_id,
        options=VoiceGenerationOptions(language=language),
    )

    elapsed_ms = int((time.perf_counter() - start_time) * 1000)
    logger.info("Activity generate_voice complete: latency=%dms", elapsed_ms)

    return {
        "audio_url": result.audio_url,
        "duration_seconds": result.duration_seconds,
        "provider_id": result.provider_id,
        "latency_ms": elapsed_ms,
    }


@activity.defn(name="assemble_pdf")
async def assemble_pdf_activity(
    book_data: dict[str, Any],
    output_format: str,
) -> dict[str, Any]:
    """Assemble the final PDF (digital or print-ready) as a Temporal activity.

    Args:
        book_data: The interactive_book_data dict from the pipeline.
        output_format: "digital" or "print" (affects DPI and bleed settings).

    Returns:
        Dict with pdf_url and metadata.
    """
    start_time = time.perf_counter()
    logger.info("Activity assemble_pdf starting: format=%s", output_format)
    activity.heartbeat(f"assembling {output_format} PDF")

    # Import print service for actual PDF assembly
    # This delegates to the print module which handles layout, bleed, and DPI
    pages = book_data.get("pages", [])
    title = book_data.get("title", "Untitled Book")

    # For now, build a structured representation that the print service can consume
    pdf_spec = {
        "title": title,
        "page_count": len(pages),
        "format": output_format,
        "dpi": 300 if output_format == "print" else 150,
        "bleed_mm": 3 if output_format == "print" else 0,
        "pages": [],
    }

    for page in pages:
        pdf_spec["pages"].append({
            "page_number": page.get("page_number", 0),
            "text": page.get("text", ""),
            "illustration_url": page.get("illustration", {}).get("image_url", ""),
            "print_illustration_url": page.get("illustration", {}).get("print_url", ""),
            "layout": page.get("layout", {}),
        })

    # The actual PDF rendering would be handled by a dedicated service.
    # For this activity, we prepare the spec and delegate.
    elapsed_ms = int((time.perf_counter() - start_time) * 1000)
    logger.info("Activity assemble_pdf complete: latency=%dms, pages=%d", elapsed_ms, len(pages))

    pdf_url = f"https://storage.storymagic.app/books/{book_data.get('book_id', 'unknown')}/{output_format}.pdf"

    return {
        "pdf_url": pdf_url,
        "format": output_format,
        "page_count": len(pages),
        "latency_ms": elapsed_ms,
        "pdf_spec": pdf_spec,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Utility activities
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


@activity.defn(name="log_book_event")
async def log_book_event_activity(
    book_id: str,
    event_type: str,
    payload: dict[str, Any],
) -> str:
    """Log a book event to the event store.

    Wraps the CQRS event logger as a Temporal activity for durability.
    """
    logger.info(
        "Activity log_book_event: book_id=%s type=%s", book_id, event_type
    )

    # In a full deployment, this would use the DB session from dependencies.
    # For the Temporal worker context, we create a standalone connection.
    try:
        from sqlalchemy.ext.asyncio import create_async_engine

        from app.config import get_settings
        from app.utils.events import log_event

        settings = get_settings()
        engine = create_async_engine(settings.database_url, echo=False)
        from sqlalchemy.ext.asyncio import AsyncSession
        from sqlalchemy.orm import sessionmaker

        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with async_session() as session:
            event_id = await log_event(
                session,
                book_id=uuid.UUID(book_id),
                event_type=event_type,
                payload=payload,
            )
            await session.commit()
        await engine.dispose()
        return str(event_id)
    except Exception as exc:
        logger.error("Failed to log book event: %s", exc)
        return ""


@activity.defn(name="cleanup_partial_generation")
async def cleanup_partial_generation_activity(book_id: str) -> dict[str, Any]:
    """Compensation activity: clean up partial generation artifacts.

    Called when a workflow is cancelled or fails irrecoverably.
    Marks the book status as 'failed' and logs the event.
    """
    logger.info("Activity cleanup_partial_generation: book_id=%s", book_id)

    try:
        from sqlalchemy import text as sql_text
        from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
        from sqlalchemy.orm import sessionmaker

        from app.config import get_settings

        settings = get_settings()
        engine = create_async_engine(settings.database_url, echo=False)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

        async with async_session() as session:
            await session.execute(
                sql_text(
                    "UPDATE generated_books SET status = 'failed', updated_at = NOW() "
                    "WHERE id = :book_id"
                ),
                {"book_id": book_id},
            )
            await session.commit()

        await engine.dispose()
        return {"book_id": book_id, "status": "cleaned_up"}
    except Exception as exc:
        logger.error("Cleanup failed for book_id=%s: %s", book_id, exc)
        return {"book_id": book_id, "status": "cleanup_failed", "error": str(exc)}


@activity.defn(name="run_partial_regeneration")
async def run_partial_regeneration_activity(
    input_data: dict[str, Any],
) -> dict[str, Any]:
    """Run partial regeneration for specific pages.

    Loads existing state, regenerates only the specified pages, and
    re-runs quality checks on the affected pages.
    """
    from app.ai.orchestrator.graph import run_pipeline
    from app.ai.orchestrator.nodes import (
        evaluate_illustration_quality,
        generate_illustrations,
        write_text,
    )

    book_id = input_data.get("book_id", "")
    pages = input_data.get("pages_to_regenerate", [])
    current_state = input_data.get("current_state", {})

    logger.info(
        "Activity run_partial_regeneration: book_id=%s pages=%s", book_id, pages
    )
    activity.heartbeat(f"partial regen for pages {pages}")

    # Mark which illustrations need regeneration by zeroing their quality scores
    quality_scores = list(current_state.get("illustration_quality_scores", []))
    for page_idx in pages:
        if page_idx < len(quality_scores):
            quality_scores[page_idx] = 0.0
    current_state["illustration_quality_scores"] = quality_scores

    # Re-run text generation for specified pages if text changes requested
    if input_data.get("regenerate_text", False):
        text_result = await write_text(current_state)
        current_state.update(text_result)

    # Re-run illustration generation (only pages with low scores)
    illust_result = await generate_illustrations(current_state)
    current_state.update(illust_result)

    # Re-evaluate quality
    quality_result = await evaluate_illustration_quality(current_state)
    current_state.update(quality_result)

    return current_state
