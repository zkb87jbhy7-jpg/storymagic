"""SQLAlchemy models for StoryMagic."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""

    pass


# Import all models so that Base.metadata contains every table.
# The imports must come after Base is defined to avoid circular imports.
from app.models.abuse_report import AbuseReport  # noqa: E402
from app.models.book import GeneratedBook  # noqa: E402
from app.models.child import ChildProfile  # noqa: E402
from app.models.classroom import Classroom, ClassroomStudent  # noqa: E402
from app.models.creator import Creator, CreatorTransaction  # noqa: E402
from app.models.draft import UserDraft  # noqa: E402
from app.models.dream import Dream  # noqa: E402
from app.models.event import BookEvent  # noqa: E402
from app.models.gift import GiftCard  # noqa: E402
from app.models.living_book import LivingBook  # noqa: E402
from app.models.notification import Notification  # noqa: E402
from app.models.order import Order  # noqa: E402
from app.models.page import BookPage  # noqa: E402
from app.models.prompt_version import PromptTestCase, PromptVersion  # noqa: E402
from app.models.referral import Referral  # noqa: E402
from app.models.subscription import Subscription  # noqa: E402
from app.models.template import StoryTemplate  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.voice import VoiceProfile  # noqa: E402

__all__ = [
    "Base",
    "User",
    "ChildProfile",
    "GeneratedBook",
    "BookPage",
    "BookEvent",
    "Order",
    "StoryTemplate",
    "Subscription",
    "VoiceProfile",
    "LivingBook",
    "Dream",
    "GiftCard",
    "Referral",
    "Classroom",
    "ClassroomStudent",
    "Creator",
    "CreatorTransaction",
    "PromptVersion",
    "PromptTestCase",
    "Notification",
    "UserDraft",
    "AbuseReport",
]
