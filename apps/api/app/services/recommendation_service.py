"""Recommendation service — personalised and seasonal book suggestions.

Powers the AI recommendation engine (Chapter 3.5) that suggests
new book topics based on child age, reading history, life transitions,
and seasonal calendar.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.book import GeneratedBook
from app.models.child import ChildProfile

# Seasonal themes mapped to month ranges (Hebrew calendar focus)
_SEASONAL_THEMES: list[dict[str, Any]] = [
    {
        "id": "rosh_hashana",
        "title": "Rosh Hashana Story",
        "title_he": "סיפור לראש ה��נה",
        "months": [9],
        "category": "holidays",
        "description": "A new year adventure with apples, honey, and new beginnings",
    },
    {
        "id": "sukkot",
        "title": "Sukkot Story",
        "title_he": "סיפור לסוכות",
        "months": [9, 10],
        "category": "holidays",
        "description": "Building a sukkah and welcoming guests",
    },
    {
        "id": "hanukkah",
        "title": "Hanukkah Story",
        "title_he": "סיפור לחנוכה",
        "months": [12],
        "category": "holidays",
        "description": "Dreidels, candles, and the miracle of light",
    },
    {
        "id": "purim",
        "title": "Purim Story",
        "title_he": "סיפור לפורים",
        "months": [3],
        "category": "holidays",
        "description": "Costumes, hamantaschen, and the Megillah",
    },
    {
        "id": "passover",
        "title": "Passover Story",
        "title_he": "ס��פור לפסח",
        "months": [3, 4],
        "category": "holidays",
        "description": "The journey to freedom and the Seder night",
    },
    {
        "id": "back_to_school",
        "title": "Back to School",
        "title_he": "חזרה ללימודים",
        "months": [8, 9],
        "category": "life_transitions",
        "description": "Starting a new school year with confidence",
    },
    {
        "id": "summer_adventure",
        "title": "Summer Adventure",
        "title_he": "הרפתקת קיץ",
        "months": [6, 7, 8],
        "category": "adventure",
        "description": "A magical summer adventure",
    },
    {
        "id": "birthday",
        "title": "Birthday Celebration",
        "title_he": "חגיגת יום הולדת",
        "months": list(range(1, 13)),
        "category": "celebration",
        "description": "A special birthday story for the child",
    },
]

# Topic suggestions by age group
_AGE_TOPICS: dict[str, list[dict[str, Any]]] = {
    "2-4": [
        {"topic": "Colors and Shapes", "category": "learning", "mood": "educational"},
        {"topic": "Animal Friends", "category": "friendship", "mood": "calm"},
        {"topic": "Bedtime Magic", "category": "bedtime", "mood": "bedtime"},
        {"topic": "My First Day", "category": "life_transitions", "mood": "empowering"},
    ],
    "5-7": [
        {"topic": "Space Explorer", "category": "adventure", "mood": "adventurous"},
        {"topic": "Ocean Discovery", "category": "learning", "mood": "educational"},
        {"topic": "Friendship Quest", "category": "friendship", "mood": "empowering"},
        {"topic": "Dinosaur Adventure", "category": "adventure", "mood": "funny"},
        {"topic": "Feelings Workshop", "category": "emotions", "mood": "emotional"},
    ],
    "8-10": [
        {"topic": "Mystery in the Library", "category": "adventure", "mood": "adventurous"},
        {"topic": "Time Travel Discovery", "category": "adventure", "mood": "educational"},
        {"topic": "Coding Adventure", "category": "learning", "mood": "empowering"},
        {"topic": "Environmental Hero", "category": "learning", "mood": "empowering"},
        {"topic": "Cultural Explorer", "category": "adventure", "mood": "educational"},
    ],
}


class RecommendationService:
    """Business logic for personalised book recommendations."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_personalized(
        self,
        user_id: uuid.UUID,
        *,
        child_id: uuid.UUID | None = None,
        limit: int = 5,
    ) -> dict[str, Any]:
        """Generate personalised book recommendations for a user.

        Takes into account the child's age, previous books, preferences,
        and reading history.  In production this calls the AI
        recommendation model; currently returns rule-based suggestions.

        Args:
            user_id: UUID of the user.
            child_id: UUID of a specific child (if ``None``, returns
                recommendations for the first child).
            limit: Maximum number of recommendations.

        Returns:
            Dictionary with ``user_id``, ``child_id``, and
            ``recommendations`` list.
        """
        # Find child profile
        child: ChildProfile | None = None
        if child_id:
            stmt = select(ChildProfile).where(
                ChildProfile.id == child_id,
                ChildProfile.user_id == user_id,
            )
            result = await self._db.execute(stmt)
            child = result.scalar_one_or_none()
        else:
            stmt = (
                select(ChildProfile)
                .where(ChildProfile.user_id == user_id)
                .order_by(ChildProfile.created_at.asc())
                .limit(1)
            )
            result = await self._db.execute(stmt)
            child = result.scalar_one_or_none()

        if child is None:
            return {
                "user_id": str(user_id),
                "child_id": None,
                "recommendations": [],
                "message": "Add a child profile to get personalised recommendations",
            }

        # Determine age group
        age = self._calculate_age(child.birth_date)
        age_group = self._get_age_group(age)

        # Get previously created book topics to avoid repetition
        books_stmt = (
            select(GeneratedBook.free_prompt, GeneratedBook.creation_method)
            .where(GeneratedBook.user_id == user_id)
            .order_by(GeneratedBook.created_at.desc())
            .limit(10)
        )
        books_result = await self._db.execute(books_stmt)
        previous_prompts = {row.free_prompt for row in books_result.all() if row.free_prompt}

        # Get age-appropriate topics
        topics = _AGE_TOPICS.get(age_group, _AGE_TOPICS["5-7"])

        # Filter out topics similar to previous books (simple keyword match)
        recommendations: list[dict[str, Any]] = []
        for topic in topics:
            if len(recommendations) >= limit:
                break

            # Simple dedup: skip if the topic keyword appears in any previous prompt
            is_duplicate = any(
                topic["topic"].lower() in (p or "").lower()
                for p in previous_prompts
            )
            if is_duplicate:
                continue

            recommendations.append({
                "topic": topic["topic"],
                "category": topic["category"],
                "mood": topic["mood"],
                "suggested_prompt": f"A story about {child.name} who goes on a {topic['topic'].lower()} adventure",
                "age_appropriate": True,
                "reason": f"Recommended for ages {age_group}",
            })

        # Add "Book of the Week" if we have room
        if len(recommendations) < limit:
            today = date.today()
            month = today.month
            seasonal = [s for s in _SEASONAL_THEMES if month in s["months"]]
            if seasonal:
                theme = seasonal[0]
                recommendations.append({
                    "topic": theme["title"],
                    "category": theme["category"],
                    "mood": "seasonal",
                    "suggested_prompt": f"A {theme['title'].lower()} story starring {child.name}",
                    "age_appropriate": True,
                    "reason": "Book of the Week - seasonal recommendation",
                    "is_book_of_week": True,
                })

        return {
            "user_id": str(user_id),
            "child_id": str(child.id),
            "child_name": child.name,
            "age": age,
            "age_group": age_group,
            "recommendations": recommendations[:limit],
        }

    async def get_seasonal(
        self,
        *,
        month: int | None = None,
        language: str = "he",
    ) -> dict[str, Any]:
        """Return seasonal/holiday book themes for the given month.

        Args:
            month: Calendar month (1-12). Defaults to current month.
            language: Language code for localised titles.

        Returns:
            Dictionary with ``month``, ``themes`` list, and
            ``book_of_the_week``.
        """
        if month is None:
            month = datetime.now(timezone.utc).month

        if not (1 <= month <= 12):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Month must be between 1 and 12",
            )

        themes = [
            {
                "id": t["id"],
                "title": t.get("title_he") if language == "he" else t["title"],
                "description": t["description"],
                "category": t["category"],
            }
            for t in _SEASONAL_THEMES
            if month in t["months"]
        ]

        book_of_week = themes[0] if themes else None

        return {
            "month": month,
            "language": language,
            "themes": themes,
            "book_of_the_week": book_of_week,
        }

    # ── Internal helpers ──────────────��─────────────────────────────────

    @staticmethod
    def _calculate_age(birth_date: date | None) -> int | None:
        """Calculate age in years from birth date."""
        if birth_date is None:
            return None
        today = date.today()
        age = today.year - birth_date.year
        if (today.month, today.day) < (birth_date.month, birth_date.day):
            age -= 1
        return max(0, age)

    @staticmethod
    def _get_age_group(age: int | None) -> str:
        """Map a numeric age to an age group key."""
        if age is None:
            return "5-7"
        if age <= 4:
            return "2-4"
        if age <= 7:
            return "5-7"
        return "8-10"
