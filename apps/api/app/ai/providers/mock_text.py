"""Mock text generation provider for development.

Returns pre-generated story content for testing the full pipeline
without real AI API calls. Simulates streaming with async generator.
"""

from __future__ import annotations

import asyncio
import json
import time
from typing import Any, AsyncIterator

from .base import (
    GenerationOptions,
    ProviderCapability,
    TextGenerationProvider,
    TextResult,
)

# Pre-generated Hebrew story blueprint (12 scenes)
MOCK_BLUEPRINT_HE: dict[str, Any] = {
    "title": "מיקה והחתול הקסום בירח",
    "subtitle": "הרפתקה בין כוכבים",
    "theme": "courage",
    "moral": "האומץ האמיתי הוא ללכת קדימה גם כשאתה מפחד",
    "emotional_arc": {
        "1-2": {"emotion": "curiosity", "intensity": 6},
        "3-4": {"emotion": "excitement", "intensity": 8},
        "5-6": {"emotion": "tension", "intensity": 5},
        "7-8": {"emotion": "courage", "intensity": 7},
        "9-10": {"emotion": "triumph", "intensity": 9},
        "11-12": {"emotion": "warmth", "intensity": 8},
    },
    "scenes": [
        {"page_number": 1, "environment": "חצר הבית בלילה עם שמיים זרועי כוכבים", "action": "מיקה מגלה חתול זוהר בחצר", "dialogues": [{"speaker": "narrator", "text": "באחד הלילות, כשהכוכבים נצנצו בשמיים, מיקה ראתה משהו מיוחד בחצר."}], "dominant_emotion": "curiosity", "narrative_role": "introduction", "illustration_hint": "girl discovering glowing cat in moonlit backyard"},
        {"page_number": 2, "environment": "חצר הבית, אור ירח", "action": "החתול מזמין את מיקה להרפתקה", "dialogues": [{"speaker": "cat", "text": "שלום מיקה! אני לונה. רוצה לטוס איתי לירח?"}], "dominant_emotion": "curiosity", "narrative_role": "introduction", "illustration_hint": "magical cat speaking to amazed girl"},
        {"page_number": 3, "environment": "טיסה בחלל", "action": "מיקה ולונה טסות לירח", "dialogues": [{"speaker": "narrator", "text": "לונה הזהירה את זנבה וכוכבות קטנות התפזרו סביבן. ביחד הן עפו גבוה, גבוה לשמיים."}], "dominant_emotion": "excitement", "narrative_role": "rising_action", "illustration_hint": "girl and cat flying through starry space"},
        {"page_number": 4, "environment": "נחיתה על הירח", "action": "הגעה לירח", "dialogues": [{"speaker": "mika", "text": "וואו! הירח כל כך יפה!"}], "dominant_emotion": "excitement", "narrative_role": "rising_action", "illustration_hint": "landing on moon surface with earth in background"},
        {"page_number": 5, "environment": "כפר ירחי", "action": "פגישה עם תושבי הירח", "dialogues": [{"speaker": "moon_creature", "text": "ברוכה הבאה! אנחנו צריכים את עזרתך."}], "dominant_emotion": "curiosity", "narrative_role": "rising_action", "illustration_hint": "friendly moon creatures in a village"},
        {"page_number": 6, "environment": "מערה חשוכה", "action": "גילוי הבעיה - האור נעלם", "dialogues": [{"speaker": "narrator", "text": "האור של הירח כבה. בלי אור, תושבי הירח לא יכולים לראות."}], "dominant_emotion": "tension", "narrative_role": "rising_action", "illustration_hint": "dark cave with fading moon glow"},
        {"page_number": 7, "environment": "שביל חשוך", "action": "מיקה מתגברת על הפחד", "dialogues": [{"speaker": "mika", "text": "אני מפחדת, אבל אני לא אוותר."}, {"speaker": "cat", "text": "אני כאן איתך, תמיד."}], "dominant_emotion": "courage", "narrative_role": "climax", "illustration_hint": "brave girl walking through dark path with glowing cat"},
        {"page_number": 8, "environment": "לב הירח", "action": "מציאת גביש האור", "dialogues": [{"speaker": "narrator", "text": "בלב הירח, מיקה מצאה גביש גדול וזוהר. היא ידעה מה צריך לעשות."}], "dominant_emotion": "courage", "narrative_role": "climax", "illustration_hint": "girl finding glowing crystal in heart of moon"},
        {"page_number": 9, "environment": "לב הירח", "action": "החזרת האור", "dialogues": [{"speaker": "mika", "text": "אני מאמינה!"}], "dominant_emotion": "triumph", "narrative_role": "falling_action", "illustration_hint": "girl holding crystal that lights up everything"},
        {"page_number": 10, "environment": "כפר ירחי מואר", "action": "חגיגה", "dialogues": [{"speaker": "moon_creature", "text": "תודה לך מיקה! את הצילת את הירח!"}], "dominant_emotion": "triumph", "narrative_role": "falling_action", "illustration_hint": "celebration with moon creatures, everything glowing"},
        {"page_number": 11, "environment": "טיסה חזרה", "action": "חזרה הביתה", "dialogues": [{"speaker": "cat", "text": "היית אמיצה מאוד הלילה, מיקה."}], "dominant_emotion": "warmth", "narrative_role": "resolution", "illustration_hint": "flying back to earth, girl hugging cat"},
        {"page_number": 12, "environment": "חדר שינה", "action": "סיום - מיקה במיטה עם לונה", "dialogues": [{"speaker": "narrator", "text": "מיקה חייכה וחיבקה את לונה. היא ידעה שאומץ אמיתי הוא ללכת קדימה, גם כשמפחדים. ובכל לילה, כשהיא מסתכלת על הירח, היא יודעת שהאור שם בזכותה."}], "dominant_emotion": "warmth", "narrative_role": "resolution", "illustration_hint": "girl in bed with cat, moonlight through window"},
    ],
}

MOCK_PAGE_TEXTS_HE = [
    "באחד הלילות, כשהכוכבים נצנצו בשמיים כמו יהלומים קטנים, מיקה יצאה לחצר. שם, ליד העץ הגדול, ישב חתול מיוחד מאוד. הפרווה שלו זהרה באור כסוף.",
    "\"שלום מיקה!\" אמר החתול בקול רך. \"אני לונה, חתולת הירח. רוצה לטוס איתי הלילה?\" מיקה פערה את עיניה בהפתעה. חתול מדבר!",
    "לונה הזהירה את זנבה הארוך וכוכבות קטנות וזוהרות התפזרו באוויר. \"תחזיקי חזק!\" לונה צחקה, ומיקה הרגישה את רגליה עוזבות את הקרקע. ביחד הן עפו גבוה, גבוה מעל הגגות.",
    "\"וואו!\" קראה מיקה כשהגיעו לירח. הקרקע נצצה באור לבן-כחלחל, ובמרחק נראתה כדור הארץ - כחול ויפהפה. \"זה הבית שלנו!\" הצביעה מיקה.",
    "בכפר הירחי חיכו להן יצורים חמודים עם עיניים גדולות ומאירות. \"ברוכה הבאה!\" אמר היצור הגדול ביותר. \"אנחנו צריכים את עזרתך. האור שלנו הולך ונעלם.\"",
    "מיקה הביטה סביב ושמה לב - חלקים מהירח היו חשוכים לגמרי. \"בלי אור,\" לחש היצור הקטן, \"אנחנו לא יכולים למצוא את הדרך הביתה.\" דמעה קטנה זלגה מעינו.",
    "\"אני... אני מפחדת,\" לחשה מיקה כשהסתכלה לתוך המנהרה החשוכה. לונה התחככה בה בעדינות. \"אני כאן איתך, תמיד,\" מלמלה. מיקה נשמה עמוק והתחילה ללכת.",
    "עמוק בלב הירח, מיקה מצאה אותו - גביש גדול ומופלא. הוא עמום אבל היא הרגישה את החום שלו. \"אתה צריך מישהו שמאמין בך,\" לחשה מיקה ונגעה בגביש בעדינות.",
    "\"אני מאמינה!\" קראה מיקה בכל הכוח. הגביש התחיל לזהור, חזק יותר ויותר, עד שאור עצום מילא את כל המערה ויצא החוצה, מאיר את כל הירח!",
    "\"תודה לך מיקה! את הצילת את הירח!\" כל תושבי הכפר רקדו ושרו. הם העניקו למיקה כתר קטן מאבני ירח זוהרות. \"את גיבורת הירח!\"",
    "בדרך חזרה, מיקה חיבקה את לונה חזק. \"היית אמיצה מאוד הלילה,\" לחשה לונה. \"ידעתי שאת יכולה.\" כדור הארץ התקרב, והכוכבים סביבן נראו כמו חברים ישנים.",
    "מיקה נרדמה במיטתה החמה, ולונה התכרבלה ליד רגליה. בכל לילה מאז, כשמיקה מסתכלת על הירח, היא רואה אותו מאיר במיוחד. היא יודעת - האור שם בזכותה. ואומץ אמיתי, היא למדה, הוא ללכת קדימה גם כשמפחדים.",
]


class MockTextProvider(TextGenerationProvider):
    """Mock text provider returning pre-generated Hebrew stories."""

    provider_id: str = "mock_text"

    async def generate_text(
        self,
        prompt: str,
        system_prompt: str,
        options: GenerationOptions | None = None,
    ) -> TextResult:
        await asyncio.sleep(0.1)  # Simulate latency
        # Return the first page text by default
        return TextResult(
            text=MOCK_PAGE_TEXTS_HE[0],
            provider_id=self.provider_id,
            model="mock-v1",
            tokens_input=len(prompt.split()),
            tokens_output=50,
            latency_ms=100,
            cost_usd=0.001,
        )

    async def generate_structured(
        self,
        prompt: str,
        system_prompt: str,
        schema: dict[str, Any],
        options: GenerationOptions | None = None,
    ) -> dict[str, Any]:
        await asyncio.sleep(0.2)
        return MOCK_BLUEPRINT_HE

    async def stream_text(
        self,
        prompt: str,
        system_prompt: str,
        options: GenerationOptions | None = None,
    ) -> AsyncIterator[str]:
        """Stream text word-by-word with 50ms delay per word."""
        text = MOCK_PAGE_TEXTS_HE[0]
        for word in text.split():
            yield word + " "
            await asyncio.sleep(0.05)
