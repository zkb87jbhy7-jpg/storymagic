"""User model - maps to the 'users' table."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Boolean, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

if TYPE_CHECKING:
    from app.models.abuse_report import AbuseReport
    from app.models.book import GeneratedBook
    from app.models.child import ChildProfile
    from app.models.classroom import Classroom
    from app.models.creator import Creator
    from app.models.draft import UserDraft
    from app.models.dream import Dream
    from app.models.gift import GiftCard
    from app.models.living_book import LivingBook
    from app.models.notification import Notification
    from app.models.order import Order
    from app.models.referral import Referral
    from app.models.subscription import Subscription
    from app.models.voice import VoiceProfile


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50))
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    language_preference: Mapped[Optional[str]] = mapped_column(
        String(10), server_default=text("'he'")
    )
    currency_preference: Mapped[Optional[str]] = mapped_column(
        String(3), server_default=text("'ILS'")
    )
    subscription_tier: Mapped[Optional[str]] = mapped_column(
        String(20), server_default=text("'free'")
    )
    accessibility_prefs: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB, server_default=text("'{}'::jsonb")
    )
    onboarding_type: Mapped[Optional[str]] = mapped_column(
        String(20), server_default=text("'guided'")
    )
    is_admin: Mapped[Optional[bool]] = mapped_column(
        Boolean, server_default=text("false")
    )
    encryption_key_ref: Mapped[str] = mapped_column(
        String(255), nullable=False, server_default=text("'pending'")
    )
    referral_code: Mapped[str] = mapped_column(
        String(8),
        unique=True,
        nullable=False,
        server_default=text("substr(md5(random()::text), 1, 8)"),
    )
    referred_by: Mapped[Optional[str]] = mapped_column(String(8))
    timezone: Mapped[Optional[str]] = mapped_column(
        String(50), server_default=text("'Asia/Jerusalem'")
    )
    created_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        server_default=text("NOW()")
    )

    # Relationships
    children: Mapped[list[ChildProfile]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    books: Mapped[list[GeneratedBook]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    orders: Mapped[list[Order]] = relationship(back_populates="user")
    subscriptions: Mapped[list[Subscription]] = relationship(back_populates="user")
    voice_profiles: Mapped[list[VoiceProfile]] = relationship(back_populates="user")
    living_books: Mapped[list[LivingBook]] = relationship(back_populates="user")
    dreams: Mapped[list[Dream]] = relationship(back_populates="user")
    gift_cards_purchased: Mapped[list[GiftCard]] = relationship(
        back_populates="purchaser", foreign_keys="GiftCard.purchaser_id"
    )
    referrals_made: Mapped[list[Referral]] = relationship(
        back_populates="referrer", foreign_keys="Referral.referrer_id"
    )
    classrooms: Mapped[list[Classroom]] = relationship(back_populates="teacher")
    creators: Mapped[list[Creator]] = relationship(back_populates="user")
    notifications: Mapped[list[Notification]] = relationship(back_populates="user")
    drafts: Mapped[list[UserDraft]] = relationship(back_populates="user")
    abuse_reports: Mapped[list[AbuseReport]] = relationship(
        back_populates="reporter", foreign_keys="AbuseReport.reporter_user_id"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email!r})>"
