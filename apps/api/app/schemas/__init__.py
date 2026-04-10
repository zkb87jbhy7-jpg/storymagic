"""StoryMagic API — Pydantic v2 request/response schemas.

All schemas are re-exported from this package for convenient access::

    from app.schemas import BookCreate, BookResponse, PaginatedResponse
"""

# ── Common ────────────────────────────────────────────────────────────────────
from .common import (
    Currency,
    ErrorDetail,
    ErrorResponse,
    ErrorType,
    Locale,
    PaginatedResponse,
    PaginationParams,
    SortOrder,
    SSEEventType,
    SSEProgressEvent,
    SuccessResponse,
)

# ── Auth ──────────────────────────────────────────────────────────────────────
from .auth import (
    ForgotPasswordRequest,
    LoginRequest,
    ParentalConsentRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerificationMethod,
)

# ── User ──────────────────────────────────────────────────────────────────────
from .user import (
    AccessibilityPrefs,
    AccessibilityPrefsUpdate,
    FontSize,
    OnboardingType,
    SubscriptionTier,
    UserResponse,
    UserUpdate,
)

# ── Child ─────────────────────────────────────────────────────────────────────
from .child import (
    CharacterSheetUrls,
    ChildCreate,
    ChildPreferences,
    ChildPreferencesUpdate,
    ChildResponse,
    ChildUpdate,
    FaceProcessingStatus,
    FaceStatusResponse,
    Gender,
    PhysicalTraits,
    PhysicalTraitsUpdate,
)

# ── Book ──────────────────────────────────────────────────────────────────────
from .book import (
    BookCreate,
    BookEditRequest,
    BookExtraGenerateRequest,
    BookExtraResponse,
    BookExtraType,
    BookIllustrationEntry,
    BookPreview,
    BookResponse,
    BookStatus,
    CoCreationStep,
    ConversationalEditRequest,
    CreationMethod,
    IllustrationStyle,
    InteractiveBookData,
    LivingBookAddChapter,
    LivingBookToggle,
    MoodSetting,
    PageQualityScore,
    PageThumbnail,
    ParentalGuideActivity,
    ParentalGuideData,
    QualityScores,
    ReadingProgress,
    ReadingProgressUpdate,
)

# ── Page ──────────────────────────────────────────────────────────────────────
from .page import (
    AnimationPreset,
    InteractiveElement,
    InteractiveElementPosition,
    InteractiveElementType,
    LayoutType,
    Pace,
    PageEditRequest,
    PageRegenerateRequest,
    PageResponse,
    PerformanceMarkup,
    ReadingBuddyQuestion,
    ReadingBuddyQuestionType,
    SpeakerEmotion,
)

# ── Order ─────────────────────────────────────────────────────────────────────
from .order import (
    ApproveProofRequest,
    OrderCreate,
    OrderResponse,
    OrderType,
    PaymentStatus,
    PrintOptions,
    ShippingAddress,
    SoftProofResponse,
    TrackingEvent,
    TrackingResponse,
)

# ── Template ──────────────────────────────────────────────────────────────────
from .template import (
    SceneDefinition,
    SceneInteractiveElement,
    SEOMetadata,
    SEOMetadataUpdate,
    TemplateCreate,
    TemplateFilter,
    TemplateReportCreate,
    TemplateResponse,
    TemplateReviewCreate,
    TemplateSortBy,
    TemplateStatus,
    TemplateUpdate,
)

# ── Subscription ──────────────────────────────────────────────────────────────
from .subscription import (
    CheckoutRequest,
    CheckoutResponse,
    PaymentCheckoutRequest,
    PaymentCheckoutResponse,
    PortalRequest,
    PortalResponse,
    SubscriptionPlanTier,
    SubscriptionStatus,
    SubscriptionStatusResponse,
    WebhookEventType,
    WebhookPayload,
)

# ── Voice ─────────────────────────────────────────────────────────────────────
from .voice import (
    CloneStatus,
    FamilyVoiceCreate,
    FamilyVoiceResponse,
    VoiceCloneRequest,
    VoiceCloneResponse,
    VoiceGenerateRequest,
    VoiceGenerateResponse,
    VoicePresetResponse,
    VoiceType,
)

# ── Dream ─────────────────────────────────────────────────────────────────────
from .dream import (
    DreamCreate,
    DreamResponse,
    DreamToBookRequest,
)

# ── Gift ──────────────────────────────────────────────────────────────────────
from .gift import (
    GiftPurchaseRequest,
    GiftRedeemRequest,
    GiftResponse,
    GiftStatus,
    GiftType,
)

# ── Classroom ─────────────────────────────────────────────────────────────────
from .classroom import (
    ClassBookCreate,
    ClassBookEntry,
    ClassroomCreate,
    ClassroomDashboard,
    ClassroomResponse,
    ConsentPageResponse,
    ConsentSubmit,
    StudentAdd,
    StudentDashboardEntry,
    StudentInfo,
    StudentResponse,
)

# ── Creator ───────────────────────────────────────────────────────────────────
from .creator import (
    CreatorAnalytics,
    CreatorApply,
    CreatorApplyResponse,
    CreatorStatus,
    CreatorTemplateCreate,
    PayoutRequest,
    PayoutResponse,
    PayoutStatus,
    TemplateAnalytics,
)

# ── Recommendation ────────────────────────────────────────────────────────────
from .recommendation import (
    RecommendationResponse,
    RecommendedPrompt,
    RecommendedTemplate,
    SeasonalContent,
    SeasonalTemplate,
)

__all__ = [
    # Common
    "Currency",
    "ErrorDetail",
    "ErrorResponse",
    "ErrorType",
    "Locale",
    "PaginatedResponse",
    "PaginationParams",
    "SortOrder",
    "SSEEventType",
    "SSEProgressEvent",
    "SuccessResponse",
    # Auth
    "ForgotPasswordRequest",
    "LoginRequest",
    "ParentalConsentRequest",
    "RefreshRequest",
    "RegisterRequest",
    "ResetPasswordRequest",
    "TokenResponse",
    "VerificationMethod",
    # User
    "AccessibilityPrefs",
    "AccessibilityPrefsUpdate",
    "FontSize",
    "OnboardingType",
    "SubscriptionTier",
    "UserResponse",
    "UserUpdate",
    # Child
    "CharacterSheetUrls",
    "ChildCreate",
    "ChildPreferences",
    "ChildPreferencesUpdate",
    "ChildResponse",
    "ChildUpdate",
    "FaceProcessingStatus",
    "FaceStatusResponse",
    "Gender",
    "PhysicalTraits",
    "PhysicalTraitsUpdate",
    # Book
    "BookCreate",
    "BookEditRequest",
    "BookExtraGenerateRequest",
    "BookExtraResponse",
    "BookExtraType",
    "BookIllustrationEntry",
    "BookPreview",
    "BookResponse",
    "BookStatus",
    "CoCreationStep",
    "ConversationalEditRequest",
    "CreationMethod",
    "IllustrationStyle",
    "InteractiveBookData",
    "LivingBookAddChapter",
    "LivingBookToggle",
    "MoodSetting",
    "PageQualityScore",
    "PageThumbnail",
    "ParentalGuideActivity",
    "ParentalGuideData",
    "QualityScores",
    "ReadingProgress",
    "ReadingProgressUpdate",
    # Page
    "AnimationPreset",
    "InteractiveElement",
    "InteractiveElementPosition",
    "InteractiveElementType",
    "LayoutType",
    "Pace",
    "PageEditRequest",
    "PageRegenerateRequest",
    "PageResponse",
    "PerformanceMarkup",
    "ReadingBuddyQuestion",
    "ReadingBuddyQuestionType",
    "SpeakerEmotion",
    # Order
    "ApproveProofRequest",
    "OrderCreate",
    "OrderResponse",
    "OrderType",
    "PaymentStatus",
    "PrintOptions",
    "ShippingAddress",
    "SoftProofResponse",
    "TrackingEvent",
    "TrackingResponse",
    # Template
    "SceneDefinition",
    "SceneInteractiveElement",
    "SEOMetadata",
    "SEOMetadataUpdate",
    "TemplateCreate",
    "TemplateFilter",
    "TemplateReportCreate",
    "TemplateResponse",
    "TemplateReviewCreate",
    "TemplateSortBy",
    "TemplateStatus",
    "TemplateUpdate",
    # Subscription
    "CheckoutRequest",
    "CheckoutResponse",
    "PaymentCheckoutRequest",
    "PaymentCheckoutResponse",
    "PortalRequest",
    "PortalResponse",
    "SubscriptionPlanTier",
    "SubscriptionStatus",
    "SubscriptionStatusResponse",
    "WebhookEventType",
    "WebhookPayload",
    # Voice
    "CloneStatus",
    "FamilyVoiceCreate",
    "FamilyVoiceResponse",
    "VoiceCloneRequest",
    "VoiceCloneResponse",
    "VoiceGenerateRequest",
    "VoiceGenerateResponse",
    "VoicePresetResponse",
    "VoiceType",
    # Dream
    "DreamCreate",
    "DreamResponse",
    "DreamToBookRequest",
    # Gift
    "GiftPurchaseRequest",
    "GiftRedeemRequest",
    "GiftResponse",
    "GiftStatus",
    "GiftType",
    # Classroom
    "ClassBookCreate",
    "ClassBookEntry",
    "ClassroomCreate",
    "ClassroomDashboard",
    "ClassroomResponse",
    "ConsentPageResponse",
    "ConsentSubmit",
    "StudentAdd",
    "StudentDashboardEntry",
    "StudentInfo",
    "StudentResponse",
    # Creator
    "CreatorAnalytics",
    "CreatorApply",
    "CreatorApplyResponse",
    "CreatorStatus",
    "CreatorTemplateCreate",
    "PayoutRequest",
    "PayoutResponse",
    "PayoutStatus",
    "TemplateAnalytics",
    # Recommendation
    "RecommendationResponse",
    "RecommendedPrompt",
    "RecommendedTemplate",
    "SeasonalContent",
    "SeasonalTemplate",
]
