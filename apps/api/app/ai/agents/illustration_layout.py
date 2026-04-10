"""
Agent A-06: Illustration Layout — Determines optimal layout for text and
illustration on each page.

Spec ref: Chapter 5.7 — Fixed rules: opening = full_illustration_text_overlay,
climax = full_spread, dialogue = side_by_side (flipped for RTL). 3mm bleed,
gutter margins.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from typing import Any

from .base_agent import AgentResult, BaseAgent

logger = logging.getLogger("storymagic.agents.illustration_layout")


# ---------------------------------------------------------------------------
# Layout types
# ---------------------------------------------------------------------------

LAYOUT_FULL_ILLUSTRATION_OVERLAY = "full_illustration_text_overlay"
LAYOUT_TOP_ILLUSTRATION_BOTTOM_TEXT = "top_illustration_bottom_text"
LAYOUT_SIDE_BY_SIDE = "side_by_side"
LAYOUT_FULL_SPREAD = "full_spread"
LAYOUT_TEXT_ONLY_BORDER = "text_only_decorative_border"

# Print safety (mm)
BLEED_MM = 3.0
GUTTER_MARGIN_MM = 15.0
TRIM_MARGIN_MM = 5.0

# Page dimensions at 300 DPI (A4 landscape-ish children's book page)
PAGE_WIDTH_PX = 2480
PAGE_HEIGHT_PX = 1748


@dataclass
class SafeZone:
    """Defines safe areas for text and illustration placement."""

    bleed_px: float
    gutter_px: float
    trim_px: float
    text_area_x: float
    text_area_y: float
    text_area_width: float
    text_area_height: float
    illustration_area_x: float
    illustration_area_y: float
    illustration_area_width: float
    illustration_area_height: float


@dataclass
class LayoutResult:
    """Complete layout specification for a single page."""

    page_number: int
    layout_type: str
    text_position: str
    illustration_area: dict[str, float] = field(default_factory=dict)
    text_area: dict[str, float] = field(default_factory=dict)
    safe_zones: dict[str, float] = field(default_factory=dict)
    is_rtl: bool = False
    is_spread: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "page_number": self.page_number,
            "layout_type": self.layout_type,
            "text_position": self.text_position,
            "illustration_area": self.illustration_area,
            "text_area": self.text_area,
            "safe_zones": self.safe_zones,
            "is_rtl": self.is_rtl,
            "is_spread": self.is_spread,
        }


def _mm_to_px(mm: float, dpi: int = 300) -> float:
    return mm * dpi / 25.4


class IllustrationLayoutAgent(BaseAgent):
    """A-06 — Determines page layouts using fixed rules (no LLM needed)."""

    agent_id = "illustration_layout"

    async def execute(self, **kwargs: Any) -> AgentResult:
        """
        Parameters
        ----------
        pages : list[dict]          — [{page_number, text, narrative_role}]
        language : str              — determines RTL
        page_count : int
        book_id : str
        """
        start = time.perf_counter()
        pages: list[dict[str, Any]] = kwargs["pages"]
        language: str = kwargs.get("language", "he")
        page_count: int = kwargs.get("page_count", len(pages))
        book_id: str = kwargs.get("book_id", "unknown")

        is_rtl = language in ("he", "ar")

        bleed_px = _mm_to_px(BLEED_MM)
        gutter_px = _mm_to_px(GUTTER_MARGIN_MM)
        trim_px = _mm_to_px(TRIM_MARGIN_MM)

        layouts: list[dict[str, Any]] = []

        for page in pages:
            page_num = page.get("page_number", 0)
            text = page.get("text", "")
            narrative_role = page.get("narrative_role", "")
            text_length = len(text.split())
            has_dialogue = bool(page.get("dialogues")) or '\"' in text or '"' in text

            layout = self._determine_layout(
                page_num=page_num,
                narrative_role=narrative_role,
                text_length=text_length,
                has_dialogue=has_dialogue,
                page_count=page_count,
                is_rtl=is_rtl,
                bleed_px=bleed_px,
                gutter_px=gutter_px,
                trim_px=trim_px,
            )
            layouts.append(layout.to_dict())

        latency = self._elapsed_ms(start)
        self._log_event(
            book_id,
            "illustration_layout_complete",
            {"page_count": len(layouts), "is_rtl": is_rtl},
            latency_ms=latency,
        )

        return AgentResult(
            agent_id=self.agent_id,
            success=True,
            data={"layouts": layouts},
            latency_ms=latency,
        )

    def _determine_layout(
        self,
        page_num: int,
        narrative_role: str,
        text_length: int,
        has_dialogue: bool,
        page_count: int,
        is_rtl: bool,
        bleed_px: float,
        gutter_px: float,
        trim_px: float,
    ) -> LayoutResult:
        """Apply fixed layout rules from the spec."""

        safe_inner_x = bleed_px + trim_px
        safe_inner_y = bleed_px + trim_px
        safe_width = PAGE_WIDTH_PX - 2 * safe_inner_x
        safe_height = PAGE_HEIGHT_PX - 2 * safe_inner_y

        safe_zones = {
            "bleed_px": bleed_px,
            "gutter_px": gutter_px,
            "trim_px": trim_px,
            "inner_x": safe_inner_x,
            "inner_y": safe_inner_y,
            "inner_width": safe_width,
            "inner_height": safe_height,
        }

        # Rule 1: Opening page = full illustration with text overlay
        if page_num == 1 or narrative_role == "introduction":
            return LayoutResult(
                page_number=page_num,
                layout_type=LAYOUT_FULL_ILLUSTRATION_OVERLAY,
                text_position="bottom_center" if not is_rtl else "bottom_right",
                illustration_area={
                    "x": 0, "y": 0,
                    "width": PAGE_WIDTH_PX, "height": PAGE_HEIGHT_PX,
                },
                text_area={
                    "x": safe_inner_x + gutter_px,
                    "y": PAGE_HEIGHT_PX * 0.7,
                    "width": safe_width - gutter_px,
                    "height": PAGE_HEIGHT_PX * 0.25,
                },
                safe_zones=safe_zones,
                is_rtl=is_rtl,
            )

        # Rule 2: Climax = full spread (if page count allows)
        if narrative_role == "climax" and page_count >= 8:
            return LayoutResult(
                page_number=page_num,
                layout_type=LAYOUT_FULL_SPREAD,
                text_position="bottom_center",
                illustration_area={
                    "x": 0, "y": 0,
                    "width": PAGE_WIDTH_PX * 2, "height": PAGE_HEIGHT_PX,
                },
                text_area={
                    "x": safe_inner_x,
                    "y": PAGE_HEIGHT_PX * 0.75,
                    "width": PAGE_WIDTH_PX * 2 - 2 * safe_inner_x,
                    "height": PAGE_HEIGHT_PX * 0.2,
                },
                safe_zones=safe_zones,
                is_rtl=is_rtl,
                is_spread=True,
            )

        # Rule 3: Dialogue pages = side-by-side (flipped for RTL)
        if has_dialogue:
            if is_rtl:
                # RTL: illustration right, text left
                return LayoutResult(
                    page_number=page_num,
                    layout_type=LAYOUT_SIDE_BY_SIDE,
                    text_position="left",
                    illustration_area={
                        "x": PAGE_WIDTH_PX * 0.5, "y": safe_inner_y,
                        "width": PAGE_WIDTH_PX * 0.5 - safe_inner_x,
                        "height": safe_height,
                    },
                    text_area={
                        "x": safe_inner_x + gutter_px, "y": safe_inner_y,
                        "width": PAGE_WIDTH_PX * 0.5 - safe_inner_x - gutter_px,
                        "height": safe_height,
                    },
                    safe_zones=safe_zones,
                    is_rtl=is_rtl,
                )
            else:
                # LTR: illustration left, text right
                return LayoutResult(
                    page_number=page_num,
                    layout_type=LAYOUT_SIDE_BY_SIDE,
                    text_position="right",
                    illustration_area={
                        "x": safe_inner_x, "y": safe_inner_y,
                        "width": PAGE_WIDTH_PX * 0.5 - safe_inner_x,
                        "height": safe_height,
                    },
                    text_area={
                        "x": PAGE_WIDTH_PX * 0.5 + gutter_px, "y": safe_inner_y,
                        "width": PAGE_WIDTH_PX * 0.5 - safe_inner_x - gutter_px,
                        "height": safe_height,
                    },
                    safe_zones=safe_zones,
                    is_rtl=is_rtl,
                )

        # Rule 4: Short text = full illustration with overlay
        if text_length <= 20:
            return LayoutResult(
                page_number=page_num,
                layout_type=LAYOUT_FULL_ILLUSTRATION_OVERLAY,
                text_position="bottom_center",
                illustration_area={
                    "x": 0, "y": 0,
                    "width": PAGE_WIDTH_PX, "height": PAGE_HEIGHT_PX,
                },
                text_area={
                    "x": safe_inner_x, "y": PAGE_HEIGHT_PX * 0.75,
                    "width": safe_width, "height": PAGE_HEIGHT_PX * 0.2,
                },
                safe_zones=safe_zones,
                is_rtl=is_rtl,
            )

        # Default: top illustration, bottom text
        return LayoutResult(
            page_number=page_num,
            layout_type=LAYOUT_TOP_ILLUSTRATION_BOTTOM_TEXT,
            text_position="bottom",
            illustration_area={
                "x": safe_inner_x, "y": safe_inner_y,
                "width": safe_width, "height": safe_height * 0.6,
            },
            text_area={
                "x": safe_inner_x + gutter_px,
                "y": safe_inner_y + safe_height * 0.65,
                "width": safe_width - gutter_px,
                "height": safe_height * 0.35,
            },
            safe_zones=safe_zones,
            is_rtl=is_rtl,
        )
