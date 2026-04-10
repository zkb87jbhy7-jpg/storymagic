"""StoryMagic API service layer.

Each service encapsulates business logic for a specific domain,
accepting an AsyncSession in its constructor and exposing async methods.
"""

from app.services.analytics_service import AnalyticsService
from app.services.book_service import BookService
from app.services.child_service import ChildService
from app.services.classroom_service import ClassroomService
from app.services.creator_service import CreatorService
from app.services.gift_service import GiftService
from app.services.moderation_service import ModerationService
from app.services.notification_service import NotificationService
from app.services.order_service import OrderService
from app.services.payment_service import PaymentService
from app.services.print_service import PrintService
from app.services.recommendation_service import RecommendationService
from app.services.subscription_service import SubscriptionService
from app.services.user_service import UserService
from app.services.voice_service import VoiceService

__all__ = [
    "AnalyticsService",
    "BookService",
    "ChildService",
    "ClassroomService",
    "CreatorService",
    "GiftService",
    "ModerationService",
    "NotificationService",
    "OrderService",
    "PaymentService",
    "PrintService",
    "RecommendationService",
    "SubscriptionService",
    "UserService",
    "VoiceService",
]
