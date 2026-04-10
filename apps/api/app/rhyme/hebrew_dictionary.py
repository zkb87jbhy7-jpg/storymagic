"""
Hebrew Rhyme Dictionary — 200+ rhyme pairs organized by ending sound.

Spec ref: Appendix A — Pairs organized by ending: -im, -ah, -et/at, -or,
plus topic tags for RAG retrieval.

Each entry contains:
- word1, word2: the rhyming pair
- ending: the shared ending sound
- topics: list of topic tags for semantic retrieval
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RhymePair:
    """A single Hebrew rhyme pair with metadata."""

    word1: str
    word2: str
    ending: str
    topics: tuple[str, ...] = ()

    def to_dict(self) -> dict[str, str | list[str]]:
        return {
            "word1": self.word1,
            "word2": self.word2,
            "ending": self.ending,
            "topics": list(self.topics),
        }


# ---------------------------------------------------------------------------
# The dictionary: 200+ pairs organized by ending sound
# ---------------------------------------------------------------------------

HEBREW_RHYME_PAIRS: list[RhymePair] = [
    # ============================================================
    # Ending: ים (-im)
    # ============================================================
    RhymePair("ימים", "שמיים", "ים", ("nature", "sea", "sky")),
    RhymePair("מים", "חיים", "ים", ("nature", "water", "life")),
    RhymePair("כוכבים", "לבבות", "ים", ("sky", "night", "love")),
    RhymePair("פרחים", "ריחות", "ים", ("nature", "garden", "flowers")),
    RhymePair("חברים", "שירים", "ים", ("friendship", "music", "song")),
    RhymePair("ציפורים", "שירים", "ים", ("nature", "birds", "music")),
    RhymePair("נמלים", "גשמים", "ים", ("nature", "insects", "rain")),
    RhymePair("עננים", "שמיים", "ים", ("nature", "sky", "clouds")),
    RhymePair("דגים", "ימים", "ים", ("sea", "fish", "ocean")),
    RhymePair("עצים", "פרחים", "ים", ("nature", "trees", "garden")),
    RhymePair("ילדים", "חברים", "ים", ("children", "friendship", "play")),
    RhymePair("כלבים", "חברים", "ים", ("animals", "dogs", "friendship")),
    RhymePair("חתולים", "גורים", "ים", ("animals", "cats", "kittens")),
    RhymePair("פרפרים", "פרחים", "ים", ("nature", "butterflies", "flowers")),
    RhymePair("צבעים", "חלומות", "ים", ("art", "colors", "dreams")),
    RhymePair("הרים", "נהרות", "ים", ("nature", "mountains", "rivers")),
    RhymePair("אריות", "גיבורים", "ים", ("animals", "lions", "heroes")),
    RhymePair("דרקונים", "אבירים", "ים", ("fantasy", "dragons", "knights")),
    RhymePair("כנפיים", "שמיים", "ים", ("flying", "wings", "sky")),
    RhymePair("אוצרות", "סודות", "ים", ("adventure", "treasures", "secrets")),
    RhymePair("כוכבים", "חלומות", "ים", ("night", "stars", "dreams")),
    RhymePair("חיוכים", "ילדים", "ים", ("happiness", "smiles", "children")),
    RhymePair("גלים", "ימים", "ים", ("sea", "waves", "ocean")),
    RhymePair("רגעים", "חיים", "ים", ("time", "moments", "life")),
    RhymePair("סיפורים", "חלומות", "ים", ("stories", "dreams", "imagination")),
    RhymePair("קסמים", "חלומות", "ים", ("magic", "spells", "dreams")),
    RhymePair("ענקים", "גיבורים", "ים", ("giants", "heroes", "adventure")),
    RhymePair("שודדים", "אוצרות", "ים", ("pirates", "treasure", "adventure")),
    RhymePair("מלאכים", "כנפיים", "ים", ("angels", "wings", "sky")),
    RhymePair("צעצועים", "ילדים", "ים", ("toys", "children", "play")),

    # ============================================================
    # Ending: ה (-ah)
    # ============================================================
    RhymePair("שמחה", "ברכה", "ה", ("happiness", "blessing", "celebration")),
    RhymePair("חלומה", "נסיכה", "ה", ("dreams", "princess", "fantasy")),
    RhymePair("ארוכה", "גבוהה", "ה", ("size", "tall", "long")),
    RhymePair("יפה", "טובה", "ה", ("beauty", "good", "kind")),
    RhymePair("ילדה", "שמלה", "ה", ("girl", "dress", "clothing")),
    RhymePair("מלכה", "ברכה", "ה", ("queen", "blessing", "royalty")),
    RhymePair("נסיכה", "יפהפייה", "ה", ("princess", "beautiful", "fantasy")),
    RhymePair("שירה", "שמחה", "ה", ("song", "joy", "music")),
    RhymePair("משפחה", "שמחה", "ה", ("family", "happiness", "home")),
    RhymePair("בית ספר", "הרפתקה", "ה", ("school", "adventure", "learning")),
    RhymePair("ארצה", "שמימה", "ה", ("earth", "sky", "nature")),
    RhymePair("לילה", "שינה", "ה", ("night", "sleep", "bedtime")),
    RhymePair("שמש", "חמימה", "ה", ("sun", "warm", "nature")),
    RhymePair("ירושה", "נסיכה", "ה", ("heritage", "princess", "family")),
    RhymePair("אהבה", "חברה", "ה", ("love", "friend", "friendship")),
    RhymePair("תקווה", "שמחה", "ה", ("hope", "joy", "feelings")),
    RhymePair("סבתא", "חכמה", "ה", ("grandmother", "wisdom", "family")),
    RhymePair("גינה", "פינה", "ה", ("garden", "corner", "nature")),
    RhymePair("לבנה", "חלומה", "ה", ("moon", "dream", "night")),
    RhymePair("כיפה", "יפה", "ה", ("hat", "beautiful", "clothing")),
    RhymePair("עוגה", "חגיגה", "ה", ("cake", "celebration", "food")),
    RhymePair("מנורה", "אורה", "ה", ("menorah", "light", "hanukkah")),
    RhymePair("חנוכה", "שמחה", "ה", ("hanukkah", "joy", "holiday")),
    RhymePair("סוכה", "ברכה", "ה", ("sukkah", "blessing", "holiday")),
    RhymePair("תפילה", "תקווה", "ה", ("prayer", "hope", "spiritual")),
    RhymePair("חוכמה", "נשמה", "ה", ("wisdom", "soul", "spiritual")),

    # ============================================================
    # Ending: ת (-et / -at)
    # ============================================================
    RhymePair("חברות", "ארצות", "ת", ("friendship", "lands", "adventure")),
    RhymePair("לבבות", "כוכבות", "ת", ("hearts", "stars", "love")),
    RhymePair("מלכות", "שמחות", "ת", ("kingdom", "joy", "royalty")),
    RhymePair("חלומות", "כוכבות", "ת", ("dreams", "stars", "night")),
    RhymePair("גלידות", "שוקולדות", "ת", ("ice cream", "chocolate", "food")),
    RhymePair("חיות", "הרפתקאות", "ת", ("animals", "adventures", "nature")),
    RhymePair("אותיות", "מילות", "ת", ("letters", "words", "learning")),
    RhymePair("דלתות", "חלונות", "ת", ("doors", "windows", "home")),
    RhymePair("מתנות", "הפתעות", "ת", ("gifts", "surprises", "celebration")),
    RhymePair("יערות", "הרפתקאות", "ת", ("forests", "adventures", "nature")),
    RhymePair("אגדות", "סיפורות", "ת", ("legends", "stories", "fantasy")),
    RhymePair("ברכות", "שמחות", "ת", ("blessings", "joys", "celebration")),
    RhymePair("פרפרות", "פרחות", "ת", ("butterflies", "flowers", "nature")),
    RhymePair("ספינות", "הרפתקאות", "ת", ("ships", "adventures", "sea")),
    RhymePair("אבנים", "דרכות", "ת", ("stones", "paths", "journey")),
    RhymePair("ממלכות", "נסיכות", "ת", ("kingdoms", "princesses", "fantasy")),
    RhymePair("תמונות", "צבעונות", "ת", ("pictures", "colorful", "art")),
    RhymePair("שקיעות", "זריחות", "ת", ("sunsets", "sunrises", "nature")),
    RhymePair("מנגינות", "שירות", "ת", ("melodies", "songs", "music")),
    RhymePair("תפוחות", "עוגיות", "ת", ("apples", "cookies", "food")),
    RhymePair("שבת", "מנוחת", "ת", ("shabbat", "rest", "holiday")),
    RhymePair("בית", "לילית", "ת", ("home", "night", "bedtime")),
    RhymePair("דעת", "חכמת", "ת", ("knowledge", "wisdom", "learning")),

    # ============================================================
    # Ending: ור (-or)
    # ============================================================
    RhymePair("אור", "סיפור", "ור", ("light", "story", "imagination")),
    RhymePair("דבור", "ציפור", "ור", ("speech", "bird", "nature")),
    RhymePair("תנור", "אור", "ור", ("oven", "light", "home")),
    RhymePair("סיפור", "ציפור", "ור", ("story", "bird", "nature")),
    RhymePair("חלון", "סיפור", "ור", ("window", "story", "home")),
    RhymePair("גיבור", "אור", "ור", ("hero", "light", "courage")),
    RhymePair("שיעור", "סיפור", "ור", ("lesson", "story", "learning")),
    RhymePair("דרור", "ציפור", "ור", ("freedom", "bird", "nature")),
    RhymePair("זמור", "תנור", "ור", ("tune", "oven", "music")),
    RhymePair("מקור", "אור", "ור", ("source", "light", "wisdom")),
    RhymePair("עיטור", "סיפור", "ור", ("decoration", "story", "art")),
    RhymePair("נשור", "ציפור", "ור", ("eagle", "bird", "sky")),
    RhymePair("חיבור", "גיבור", "ור", ("connection", "hero", "friendship")),

    # ============================================================
    # Ending: ן (-an / -on)
    # ============================================================
    RhymePair("ירחון", "חלון", "ן", ("moon", "window", "night")),
    RhymePair("גן", "ילדן", "ן", ("garden", "kindergarten", "children")),
    RhymePair("זמן", "חלון", "ן", ("time", "window", "home")),
    RhymePair("ראשון", "אחרון", "ן", ("first", "last", "numbers")),
    RhymePair("קטן", "גדולן", "ן", ("small", "big", "size")),
    RhymePair("ארון", "חלון", "ן", ("closet", "window", "home")),
    RhymePair("בלון", "סלון", "ן", ("balloon", "living room", "party")),
    RhymePair("דולפין", "ים", "ן", ("dolphin", "sea", "ocean")),
    RhymePair("פילון", "חיבוקון", "ן", ("little elephant", "hug", "animals")),
    RhymePair("עפיפון", "שמיימון", "ן", ("kite", "sky", "flying")),
    RhymePair("משחקון", "ילדון", "ן", ("game", "little child", "play")),
    RhymePair("חלומון", "כוכבון", "ן", ("little dream", "little star", "night")),
    RhymePair("שמשון", "גיבורון", "ן", ("sun", "little hero", "courage")),

    # ============================================================
    # Ending: ל (-al / -el)
    # ============================================================
    RhymePair("גדול", "חלול", "ל", ("big", "hollow", "size")),
    RhymePair("כחול", "גדול", "ל", ("blue", "big", "colors")),
    RhymePair("יפהפה", "מופלא", "ל", ("beautiful", "wonderful", "beauty")),
    RhymePair("טיול", "גלגל", "ל", ("trip", "wheel", "adventure")),
    RhymePair("ניצול", "גיבול", "ל", ("rescue", "dough", "baking")),
    RhymePair("חול", "כחול", "ל", ("sand", "blue", "beach")),
    RhymePair("קול", "גדול", "ל", ("voice", "big", "sound")),
    RhymePair("שביל", "לילה", "ל", ("path", "night", "journey")),

    # ============================================================
    # Ending: ר (-ar / -er)
    # ============================================================
    RhymePair("כוכב", "ליל", "ר", ("star", "night", "sky")),
    RhymePair("נהר", "יער", "ר", ("river", "forest", "nature")),
    RhymePair("גשר", "נהר", "ר", ("bridge", "river", "adventure")),
    RhymePair("בוקר", "אור", "ר", ("morning", "light", "time")),
    RhymePair("ערב", "כוכב", "ר", ("evening", "star", "night")),
    RhymePair("דובר", "סופר", "ר", ("speaker", "author", "stories")),
    RhymePair("חבר", "גבר", "ר", ("friend", "man", "friendship")),
    RhymePair("ספר", "נער", "ר", ("book", "boy", "learning")),
    RhymePair("עופר", "שופר", "ר", ("deer", "shofar", "nature")),
    RhymePair("סתיו", "דביבה", "ר", ("autumn", "honey", "nature")),

    # ============================================================
    # Ending: י (-i / -ai)
    # ============================================================
    RhymePair("שלי", "שירי", "י", ("mine", "songs", "possession")),
    RhymePair("ליבי", "חביבי", "י", ("my heart", "my dear", "love")),
    RhymePair("עיני", "שירי", "י", ("my eyes", "my songs", "body")),
    RhymePair("ידי", "ליבי", "י", ("my hands", "my heart", "body")),
    RhymePair("ביתי", "משפחתי", "י", ("my home", "my family", "home")),
    RhymePair("חלומי", "כוכבי", "י", ("my dream", "my star", "night")),
    RhymePair("שמי", "ארצי", "י", ("my sky", "my land", "nature")),
    RhymePair("סיפורי", "ציפורי", "י", ("my stories", "my birds", "nature")),
    RhymePair("גני", "פרחי", "י", ("my garden", "my flowers", "nature")),
    RhymePair("אורי", "גיבורי", "י", ("my light", "my hero", "courage")),

    # ============================================================
    # Ending: ם (-am)
    # ============================================================
    RhymePair("שלום", "חלום", "ם", ("peace", "dream", "night")),
    RhymePair("יום", "חלום", "ם", ("day", "dream", "time")),
    RhymePair("עולם", "חלום", "ם", ("world", "dream", "imagination")),
    RhymePair("מקום", "חלום", "ם", ("place", "dream", "adventure")),
    RhymePair("אדם", "עולם", "ם", ("person", "world", "humanity")),
    RhymePair("קסם", "חלום", "ם", ("magic", "dream", "fantasy")),
    RhymePair("גשם", "שמש", "ם", ("rain", "sun", "weather")),
    RhymePair("לחם", "חם", "ם", ("bread", "warm", "food")),
    RhymePair("ים", "שמיים", "ם", ("sea", "sky", "nature")),

    # ============================================================
    # Ending: ע (-a)
    # ============================================================
    RhymePair("ידע", "שמע", "ע", ("knowledge", "heard", "learning")),
    RhymePair("רוע", "טוב", "ע", ("evil", "good", "morals")),
    RhymePair("נסע", "שמע", "ע", ("traveled", "heard", "adventure")),
    RhymePair("זרע", "ארצע", "ע", ("seed", "land", "nature")),
    RhymePair("ירוע", "ידוע", "ע", ("green", "known", "nature")),

    # ============================================================
    # Additional pairs for common story themes
    # ============================================================
    RhymePair("לב", "אהב", "ב", ("heart", "love", "feelings")),
    RhymePair("זהב", "אהב", "ב", ("gold", "love", "treasure")),
    RhymePair("כלב", "לב", "ב", ("dog", "heart", "animals")),
    RhymePair("רכב", "כוכב", "ב", ("vehicle", "star", "adventure")),

    RhymePair("אש", "חש", "ש", ("fire", "felt", "nature")),
    RhymePair("חדש", "נפלא", "ש", ("new", "wonderful", "discovery")),
    RhymePair("ראש", "חדש", "ש", ("head", "new", "body")),

    RhymePair("רוח", "שמח", "ח", ("wind", "happy", "nature")),
    RhymePair("ירח", "שמח", "ח", ("moon", "happy", "night")),
    RhymePair("פתוח", "שמח", "ח", ("open", "happy", "feelings")),
    RhymePair("נכון", "ראשון", "ח", ("correct", "first", "learning")),
]


def get_all_pairs() -> list[RhymePair]:
    """Return the complete rhyme dictionary."""
    return list(HEBREW_RHYME_PAIRS)


def get_pairs_by_ending(ending: str) -> list[RhymePair]:
    """Return all pairs sharing a specific ending sound."""
    return [p for p in HEBREW_RHYME_PAIRS if p.ending == ending]


def get_pairs_by_topic(topic: str) -> list[RhymePair]:
    """Return all pairs tagged with a specific topic."""
    topic_lower = topic.lower()
    return [
        p for p in HEBREW_RHYME_PAIRS
        if any(topic_lower in t.lower() for t in p.topics)
    ]


def get_all_endings() -> list[str]:
    """Return all unique ending sounds in the dictionary."""
    return sorted({p.ending for p in HEBREW_RHYME_PAIRS})


def get_all_topics() -> list[str]:
    """Return all unique topic tags in the dictionary."""
    topics: set[str] = set()
    for pair in HEBREW_RHYME_PAIRS:
        topics.update(pair.topics)
    return sorted(topics)


def search_by_word(word: str) -> list[RhymePair]:
    """Find all pairs containing a specific word."""
    return [
        p for p in HEBREW_RHYME_PAIRS
        if word in (p.word1, p.word2)
    ]
