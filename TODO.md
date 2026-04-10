# StoryMagic — Comprehensive Development TODO

> Generated from FULL_SPEC.md (2,709 lines, 180KB)
> Last updated: 2026-04-10
> Total steps: 32 | Total sub-tasks: 500+

---

## Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked / needs decision
- **Risk:** LOW / MEDIUM / HIGH / VERY HIGH
- **Spec ref:** Chapter.Section (e.g., Ch4.1 = Chapter 4, Section 4.1)

---

# MILESTONE 1: MVP FOUNDATION (Steps 1-10)

Target: Full user flow with mock AI — register, create child, wizard, mock book, mock reader, payment

---

## Step 1: Monorepo Initialization
**Risk:** LOW | **Spec ref:** Ch16, Ch18.2 Step 1 | **Depends on:** Nothing

### 1.1 Root Configuration
- [ ] Initialize pnpm workspace: `pnpm init`
- [ ] Create `pnpm-workspace.yaml` with `apps/*` and `packages/*`
- [ ] Create `turbo.json` with pipeline config (build, dev, lint, test, type-check)
- [ ] Create root `package.json` with devDependencies: turbo, prettier, husky, lint-staged
- [ ] Create `.npmrc` with `shamefully-hoist=true` (for Turborepo compatibility)
- [ ] Create `.gitignore` (node_modules, .env*, dist, .next, __pycache__, .venv, etc.)
- [ ] Create `.prettierrc` (semi: false, singleQuote: true, tabWidth: 2)
- [ ] Create `.editorconfig`

### 1.2 Environment Configuration
- [ ] Create `.env.example` with ALL environment variable keys:
  - Database: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  - Redis: `REDIS_URL`
  - Auth: `JWT_SECRET`, `JWT_ALGORITHM`, `JWT_EXPIRATION_MINUTES`, `JWT_REFRESH_EXPIRATION_DAYS`
  - Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_SECRET`
  - AI Providers: `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY`, `OPENAI_API_KEY`
  - Image: `COMFYUI_API_URL`, `RUNPOD_API_KEY`
  - Voice: `ELEVENLABS_API_KEY`, `CARTESIA_API_KEY`, `FISH_AUDIO_API_KEY`
  - Face: `QDRANT_URL`, `QDRANT_API_KEY`
  - Encryption: `AWS_KMS_KEY_ID`, `AWS_REGION`
  - Print: `LULU_API_KEY`, `LULU_API_SECRET`
  - Monitoring: `SENTRY_DSN`, `LANGSMITH_API_KEY`
  - App: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `TEMPORAL_ADDRESS`
- [ ] Create `.env.local` (copy of .env.example with dev values)
- [ ] Create `.env.staging` (placeholder)
- [ ] Create `.env.production` (placeholder)

### 1.3 Docker Compose
- [ ] Create `docker-compose.yml`:
  - PostgreSQL 16 (port 5432, volume for persistence)
  - Redis 7 (port 6379)
  - Temporal Server (`temporalio/auto-setup:latest`, port 7233)
  - Temporal Web UI (`temporalio/ui:latest`, port 8233)
  - Temporal Worker placeholder
- [ ] Create `docker-compose.dev.yml` (dev overrides: hot-reload volumes, debug ports)
- [ ] Verify all containers start: `docker-compose up -d`
- [ ] Verify Temporal Web UI at http://localhost:8233

### 1.4 Makefile
- [ ] Create `Makefile` with commands:
  - `make up` — docker-compose up -d
  - `make down` — docker-compose down
  - `make dev` — start all dev servers
  - `make dev-web` — start Next.js dev
  - `make dev-api` — start FastAPI dev
  - `make build` — turbo build
  - `make test` — turbo test
  - `make lint` — turbo lint
  - `make type-check` — turbo type-check
  - `make migrate` — run database migrations
  - `make seed` — seed database
  - `make clean` — clean all build artifacts
  - `make install` — pnpm install

### 1.5 App Scaffolds
- [ ] Create `apps/web/package.json` with dependencies:
  - next@15, react@19, react-dom@19, typescript
  - tailwindcss, @tailwindcss/postcss, postcss
  - framer-motion, three, @react-three/fiber
  - next-intl, @stripe/stripe-js
  - @tensorflow-models/blazeface, @tensorflow/tfjs-backend-webgl
- [ ] Create `apps/web/tsconfig.json` (strict mode, paths to shared packages)
- [ ] Create `apps/web/next.config.ts` (minimal, App Router)
- [ ] Create `apps/api/pyproject.toml` with dependencies:
  - fastapi, uvicorn[standard], sqlalchemy[asyncio], asyncpg
  - pydantic, pydantic-settings, python-jose[cryptography], passlib[bcrypt]
  - redis, httpx, stripe, python-multipart
  - temporalio, langgraph, langchain-core, langsmith
  - anthropic, google-generativeai, openai
  - insightface, onnxruntime
  - pillow, numpy, scipy
  - alembic, pytest, mypy, ruff
- [ ] Create `apps/api/app/__init__.py`
- [ ] Create `apps/mobile/package.json` (Expo SDK 52+ placeholder)
- [ ] Create `apps/mobile/app.json`
- [ ] Create `apps/mobile/App.tsx` (minimal "Hello World")

### 1.6 Package Scaffolds
- [ ] Create `packages/shared-types/package.json`
- [ ] Create `packages/shared-types/tsconfig.json`
- [ ] Create `packages/shared-types/src/index.ts` (empty export)
- [ ] Create `packages/shared-utils/package.json`
- [ ] Create `packages/shared-utils/src/index.ts`
- [ ] Create `packages/eslint-config/package.json`
- [ ] Create `packages/eslint-config/base.js`

### 1.7 Verification
- [ ] `pnpm install` succeeds with zero errors
- [ ] `docker-compose up -d` starts PostgreSQL, Redis, Temporal
- [ ] `pnpm turbo build` resolves workspace dependencies
- [ ] Temporal Web UI accessible at localhost:8233
- [ ] PostgreSQL accepts connections on port 5432
- [ ] Redis accepts connections on port 6379

---

## Step 2: Shared Types Package
**Risk:** LOW | **Spec ref:** Ch7 (all schemas), Ch5 (agent types), Ch4.5 (provider types) | **Depends on:** Step 1

### 2.1 Database Entity Types
- [ ] `packages/shared-types/src/user.ts`:
  - `User`, `UserCreate`, `UserUpdate`
  - `AccessibilityPrefs` (dyslexia_mode, adhd_mode, autism_mode, font_size, high_contrast, reduced_motion)
  - `OnboardingType` = 'quick' | 'creative' | 'guided'
  - `SubscriptionTier` = 'free' | 'monthly' | 'yearly'
- [ ] `packages/shared-types/src/child.ts`:
  - `ChildProfile`, `ChildProfileCreate`, `ChildProfileUpdate`
  - `PhysicalTraits` (wheelchair, glasses, hearing_aid, skin_tone, hair_color, hair_style, custom_notes)
  - `ChildPreferences` (family_structure, cultural_prefs, accessibility_needs, reading_prefs, dietary_restrictions, modesty_concerns, holiday_preferences, pronouns)
  - `FaceProcessingStatus` = 'pending' | 'processing' | 'ready' | 'failed' | 'expired'
  - `CharacterSheetUrls` (front, profile, three_quarter, back)
- [ ] `packages/shared-types/src/book.ts`:
  - `GeneratedBook`, `BookCreate`
  - `BookStatus` = 'draft' | 'generating' | 'preview' | 'approved' | 'ordered' | 'printing' | 'shipped'
  - `CreationMethod` = 'free_prompt' | 'template' | 'co_creation' | 'dream' | 'remix'
  - `MoodSetting` = 'happy' | 'exciting' | 'sad' | 'scared' | 'angry' | 'calm'
  - `QualityScores` (overall, per_page, consistency_score)
  - `IllustrationStyle` = 'watercolor' | 'comic_book' | 'pixar_3d' | 'retro_vintage' | 'minimalist' | 'oil_painting' | 'fantasy' | 'manga' | 'classic_storybook' | 'whimsical'
- [ ] `packages/shared-types/src/page.ts`:
  - `BookPage`, `BookPageCreate`
  - `LayoutType` = 'full_illustration_text_overlay' | 'top_illustration_bottom_text' | 'side_by_side' | 'full_spread' | 'text_only_decorative_border'
  - `AnimationPreset` = 'falling_leaves' | 'twinkling_stars' | 'floating_bubbles' | 'gentle_rain' | 'snowfall' | 'fireflies'
  - `InteractiveElement` (type, position {x,y,w,h}, content, sound_effect)
  - `PerformanceMarkup` (speaker, emotion, pace, pause_before, pause_after, emphasized_words, sound_effect)
  - `ReadingBuddyQuestion` (question, type, answer_hint)
- [ ] `packages/shared-types/src/order.ts`:
  - `Order`, `OrderCreate`
  - `OrderType` = 'digital' | 'softcover' | 'hardcover' | 'gift'
  - `PaymentStatus` = 'pending' | 'paid' | 'failed' | 'refunded'
  - `PrintOptions` (cover_type, size, gift_wrap, paper_quality, quantity)
  - `ShippingAddress` (name, street, city, state, zip, country)
- [ ] `packages/shared-types/src/template.ts`:
  - `StoryTemplate`, `TemplateCreate`, `TemplateUpdate`
  - `TemplateStatus` = 'draft' | 'review' | 'published' | 'suspended'
  - `SceneDefinition` (text, illustration_hints, animation_presets, interactive_elements, placeholders)
  - `SEOMetadata` (title, description, tags, og_image, structured_data)
- [ ] `packages/shared-types/src/subscription.ts`:
  - `Subscription`, `SubscriptionCreate`
  - `SubscriptionStatus` = 'active' | 'cancelled' | 'past_due' | 'paused'
- [ ] `packages/shared-types/src/voice.ts`:
  - `VoiceProfile`, `VoiceProfileCreate`
  - `VoiceType` = 'preset' | 'family'
  - `CloneStatus` = 'processing' | 'ready' | 'failed'
- [ ] `packages/shared-types/src/common.ts`:
  - `PaginatedResponse<T>` (items, total, page, per_page, has_next)
  - `ErrorResponse` (error, message, details)
  - `SSEProgressEvent` (phase, percent, message, data)
  - `Locale` = 'he' | 'en' | 'ar' | 'ru' | 'fr' | 'es'
  - `Currency` = 'ILS' | 'USD' | 'EUR'
  - `LivingBook`, `Dream`, `GiftCard`, `Referral`, `Classroom`, `ClassroomStudent`
  - `Creator`, `CreatorTransaction`
  - `Notification`, `UserDraft`, `AbuseReport`
  - `PromptVersion`, `PromptTestCase`
  - `AnalyticsEvent`

### 2.2 AI System Types
- [ ] `packages/shared-types/src/agents.ts`:
  - `StoryBlueprint` (title, subtitle, theme, moral, emotional_arc, scenes[])
  - `Scene` (page_number, environment, action, dialogues[], dominant_emotion, narrative_role, illustration_hint)
  - `NarrativeRole` = 'introduction' | 'rising_action' | 'climax' | 'falling_action' | 'resolution'
  - `EmotionalArc` (page_ranges mapped to emotions with intensity 0-10)
  - `IllustrationPrompt` (prompt, negative_prompt, composition, color_palette, camera_angle)
  - `ParentalGuide` (summary, educational_value, discussion_questions, activities, emotional_notes)
  - `AgentResult<T>` (output, quality_score, latency_ms, provider_id, events[])
- [ ] `packages/shared-types/src/ai-providers.ts`:
  - `TextGenerationRequest`, `TextGenerationResult`
  - `ImageGenerationRequest`, `ImageGenerationResult`
  - `VoiceGenerationRequest`, `VoiceGenerationResult`
  - `FaceProcessingRequest`, `FaceProcessingResult`
  - `ProviderHealth` (status, latency_ms, error_rate, last_check)
  - `ProviderConfig` (id, type, priority, cost_per_call, max_retries)
- [ ] `packages/shared-types/src/quality.ts`:
  - `QualityPipelineResult` (safety, technical, consistency, likeness, overall_pass)
  - `SafetyGateResult` (passed, blocked_words[], risk_level, audit_entry)
  - `TechnicalQualityResult` (dimensions_ok, blur_score, anomalies[])
  - `ConsistencyResult` (character_consistent, style_consistent, color_consistent, issues[])
  - `LikenessResult` (similarity_score, threshold, passed)
  - `QualityIssue` (severity: 'critical' | 'major' | 'minor', category, description, recommendation)
- [ ] `packages/shared-types/src/analytics.ts`:
  - `AnalyticsEvent` (event_name, user_id, session_id, properties, locale, device_type, page_url)
  - `ReadingStats` (books_read_this_week, total_reading_time, questions_answered, words_tapped)
  - `ImplicitSignal` (time_per_page, pages_reread, illustrations_tapped, books_completed_ratio)

### 2.3 Package Config & Exports
- [ ] `packages/shared-types/src/index.ts` — re-export everything
- [ ] `packages/shared-types/tsconfig.json` — strict mode, declaration: true
- [ ] Verify: `pnpm --filter shared-types build` compiles with zero errors
- [ ] Verify: types importable from `apps/web` via workspace protocol

---

## Step 3: Database Migrations
**Risk:** MEDIUM | **Spec ref:** Ch7.2 (full schema) | **Depends on:** Steps 1, 2

### 3.1 Supabase Setup
- [ ] Create `supabase/config.toml`
- [ ] Initialize Supabase CLI (or use raw psql for migrations)

### 3.2 Migration Files (in FK dependency order)
- [ ] `20260101000001_users.sql` — users table with all columns, CHECK constraints, indexes
- [ ] `20260101000002_children_profiles.sql` — FK to users, JSONB columns (physical_traits, preferences), character_sheet_urls
- [ ] `20260101000003_creators.sql` — FK to users, Stripe Connect fields
- [ ] `20260101000004_story_templates.sql` — FK to creators, JSONB scene_definitions, seo_metadata
- [ ] `20260101000005_generated_books.sql` — FK to users, story_templates, UUID[] child_profile_ids, JSONB columns
- [ ] `20260101000006_book_pages.sql` — FK to generated_books, UNIQUE(book_id, page_number), JSONB columns
- [ ] `20260101000007_book_events.sql` — PARTITION BY RANGE (timestamp), 12 monthly partitions (Jan-Dec 2026)
- [ ] `20260101000008_orders.sql` — FK to users, generated_books, JSONB print_options, shipping_address
- [ ] `20260101000009_subscriptions.sql` — FK to users, Stripe fields, books_remaining tracking
- [ ] `20260101000010_voice_profiles.sql` — FK to users, clone_status, provider fields
- [ ] `20260101000011_living_books.sql` — FK to generated_books, children_profiles, users, JSONB chapters
- [ ] `20260101000012_dreams.sql` — FK to users, children_profiles, generated_books
- [ ] `20260101000013_gift_cards.sql` — FK to users, UNIQUE redeem_code, JSONB credits, expiry
- [ ] `20260101000014_referrals.sql` — FK to users (referrer + referred)
- [ ] `20260101000015_classrooms.sql` — FK to users (teacher)
- [ ] `20260101000016_classroom_students.sql` — FK to classrooms, consent fields, UNIQUE consent_token
- [ ] `20260101000017_prompt_versions.sql` — UNIQUE(prompt_key, version), JSONB test_results, status workflow
- [ ] `20260101000018_prompt_test_cases.sql` — expected_traits array
- [ ] `20260101000019_analytics_events.sql` — PARTITION BY RANGE (timestamp), 12 monthly partitions
- [ ] `20260101000020_notifications.sql` — FK to users, bilingual title/message
- [ ] `20260101000021_user_drafts.sql` — FK to users, JSONB data, expiry
- [ ] `20260101000022_creator_transactions.sql` — FK to templates, creators, users, books
- [ ] `20260101000023_abuse_reports.sql` — FK to users, templates, books

### 3.3 Indexes & Partitions (final migration)
- [ ] All indexes from spec (idx_users_email, idx_users_referral_code, idx_children_user, idx_books_user, idx_books_status, idx_events_book, idx_events_type, idx_events_timestamp, idx_orders_user, idx_orders_status, idx_subs_user, idx_subs_status, idx_templates_category, idx_templates_status, idx_templates_creator, idx_gifts_code, idx_analytics_user, idx_analytics_event, idx_analytics_time, idx_notifications_user, idx_drafts_user, idx_pages_book, idx_prompts_key_status)
- [ ] Monthly partitions for `book_events`: Jan 2026 through Dec 2026
- [ ] Monthly partitions for `analytics_events`: Jan 2026 through Dec 2026

### 3.4 Seed Data
- [ ] Create `supabase/seed.sql`:
  - 2 test users (one Hebrew, one English)
  - 3 child profiles (ages 3, 6, 9) with sample preferences
  - 12 story templates from Appendix D:
    - Adventure: "Space Adventure" (4-8), "Under the Sea" (3-7), "The Enchanted Forest" (5-9)
    - Friendship: "The New Friend" (3-6), "Together We're Strong" (5-8)
    - Learning: "The Colors of the Rainbow" (2-4), "Counting to Ten" (2-4)
    - Bedtime: "My Star" (2-5), "Goodnight Moon" (2-4)
    - Holidays: "Happy Hanukkah" (3-7), "A Sweet New Year" (3-7)
    - Emotions: "When I Feel..." (3-6)
  - 20+ voice presets (spec 11.2): "Storyteller Sarah", "Grandpa Joe", "Young Maya", "Captain Alex", "Wise Grandma Ruth", "Playful Dani", Hebrew voices: "Noa", "Saba Moshe", "Savta Miriam"
  - Sample prompt versions (story-architect-system v1, hebrew-poet-system v1)

### 3.5 Verification
- [ ] All migrations apply without errors
- [ ] Seed data loads successfully
- [ ] All FK relationships resolve (test with CASCADE deletes)
- [ ] Partitioned tables have correct partition boundaries
- [ ] All CHECK constraints work (test with invalid data)

---

## Step 4: FastAPI Backend Skeleton
**Risk:** HIGH | **Spec ref:** Ch4.3, Ch8 (all endpoints), Ch7 (models) | **Depends on:** Steps 1-3

### 4.1 Core Application Setup
- [ ] `apps/api/app/config.py` — Pydantic Settings class with all env vars from .env.example
- [ ] `apps/api/app/dependencies.py`:
  - `get_db()` — async SQLAlchemy session
  - `get_redis()` — Redis connection
  - `get_current_user()` — JWT token validation
  - `get_current_admin()` — Admin role check
  - `get_stripe()` — Stripe client
- [ ] `apps/api/app/main.py`:
  - FastAPI app factory with lifespan (DB pool, Redis, cleanup)
  - Register all middleware
  - Include all routers with `/api/v1` prefix
  - Exception handlers (validation, auth, not found, server error)

### 4.2 Middleware
- [ ] `apps/api/app/middleware/cors.py` — CORS with configurable origins
- [ ] `apps/api/app/middleware/auth.py` — JWT token extraction and validation
- [ ] `apps/api/app/middleware/rate_limiter.py` — Redis-based (60/min API, 10/min AI, 20/min auth)
- [ ] `apps/api/app/middleware/audit_log.py` — Log operations on children's data
- [ ] `apps/api/app/middleware/request_tracing.py` — OpenTelemetry trace context propagation

### 4.3 SQLAlchemy Models (20 files)
- [ ] `apps/api/app/models/__init__.py` — Base model, import all
- [ ] `apps/api/app/models/user.py` — User model matching Ch7.2 users table
- [ ] `apps/api/app/models/child.py` — ChildProfile with JSONB physical_traits, preferences
- [ ] `apps/api/app/models/book.py` — GeneratedBook with JSONB generated_story, illustrations, quality_scores
- [ ] `apps/api/app/models/page.py` — BookPage with JSONB interactive_elements, performance_markup
- [ ] `apps/api/app/models/event.py` — BookEvent (partitioned)
- [ ] `apps/api/app/models/order.py` — Order with JSONB print_options, shipping_address
- [ ] `apps/api/app/models/template.py` — StoryTemplate with JSONB scene_definitions, seo_metadata
- [ ] `apps/api/app/models/subscription.py`
- [ ] `apps/api/app/models/voice.py` — VoiceProfile
- [ ] `apps/api/app/models/living_book.py` — JSONB chapters
- [ ] `apps/api/app/models/dream.py`
- [ ] `apps/api/app/models/gift.py` — GiftCard with JSONB credits
- [ ] `apps/api/app/models/referral.py`
- [ ] `apps/api/app/models/classroom.py` — Classroom + ClassroomStudent
- [ ] `apps/api/app/models/creator.py`
- [ ] `apps/api/app/models/prompt_version.py` — JSONB test_results
- [ ] `apps/api/app/models/notification.py` — Bilingual title/message
- [ ] `apps/api/app/models/draft.py` — JSONB data
- [ ] `apps/api/app/models/abuse_report.py`

### 4.4 Pydantic Schemas (16 files)
- [ ] `apps/api/app/schemas/common.py` — PaginatedResponse, ErrorResponse, SuccessResponse
- [ ] `apps/api/app/schemas/auth.py` — RegisterRequest, LoginRequest, TokenResponse, RefreshRequest, ParentalConsentRequest
- [ ] `apps/api/app/schemas/user.py` — UserResponse, UserUpdate
- [ ] `apps/api/app/schemas/child.py` — ChildCreate, ChildUpdate, ChildResponse, FaceStatusResponse
- [ ] `apps/api/app/schemas/book.py` — BookCreate (free_prompt + template), BookResponse, BookPreview, InteractiveBookData
- [ ] `apps/api/app/schemas/page.py` — PageResponse, PageEdit
- [ ] `apps/api/app/schemas/order.py` — OrderCreate, OrderResponse, TrackingResponse, SoftProofResponse
- [ ] `apps/api/app/schemas/template.py` — TemplateCreate, TemplateUpdate, TemplateResponse, TemplateFilter
- [ ] `apps/api/app/schemas/subscription.py` — CheckoutRequest, SubscriptionStatus, WebhookEvent
- [ ] `apps/api/app/schemas/voice.py` — VoiceGenerateRequest, VoiceCloneRequest, VoicePresetResponse, FamilyVoiceCreate
- [ ] `apps/api/app/schemas/dream.py` — DreamCreate, DreamResponse
- [ ] `apps/api/app/schemas/gift.py` — GiftPurchase, GiftRedeem, GiftResponse
- [ ] `apps/api/app/schemas/classroom.py` — ClassroomCreate, StudentAdd, ConsentSubmit, ClassBookCreate
- [ ] `apps/api/app/schemas/creator.py` — CreatorApply, TemplateCreate, AnalyticsResponse, PayoutRequest
- [ ] `apps/api/app/schemas/recommendation.py` — RecommendationResponse, SeasonalContent

### 4.5 API Routers (18 files) — All endpoints from Ch8
- [ ] `apps/api/app/routers/health.py`:
  - `GET /health` — basic health check
  - `GET /health/deep` — DB, Redis, GPU, AI providers
- [ ] `apps/api/app/routers/auth.py` (7 endpoints):
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/verify-parent`
  - `POST /auth/refresh`
  - `POST /auth/forgot-password`
  - `POST /auth/reset-password`
  - `POST /auth/logout`
- [ ] `apps/api/app/routers/children.py` (6 endpoints):
  - `POST /children`
  - `GET /children`
  - `GET /children/{id}`
  - `PUT /children/{id}`
  - `DELETE /children/{id}`
  - `GET /children/{id}/face-status`
- [ ] `apps/api/app/routers/stories.py` (7 endpoints):
  - `POST /stories/generate` (SSE stream)
  - `POST /stories/from-template` (SSE stream)
  - `GET /stories/templates` (paginated, filtered)
  - `GET /stories/templates/{id}`
  - `PUT /stories/{id}/edit`
  - `POST /stories/{id}/edit-conversational`
  - `POST /stories/{id}/regenerate-page`
- [ ] `apps/api/app/routers/illustrations.py` (5 endpoints):
  - `POST /illustrations/generate` (SSE stream)
  - `POST /illustrations/{id}/edit`
  - `POST /illustrations/{id}/regenerate`
  - `POST /illustrations/{id}/repair`
  - `GET /illustrations/{id}/status`
- [ ] `apps/api/app/routers/voice.py` (6 endpoints):
  - `POST /voice/generate`
  - `POST /voice/clone`
  - `GET /voice/presets`
  - `POST /voice/family/record`
  - `GET /voice/family`
  - `DELETE /voice/family/{id}`
- [ ] `apps/api/app/routers/books.py` (11 endpoints):
  - `POST /books/create` (SSE stream)
  - `GET /books`
  - `GET /books/{id}`
  - `GET /books/{id}/preview`
  - `GET /books/{id}/interactive`
  - `GET /books/{id}/read-progress`
  - `PUT /books/{id}/read-progress`
  - `POST /books/{id}/approve`
  - `POST /books/{id}/living-book/toggle`
  - `POST /books/{id}/living-book/add-chapter`
  - `GET /books/{id}/extras`
  - `POST /books/{id}/extras/generate`
- [ ] `apps/api/app/routers/orders.py` (6 endpoints):
  - `POST /orders`
  - `GET /orders`
  - `GET /orders/{id}`
  - `GET /orders/{id}/tracking`
  - `GET /orders/{id}/soft-proof`
  - `POST /orders/{id}/approve-proof`
- [ ] `apps/api/app/routers/print.py` (4 endpoints):
  - `POST /print/prepare-pdf`
  - `POST /print/submit`
  - `GET /print/status/{orderId}`
  - `POST /print/shipping-rates`
- [ ] `apps/api/app/routers/subscriptions.py` (4 endpoints):
  - `POST /subscriptions/create-checkout`
  - `POST /subscriptions/portal`
  - `POST /subscriptions/webhook`
  - `GET /subscriptions/status`
- [ ] `apps/api/app/routers/payments.py` (2 endpoints):
  - `POST /payments/create-checkout`
  - `POST /payments/webhook`
- [ ] `apps/api/app/routers/marketplace.py` (4 endpoints):
  - `GET /marketplace/templates`
  - `GET /marketplace/templates/{id}`
  - `POST /marketplace/templates/{id}/review`
  - `POST /marketplace/templates/{id}/report`
- [ ] `apps/api/app/routers/classroom.py` (6 endpoints):
  - `POST /classroom/register`
  - `POST /classroom/students`
  - `GET /classroom/consent/{token}`
  - `POST /classroom/consent/{token}`
  - `POST /classroom/create-book`
  - `GET /classroom/dashboard`
- [ ] `apps/api/app/routers/gifts.py` (3 endpoints):
  - `POST /gifts/purchase`
  - `GET /gifts/redeem/{code}`
  - `POST /gifts/redeem/{code}`
- [ ] `apps/api/app/routers/dreams.py` (3 endpoints):
  - `POST /dreams`
  - `GET /dreams`
  - `POST /dreams/{id}/create-book`
- [ ] `apps/api/app/routers/referral.py` (2 endpoints):
  - `GET /referral/status`
  - `POST /referral/share`
- [ ] `apps/api/app/routers/recommendations.py` (2 endpoints):
  - `GET /recommendations/{childId}`
  - `GET /seasonal`
- [ ] `apps/api/app/routers/admin.py` (9 endpoints):
  - `GET /admin/prompts`
  - `POST /admin/prompts/{key}/version`
  - `POST /admin/prompts/{key}/test`
  - `POST /admin/prompts/{key}/promote`
  - `POST /admin/prompts/{key}/rollback`
  - `GET /admin/analytics`
  - `GET /admin/quality-dashboard`
  - `GET /admin/moderation-queue`
  - `POST /admin/moderation/{id}/action`

### 4.6 Business Logic Services (15 files)
- [ ] `apps/api/app/services/user_service.py` — CRUD, password hashing, referral code generation
- [ ] `apps/api/app/services/child_service.py` — CRUD, photo handling, face processing trigger
- [ ] `apps/api/app/services/book_service.py` — Create, list, detail, approve, living book ops
- [ ] `apps/api/app/services/order_service.py` — Create order, tracking, soft proof
- [ ] `apps/api/app/services/payment_service.py` — Stripe checkout, webhook processing
- [ ] `apps/api/app/services/print_service.py` — PDF prep, provider submit, status polling
- [ ] `apps/api/app/services/subscription_service.py` — Stripe subs, portal, books remaining tracking
- [ ] `apps/api/app/services/voice_service.py` — Generate, clone, family voice CRUD
- [ ] `apps/api/app/services/gift_service.py` — Purchase, deliver, redeem
- [ ] `apps/api/app/services/classroom_service.py` — Register, students, consent, class books
- [ ] `apps/api/app/services/creator_service.py` — Apply, templates, earnings, payouts
- [ ] `apps/api/app/services/recommendation_service.py` — Personalized recs, seasonal
- [ ] `apps/api/app/services/notification_service.py` — Create, send, mark read
- [ ] `apps/api/app/services/analytics_service.py` — Event tracking, dashboard data
- [ ] `apps/api/app/services/moderation_service.py` — Queue, review, action

### 4.7 Utilities
- [ ] `apps/api/app/utils/events.py` — Append-only event logger (CQRS)
- [ ] `apps/api/app/utils/pagination.py` — Paginate query helper
- [ ] `apps/api/app/utils/helpers.py` — Common utilities

### 4.8 Docker & Alembic
- [ ] `apps/api/Dockerfile` — Python 3.12 slim + Poetry
- [ ] `apps/api/alembic.ini` — Config pointing to app models
- [ ] `apps/api/alembic/env.py` — Async migration support

### 4.9 Verification
- [ ] `uvicorn app.main:app --reload` starts without errors
- [ ] OpenAPI docs at `/docs` list all 76+ endpoints
- [ ] `GET /api/v1/health` returns 200
- [ ] `GET /api/v1/health/deep` checks DB + Redis
- [ ] Auth flow: register -> login -> access protected endpoint -> refresh token
- [ ] Stripe test webhook accepted
- [ ] Python type hints pass mypy
- [ ] All endpoints have proper HTTP status codes and error responses

---

## Step 5: AI Provider Abstraction Layer
**Risk:** MEDIUM | **Spec ref:** Ch4.5 (provider interfaces), Ch4.6 (prompt versioning) | **Depends on:** Step 4

### 5.1 Provider Interfaces
- [ ] `apps/api/app/ai/providers/base.py`:
  - `TextGenerationProvider` (abstract: generate_text, generate_structured)
  - `ImageGenerationProvider` (abstract: generate_image, generate_character_sheet)
  - `VoiceGenerationProvider` (abstract: generate_narration, clone_voice)
  - `FaceProcessingProvider` (abstract: create_embedding, compare_embeddings)
  - Common: `ProviderCapability`, `ProviderMetrics`, `ProviderStatus`

### 5.2 Registry & Router
- [ ] `apps/api/app/ai/providers/registry.py`:
  - Register/deregister providers by capability
  - Health check monitoring
  - Cost/speed/quality ranking
  - Provider selection by capability + requirements
- [ ] `apps/api/app/ai/providers/router.py`:
  - `AIRouter` class with `generate_text()`, `generate_image()`, `generate_voice()`, `process_face()`
  - Provider selection based on health, cost, speed
  - Timeout handling
  - Automatic fallback to next provider on failure
  - A/B experiment routing (configurable traffic split)
- [ ] `apps/api/app/ai/providers/circuit_breaker.py`:
  - States: CLOSED, OPEN, HALF_OPEN
  - Open after 3 failures within 5 minutes
  - 2-minute cool-down before HALF_OPEN
  - Single probe request in HALF_OPEN
  - Reset to CLOSED on success

### 5.3 Mock Providers
- [ ] `apps/api/app/ai/providers/mock_text.py`:
  - Returns pre-generated StoryBlueprint (12 scenes)
  - Returns pre-generated page texts (Hebrew + English)
  - 2-3 complete sample stories that rotate
  - Simulates streaming (word-by-word yield)
- [ ] `apps/api/app/ai/providers/mock_image.py`:
  - Returns placeholder illustration URLs
  - Simulates character sheet generation (4 views)
  - Returns mock quality metrics
- [ ] `apps/api/app/ai/providers/mock_voice.py`:
  - Returns placeholder audio URLs
  - Returns mock Performance Markup
  - Simulates voice cloning status

### 5.4 Verification
- [ ] All 4 provider interfaces define correct abstract methods
- [ ] Registry registers mock providers and returns them by capability
- [ ] Circuit breaker unit tests: closed -> open -> half_open -> closed
- [ ] AIRouter routes to mock providers correctly
- [ ] Fallback works when primary mock is marked unhealthy

---

## Step 6: Next.js Web Application Foundation
**Risk:** MEDIUM | **Spec ref:** Ch4.1 (frontend), Ch10 (design system), Ch15.1 (i18n) | **Depends on:** Steps 1, 2

### 6.1 Next.js Configuration
- [ ] `apps/web/next.config.ts` — App Router, image optimization, webpack for Three.js
- [ ] `apps/web/tailwind.config.ts`:
  - Colors from spec 10.1: primary (#4F46E5), secondary (#8B5CF6), accent (#FBBF24), success (#22C55E), warning (#FB923C), danger (#EF4444), bg-light (#F8FAFC), bg-dark (#0F172A), surface-light (#FFFFFF), surface-dark (#1E293B)
  - Custom font families: noto-sans-hebrew, noto-sans, open-dyslexic
  - Breakpoints: md (768px), lg (1024px), xl (1440px)
- [ ] `apps/web/postcss.config.js`
- [ ] `apps/web/middleware.ts` — Edge: locale detection, security headers, rate limit stubs

### 6.2 i18n Setup (next-intl)
- [ ] `apps/web/i18n/config.ts` — Locales: he (default), en
- [ ] `apps/web/i18n/request.ts` — getRequestConfig
- [ ] `apps/web/i18n/messages/he.json` — 200+ Hebrew translation keys:
  - Common: buttons, labels, errors, success messages
  - Auth: login, register, consent, onboarding
  - Dashboard: welcome, quick actions, recent books, stats
  - Children: profile form, photo upload, face detection, preferences
  - Book creation: wizard steps, prompt builder, styles, moods
  - Reader: modes, settings, accessibility
  - Marketplace: browse, create, reviews
  - Settings: profile, privacy, subscription, accessibility
  - Landing: hero, how-it-works, pricing, testimonials
- [ ] `apps/web/i18n/messages/en.json` — English translations (same 200+ keys)

### 6.3 Fonts & Styles
- [ ] `apps/web/styles/globals.css` — Tailwind directives, CSS custom properties
- [ ] `apps/web/styles/fonts.css` — @font-face: Noto Sans Hebrew (regular, bold), Noto Sans (regular, bold), OpenDyslexic (regular, bold)
- [ ] `apps/web/styles/dyslexia.css` — OpenDyslexic font, line-height 2.0, letter-spacing 0.05em, word-spacing 0.16em, cream bg (#FDF6E3), dark brown text (#3E2723)
- [ ] `apps/web/styles/print.css` — Print styles for book pages
- [ ] Download/add font files to `apps/web/public/fonts/`:
  - NotoSansHebrew-Regular.woff2, NotoSansHebrew-Bold.woff2
  - NotoSans-Regular.woff2, NotoSans-Bold.woff2
  - OpenDyslexic-Regular.woff2, OpenDyslexic-Bold.woff2

### 6.4 ESLint RTL Rules
- [ ] `packages/eslint-config/rtl-rules.js`:
  - Ban: margin-left, margin-right, padding-left, padding-right
  - Ban: text-align: left, text-align: right
  - Ban: float: left, float: right
  - Ban: border-left, border-right
  - Ban: left:, right: (positioning)
  - Suggest: margin-inline-start, margin-inline-end, padding-inline-start, padding-inline-end
  - Suggest: text-start, text-end
  - Suggest: inset-inline-start, inset-inline-end
  - Suggest: border-inline-start, border-inline-end
- [ ] `packages/eslint-config/accessibility-rules.js` — a11y linting
- [ ] `packages/eslint-config/base.js` — Import RTL + a11y rules

### 6.5 Root Layouts
- [ ] `apps/web/app/layout.tsx` — Root: providers (theme, auth context), metadata
- [ ] `apps/web/app/not-found.tsx`
- [ ] `apps/web/app/error.tsx`
- [ ] `apps/web/app/loading.tsx`
- [ ] `apps/web/app/[locale]/layout.tsx` — Locale: set `dir` (rtl/ltr), `lang`, load locale fonts

### 6.6 shadcn/ui Components (22 primitives)
- [ ] `components/ui/button.tsx` — with StoryMagic palette variants
- [ ] `components/ui/input.tsx`
- [ ] `components/ui/textarea.tsx`
- [ ] `components/ui/select.tsx`
- [ ] `components/ui/dialog.tsx`
- [ ] `components/ui/sheet.tsx`
- [ ] `components/ui/card.tsx`
- [ ] `components/ui/badge.tsx`
- [ ] `components/ui/avatar.tsx`
- [ ] `components/ui/tabs.tsx`
- [ ] `components/ui/tooltip.tsx`
- [ ] `components/ui/progress.tsx`
- [ ] `components/ui/slider.tsx`
- [ ] `components/ui/switch.tsx`
- [ ] `components/ui/toast.tsx`
- [ ] `components/ui/skeleton.tsx`
- [ ] `components/ui/dropdown-menu.tsx`
- [ ] `components/ui/command.tsx`
- [ ] `components/ui/popover.tsx`
- [ ] `components/ui/carousel.tsx`
- [ ] `components/ui/accordion.tsx`
- [ ] `components/ui/separator.tsx`

### 6.7 Layout Components
- [ ] `components/layout/AppShell.tsx` — Sidebar + header + main content area
- [ ] `components/layout/Header.tsx` — Logo, nav, language switcher, theme toggle, notifications, user menu
- [ ] `components/layout/Sidebar.tsx` — Nav links: Dashboard, Children, Create Book, Library, Dreams, Marketplace, Classroom, Orders, Settings
- [ ] `components/layout/Footer.tsx` — Links, copyright, language selector
- [ ] `components/layout/MobileNav.tsx` — Bottom tab bar for mobile
- [ ] `components/layout/LanguageSwitcher.tsx` — he/en toggle with flag icons
- [ ] `components/layout/ThemeToggle.tsx` — Light/dark mode
- [ ] `components/layout/NotificationBell.tsx` — Unread count badge
- [ ] `components/layout/BreadcrumbNav.tsx`

### 6.8 Shared Components
- [ ] `components/shared/ErrorRecovery.tsx` — Context-appropriate error messages with illustrations
- [ ] `components/shared/AutoSave.tsx` — Persist state every 30s
- [ ] `components/shared/RetryWithBackoff.tsx`
- [ ] `components/shared/ConnectivityIndicator.tsx` — Online/offline banner
- [ ] `components/shared/SubscriptionGate.tsx` — Feature gating by tier
- [ ] `components/shared/BooksRemainingIndicator.tsx`
- [ ] `components/shared/ReferralShareButton.tsx`
- [ ] `components/shared/NotificationPermission.tsx`
- [ ] `components/shared/LoadingSpinner.tsx`
- [ ] `components/shared/EmptyState.tsx`
- [ ] `components/shared/ConfirmationDialog.tsx`
- [ ] `components/shared/FileUpload.tsx`
- [ ] `components/shared/ImageOptimizer.tsx`
- [ ] `components/shared/SEOHead.tsx`

### 6.9 Landing Page (RSC)
- [ ] `apps/web/app/[locale]/page.tsx`
- [ ] `components/landing/HeroSection.tsx` — Main headline, CTA, hero illustration
- [ ] `components/landing/HowItWorks.tsx` — 3-4 step visual flow
- [ ] `components/landing/StyleShowcase.tsx` — 10 illustration style previews
- [ ] `components/landing/TestimonialCarousel.tsx` — Customer reviews
- [ ] `components/landing/PricingPreview.tsx` — Tier overview
- [ ] `components/landing/SampleBookFlipper.tsx` — Interactive book preview
- [ ] `components/landing/CTASection.tsx` — Final call to action

### 6.10 Dev Tools
- [ ] `components/dev/RTLChecker.tsx` — Outlines elements using physical CSS properties with red border
- [ ] `components/dev/PerformanceBudgetOverlay.tsx` — Shows LCP, CLS, INP in dev

### 6.11 Verification
- [ ] `pnpm --filter web dev` starts without errors
- [ ] Landing page renders in Hebrew (RTL) and English (LTR)
- [ ] Language switcher toggles correctly (URL changes, direction flips)
- [ ] Dark mode toggle works
- [ ] All 22 shadcn/ui components render
- [ ] ESLint RTL rule catches `margin-left` etc.
- [ ] Zero hardcoded strings — all from i18n
- [ ] Responsive: 375px, 768px, 1440px all look correct
- [ ] All layout components present and functional

---

## Step 7: Authentication & User Management
**Risk:** MEDIUM | **Spec ref:** Ch8.2, Ch14.1 (COPPA), Ch9.1 (onboarding) | **Depends on:** Steps 4, 6

### 7.1 Auth Pages
- [ ] `apps/web/app/[locale]/(auth)/login/page.tsx`
- [ ] `apps/web/app/[locale]/(auth)/register/page.tsx`
- [ ] `apps/web/app/[locale]/(auth)/forgot-password/page.tsx`
- [ ] `apps/web/app/[locale]/(auth)/reset-password/page.tsx`

### 7.2 Auth Components
- [ ] `components/auth/LoginForm.tsx` — Email/password + Google OAuth button + Apple OAuth button
- [ ] `components/auth/RegisterForm.tsx` — Name, email, password, language, consent checkbox
- [ ] `components/auth/ParentalConsentModal.tsx` — Full COPPA 2025 consent flow
- [ ] `components/auth/BiometricConsentDisclosure.tsx` — Explicit disclosure: what biometric data is collected (face templates), why, how stored (encrypted, separate DB), retention (12 months inactive), deletion rights
- [ ] `components/auth/OnboardingSelector.tsx` — Quick/Creative/Guided cards with descriptions

### 7.3 Auth Infrastructure
- [ ] `apps/web/app/api/auth/[...nextauth]/route.ts` — BFF proxy to FastAPI
- [ ] `apps/web/app/api/auth/verify-parent/route.ts`
- [ ] `apps/web/lib/auth/session.ts` — JWT storage (httpOnly cookies), silent refresh
- [ ] `apps/web/lib/auth/guards.ts` — `withAuth` HOC, `useAuth` hook, redirect logic

### 7.4 Verification
- [ ] Register with email/password creates user
- [ ] Login returns JWT, stores in httpOnly cookie
- [ ] Protected pages redirect to login when unauthenticated
- [ ] JWT refresh works silently before expiry
- [ ] Password reset flow works end-to-end
- [ ] Parental consent modal blocks face features until consented
- [ ] Biometric disclosure text is legally complete per COPPA 2025
- [ ] Onboarding selector routes to correct first experience

---

## Step 8: Child Profile Management
**Risk:** HIGH | **Spec ref:** Ch8.3, Ch4.4 (face processing), Ch15.5 (special cases) | **Depends on:** Steps 6, 7

### 8.1 Profile Pages
- [ ] `apps/web/app/[locale]/(app)/children/new/page.tsx`
- [ ] `apps/web/app/[locale]/(app)/children/[id]/page.tsx`
- [ ] `apps/web/app/[locale]/(app)/children/[id]/edit/page.tsx`

### 8.2 Profile Components
- [ ] `components/children/ChildProfileForm.tsx` — Name, gender (boy/girl/prefer_not_to_say), birth_date
- [ ] `components/children/PhotoUploader.tsx` — Accept 1-5 photos, drag-drop, camera capture
- [ ] `components/children/FaceDetectionOverlay.tsx` — Canvas overlay: bounding box on detected face
- [ ] `components/children/FaceQualityFeedback.tsx` — Real-time indicators: face detected, centered, sharp, well-lit
- [ ] `components/children/AvatarBuilder.tsx` — Fallback: skin tone, hair color/style, eye color, glasses, accessories
- [ ] `components/children/PhysicalTraitsForm.tsx` — wheelchair, glasses, hearing_aid, custom_notes
- [ ] `components/children/PreferencesForm.tsx` — reading_prefs, accessibility_needs
- [ ] `components/children/FamilyStructureSelector.tsx` — Single parent, two parents, same-sex parents, grandparent caregivers, foster, blended
- [ ] `components/children/CulturalPreferencesForm.tsx` — dietary_restrictions, modesty_concerns, holiday_preferences

### 8.3 Face Detection (Client-Side)
- [ ] `apps/web/lib/face-detection/blazeface-client.ts`:
  - Load TensorFlow.js BlazeFace model (lazy, ~200KB)
  - Detect faces in uploaded image
  - Return bounding box, landmarks, confidence
- [ ] `apps/web/lib/face-detection/quality-scorer.ts`:
  - Face area >= 20% of image (not too far)
  - Face within center 60% (centered)
  - Image resolution >= 512x512 (sharp)
  - Brightness check (not too dark/light)
- [ ] `apps/web/lib/face-detection/image-enhancer.ts` — EXIF orientation fix, resize for upload
- [ ] `apps/web/hooks/useFaceDetection.ts` — Hook wrapping BlazeFace
- [ ] `apps/web/hooks/useFaceQuality.ts` — Hook wrapping quality scorer

### 8.4 Verification
- [ ] Create child profile with name, gender, birth date
- [ ] Upload 1-5 photos with drag-drop
- [ ] BlazeFace detects face and draws bounding box overlay
- [ ] Quality feedback shows: no face / too small / poor lighting / good
- [ ] Avatar builder creates character without photos
- [ ] Physical traits save correctly
- [ ] Cultural preferences save correctly
- [ ] Edit profile updates all fields
- [ ] Delete profile removes all data
- [ ] Works on mobile Safari (camera input + canvas quirks)

---

## Step 9: Book Creation Wizard
**Risk:** HIGH | **Spec ref:** Ch9.1 (UF-01), Ch9.2 (UF-02), Ch10.7, Ch13.3 | **Depends on:** Steps 5-8

### 9.1 Wizard Pages
- [ ] `apps/web/app/[locale]/(app)/books/create/page.tsx` — Full wizard host
- [ ] `apps/web/app/[locale]/(app)/books/create/quick/page.tsx` — Quick create

### 9.2 Wizard Components
- [ ] `components/book-creation/CreationWizard.tsx` — 6-step state machine:
  - Step 1: Select child (or create new)
  - Step 2: Write prompt (free-form or PromptBuilder)
  - Step 3: Choose illustration style
  - Step 4: Choose mood
  - Step 5: Set options (language, page count 8-24, rhyming toggle)
  - Step 6: Preview + confirm
- [ ] `components/book-creation/QuickCreateForm.tsx` — 3 fields: name, age, prompt; auto-fills: style by age (whimsical 2-4, classic 5-7, comic 8-10), 12 pages, no rhyming, Hebrew
- [ ] `components/book-creation/PromptBuilder.tsx` — Guided questions:
  - "What is the theme?" (adventure, friendship, holiday, bedtime)
  - "Where does it happen?" (space, ocean, forest, city)
  - "Who else is there?" (animal, friend, magical creature)
  - "What does the child learn?" (courage, sharing, patience)
  - Compose into editable prompt
- [ ] `components/book-creation/MoodSelector.tsx` — 6 illustrated emoji grid: happy, exciting, sad, scared, angry, calm
- [ ] `components/book-creation/StyleSelector.tsx` — Grid of 10 styles with previews
- [ ] `components/book-creation/StylePreviewCard.tsx` — Style name, sample image, description
- [ ] `components/book-creation/ChildSelector.tsx` — Single child select with avatar
- [ ] `components/book-creation/MultiChildSelector.tsx` — Up to 4 children for same book
- [ ] `components/book-creation/OptionsPanel.tsx` — Language, page count slider, rhyming toggle, bilingual toggle
- [ ] `components/book-creation/StoryStreamingDisplay.tsx` — Word-by-word text appearance (50-100ms per word)
- [ ] `components/book-creation/StoryPreview.tsx` — Full story text with page breaks
- [ ] `components/book-creation/ConversationalEditor.tsx` — Chat-like NL edit: "make it funnier", "add a hug at the end"
- [ ] `components/book-creation/IllustrationEditor.tsx` — NL illustration edit: "change background to forest"
- [ ] `components/book-creation/BilingualModeSelector.tsx` — Side-by-side vs sequential
- [ ] `components/book-creation/CulturalReviewPanel.tsx` — Show warnings with "Keep As Is" / "Change It"
- [ ] `components/book-creation/GenerationProgressTracker.tsx` — Progress bar + phase indicator

### 9.3 Supporting Infrastructure
- [ ] `apps/web/hooks/useBookGeneration.ts` — Orchestrates creation flow
- [ ] `apps/web/hooks/useBookGenerationSSE.ts` — EventSource for progress stream
- [ ] `apps/web/hooks/useAutoSave.ts` — Persist wizard state every 30s + on step change + on visibility change
- [ ] `components/shared/AutoSave.tsx` — AutoSave wrapper component
- [ ] `components/dashboard/DraftRecoveryBanner.tsx` — "Continue from where you left off?"

### 9.4 BFF API Routes
- [ ] `apps/web/app/api/books/route.ts` — Proxy to FastAPI /books
- [ ] `apps/web/app/api/books/[id]/route.ts`
- [ ] `apps/web/app/api/books/[id]/progress/route.ts` — SSE stream proxy

### 9.5 Verification
- [ ] Full 6-step wizard: select child -> prompt -> style -> mood -> options -> preview
- [ ] Quick create: 3 fields -> auto defaults -> preview
- [ ] Prompt builder composes prompt from guided answers
- [ ] Story text streams word-by-word
- [ ] Conversational editor sends edit and gets mock response
- [ ] AutoSave persists to DB every 30 seconds
- [ ] "Continue" banner appears for unfinished drafts
- [ ] All 10 illustration styles show previews
- [ ] Wizard back/forward navigation preserves state
- [ ] RTL layout correct for Hebrew

---

## Step 10: Magic Moment Experience
**Risk:** MEDIUM | **Spec ref:** Ch9.1 (Magic Moment), Ch10.5 | **Depends on:** Step 9

### 10.1 Phase Components
- [ ] `components/book-creation/MagicMomentExperience.tsx` — Main orchestrator, listens to SSE progress
- [ ] `components/book-creation/MagicPhaseTyping.tsx` — Phase 1 (0-5%): Text writes itself with feather cursor
- [ ] `components/book-creation/MagicPhaseTransform.tsx` — Phase 2 (5-20%): Child photo morphs into illustration style
- [ ] `components/book-creation/MagicPhasePainting.tsx` — Phase 3 (20-55%): Pages fan across, fill with color via paint splash
- [ ] `components/book-creation/MagicPhaseAssembly.tsx` — Phase 4 (55-95%): Book pages stack, cover wraps
- [ ] `components/book-creation/MagicPhaseReveal.tsx` — Phase 5 (95-100%): Confetti + 3D tilt cover reveal + "Open Your Book" button

### 10.2 Supporting Elements
- [ ] `components/book-creation/EarlyPeek.tsx` — First illustration displayed full-screen at ~30% ("aha moment")
- [ ] `components/book-creation/FactTicker.tsx` — Rotating facts every 8 seconds
- [ ] `components/book-creation/SocialProofCounter.tsx` — "47 books being created right now!"
- [ ] `components/book-creation/SharePreviewButton.tsx` — Generate blurred cover preview + "Coming soon..." text for social sharing

### 10.3 SSE Backend
- [ ] `apps/web/app/api/books/[id]/progress/route.ts` — SSE endpoint proxying FastAPI progress stream
- [ ] FastAPI progress stream with mock timed events simulating 12-phase pipeline

### 10.4 Animations & Assets
- [ ] Confetti animation (canvas-confetti or Lottie: `public/animations/confetti.lottie`)
- [ ] Paint splash animation (`public/animations/paint-splash.lottie`)
- [ ] Sparkle transform animation (`public/animations/sparkle-transform.lottie`)
- [ ] Ambient background color gradients per phase (Framer Motion)
- [ ] 3D tilt cover reveal (CSS perspective transforms)

### 10.5 Verification
- [ ] All 5 phases transition smoothly
- [ ] SSE progress percentage updates in real-time
- [ ] Early Peek shows at ~30%
- [ ] Fact ticker rotates correctly
- [ ] "Notify Me When Ready" button works
- [ ] Confetti + 3D cover reveal plays
- [ ] Share button generates preview image
- [ ] Works on 375px mobile viewport
- [ ] Sparky mascot appears with encouraging comments

---

# MILESTONE 2: AI INTEGRATION (Steps 11-16)

Target: Real AI end-to-end — prompt to fully generated book with quality validation

---

## Step 11: Interactive Book Reader
**Risk:** VERY HIGH | **Spec ref:** Ch9.4 (UF-04), Ch10.3 (neuro modes), Ch4.1 (WebGPU) | **Depends on:** Steps 6, 9

### 11.1 Reader Pages
- [ ] `apps/web/app/[locale]/(app)/books/[id]/read/page.tsx`
- [ ] `apps/web/app/api/books/[id]/interactive/route.ts` — BFF proxy

### 11.2 Core Reader Components
- [ ] `components/reader/InteractiveBookReader.tsx` — Main reader container
- [ ] `components/reader/ReaderModeSelector.tsx` — "I Read" / "Read to Me" / "Parent Voice" / "Night Mode"
- [ ] `components/reader/PageRenderer.tsx` — Renders text + illustration per layout type (5 types from spec 5.7)
- [ ] `components/reader/PageAnimationLayer.tsx` — Manages ambient animations per page
- [ ] `components/reader/ReaderSettingsPanel.tsx` — Font size, speed, accessibility mode, buddy toggle
- [ ] `components/reader/ReadingSpeedSlider.tsx`
- [ ] `components/reader/ReadingPreferencesContext.tsx` — React context for reader state

### 11.3 Particle System (Three.js WebGPU + Canvas fallback)
- [ ] `components/reader/ParticleSystem.tsx` — Three.js WebGPU renderer
- [ ] `components/reader/ParticleSystemFallback.tsx` — Canvas 2D fallback
- [ ] `apps/web/lib/reader/particle-engine.ts` — WebGPU: compute shaders for physics, render pipeline
- [ ] `apps/web/lib/reader/particle-engine-canvas.ts` — Canvas: requestAnimationFrame loop
- [ ] `apps/web/lib/reader/animation-presets.ts` — 6 presets:
  - Falling leaves: brown/orange particles, slow drift, wind sway
  - Twinkling stars: white/yellow dots, random twinkle opacity
  - Floating bubbles: translucent circles, slow rise, pop on edge
  - Gentle rain: blue streaks, downward, splash at bottom
  - Snowfall: white flakes, drift left/right, accumulate
  - Fireflies: warm yellow dots, random wander, glow pulse
- [ ] `apps/web/hooks/useWebGPU.ts` — WebGPU availability detection + fallback decision
- [ ] `apps/web/hooks/useParticleSystem.ts` — Hook managing particle lifecycle

### 11.4 Karaoke Mode
- [ ] `components/reader/KaraokeReader.tsx` — Word-by-word highlighting container
- [ ] `components/reader/WordHighlighter.tsx` — Bouncing pointer moving word to word
- [ ] `apps/web/lib/reader/karaoke-engine.ts` — Word timing sync with audio playback
- [ ] `apps/web/lib/reader/audio-controller.ts` — Web Audio API: narration + SFX mixing

### 11.5 Interactive Elements
- [ ] `components/reader/InteractiveElements.tsx` — Container for tappable items
- [ ] `components/reader/TappableObject.tsx` — Tap/click handler with highlight
- [ ] `components/reader/FunFactBubble.tsx` — "Did you know?" popup

### 11.6 Night Mode
- [ ] `components/reader/NightMode.tsx` — Auto 7PM-7AM (testable with mock time)
- [ ] `apps/web/lib/reader/night-mode-controller.ts` — Dimmed colors, calming bg music, slow pace
- [ ] `apps/web/hooks/useNightMode.ts`

### 11.7 End-of-Book
- [ ] `components/reader/EndOfBookCelebration.tsx` — Confetti + "You finished the book!"
- [ ] `components/reader/QuizQuestion.tsx` — One interactive question about the story

### 11.8 Neuro-Inclusive Modes (spec 10.3)
- [ ] `components/reader/NeuroInclusiveModes.tsx` — Mode switcher
- [ ] `components/reader/DyslexiaMode.tsx`:
  - OpenDyslexic font, line-height 2.0, letter-spacing 0.05em
  - Cream background (#FDF6E3), dark brown text (#3E2723)
  - No italic, no justified text, max 10 words/line
  - Optional syllable markers
- [ ] `components/reader/ADHDMode.tsx`:
  - Max 3 sentences per page view (split with smooth transition)
  - Interactive element guaranteed every page
  - Encouragement message every 3 pages (pool of 15)
  - Prominent progress indicator with celebrations at 25%, 50%, 75%, 100%
  - Optional break reminder after 10 pages
  - Reduced decorative elements
- [ ] `components/reader/AutismMode.tsx`:
  - Uniform predictable layout (identical structure every page)
  - No surprise animations, all gentle + consistent
  - Explicit emotion labels: "Dana feels happy because..."
  - Social story structure, clear cause-and-effect
  - Calm muted color palette, no flashing
  - Transition warning before page change
  - Concrete language only

### 11.9 Reading Progress & Offline
- [ ] `apps/web/hooks/useReadingProgress.ts` — Save/restore progress + bookmarks
- [ ] `components/reader/OfflineDownloadButton.tsx` — "Download for Offline Reading"
- [ ] `components/reader/ReadingAnalytics.tsx` — Track: time per page, pages reread, taps
- [ ] `components/reader/BehindTheStory.tsx` — Co-creation journey display

### 11.10 Page Navigation
- [ ] `components/book-creation/PageFlipViewer.tsx` — Flip animation (touch swipe + click)
- [ ] `components/book-creation/BookPreview.tsx` — Full preview with page-flip

### 11.11 Verification
- [ ] Page-flip works with touch swipe and click
- [ ] All 6 particle animations render (test WebGPU + Canvas)
- [ ] WebGPU fallback auto-detects correctly
- [ ] Karaoke highlights words in sync with audio
- [ ] Tappable elements show fun facts
- [ ] Night mode activates between 7PM-7AM
- [ ] End-of-book celebration + quiz
- [ ] Dyslexia mode: correct font, colors, spacing
- [ ] ADHD mode: 3 sentences max, progress bar, encouragement
- [ ] Autism mode: uniform layout, no surprises, emotion labels
- [ ] Reading progress saves and restores
- [ ] 60fps animation on desktop

---

## Step 12: Reading Buddy AI
**Risk:** LOW | **Spec ref:** Ch3.10 (F-10) | **Depends on:** Step 11

- [ ] `components/reader/ReadingBuddy.tsx` — Owl with glasses in corner
- [ ] `components/reader/ReadingBuddyQuestion.tsx` — Question display + interaction
- [ ] Age-appropriate questions:
  - Ages 2-4: pointing and counting ("Can you find the red ball?")
  - Ages 5-7: prediction and emotion ("How do you think Mika feels?")
  - Ages 8-10: analytical ("Why did the character choose to...?")
- [ ] Pool of 20 encouragement messages
- [ ] Disableable in reader settings
- [ ] Verify: owl appears, questions match age, tap shows encouragement

---

## Step 13: AI Agents (Python Backend)
**Risk:** VERY HIGH | **Spec ref:** Ch5 (all agents), Appendix A (rhyme dict) | **Depends on:** Step 5

### 13.1 Base Agent
- [ ] `apps/api/app/ai/agents/base_agent.py`:
  - Common: prompt loading via PromptManager
  - Provider calling via AIRouter
  - Output validation (Pydantic schema)
  - Event logging (book_events)
  - Retry logic with backoff

### 13.2 Agents (15 total — build in pipeline order)
- [ ] `agents/story_architect.py` (A-01): Free-form prompt -> StoryBlueprint (title, theme, moral, emotional_arc, scenes[]). Structured output via JSON Schema.
- [ ] `agents/hebrew_poet.py` (A-02): Blueprint -> literary text. RAG retrieves 20 relevant rhyme pairs. Rhyme validation + retry (max 2). Prose fallback if rhyming fails.
- [ ] `agents/art_director.py` (A-04): Scene -> detailed image prompt + negative prompt + composition + color palette + camera angle. Style-specific visual directives (5+ keywords per style).
- [ ] `agents/age_adaptation.py` (A-03): Text -> age-adapted text. Rules: 2-3 (6 words max), 4-5 (10 words), 6-7 (15 words), 8-10 (full literary). Lexile score output.
- [ ] `agents/emotional_tone.py` (A-05): All pages -> emotional analysis (emotion, intensity 0-10, alignment). Safety: fear <= 4 for ages 2-5, <= 6 for ages 6-10. Final 2 pages must be warmth/joy >= 7.
- [ ] `agents/illustration_layout.py` (A-06): Page metadata -> layout type. Rules: opening = full illustration overlay, climax = full spread, dialogue = side-by-side (flipped for RTL). Safe zones for print (3mm bleed, gutter).
- [ ] `agents/quality_critic.py` (A-07): LLM-as-Judge. Uses different LLM than generator. Score 0-100. Threshold 75. Issues: critical (score=0, mandatory regen), major (-20), minor (-5). Checks: safety, age-appropriateness, coherence, name consistency, pronoun consistency.
- [ ] `agents/consistency_guardian.py` (A-08): All pages -> consistency score. Checks: character description consistency, environment continuity, temporal logic, accessory persistence, emotional flow. Multi-Reference face embedding check.
- [ ] `agents/parental_guidance.py` (A-09): Blueprint + text -> ParentalGuide (3-sentence summary, educational value, 5 discussion questions, 3 activities with materials, emotional notes).
- [ ] `agents/cultural_sensitivity.py` (A-10): Text + prompts + prefs -> approval/warnings. Checks: food/dietary, clothing/modesty, holidays, family structure, pronouns, stereotypes. Warns, doesn't block.
- [ ] `agents/bilingual_adaptation.py` (A-11): Primary text -> culturally adapted secondary language. Adapts food/places/customs, replaces idioms, adapts humor. Preserves meaning.
- [ ] `agents/accessibility_adaptation.py` (A-12): Text + prefs -> adapted content. Autism: concrete language, no idioms. Dyslexia: simpler words, shorter sentences. ADHD: split paragraphs, interactive elements. Visual impairment: rich alt text.
- [ ] `agents/narration_director.py` (A-13): Text -> Performance Markup. AI-driven context understanding. Speaker, emotion, pace, pauses, emphasized words, sound effects (from 30-effect library per Appendix B).
- [ ] `agents/illustration_repair.py` (A-14): Image + problem description -> repaired image via targeted inpainting. 5x faster than full regeneration.
- [ ] `agents/recommendation.py` (A-15): Child profile + history -> 5 ranked recommendations with NL explanations. Collaborative + content-based + contextual filtering.

### 13.3 Prompt Templates (11 files)
- [ ] `apps/api/app/ai/prompts/templates/story_architect_v1.txt` (500-2000 words)
- [ ] `apps/api/app/ai/prompts/templates/hebrew_poet_v1.txt`
- [ ] `apps/api/app/ai/prompts/templates/age_adaptation_v1.txt`
- [ ] `apps/api/app/ai/prompts/templates/art_director_v1.txt`
- [ ] `apps/api/app/ai/prompts/templates/emotional_tone_v1.txt`
- [ ] `apps/api/app/ai/prompts/templates/quality_critic_v1.txt`
- [ ] `apps/api/app/ai/prompts/templates/consistency_guardian_v1.txt`
- [ ] `apps/api/app/ai/prompts/templates/cultural_sensitivity_v1.txt`
- [ ] `apps/api/app/ai/prompts/templates/bilingual_adaptation_v1.txt`
- [ ] `apps/api/app/ai/prompts/templates/accessibility_adaptation_v1.txt`
- [ ] `apps/api/app/ai/prompts/templates/narration_director_v1.txt`

### 13.4 Prompt Versioning
- [ ] `apps/api/app/ai/prompts/manager.py` — Load active version from DB or file, variable substitution
- [ ] `apps/api/app/ai/prompts/tester.py` — Regression testing against 50+ test cases

### 13.5 Hebrew Rhyme System
- [ ] `apps/api/app/rhyme/hebrew_dictionary.py` — 200+ pairs organized by ending sound (Appendix A):
  - ים (im): ימים, שמיים, מים, חיים, כוכבים, פרחים, חברים, ציפורים, נמלים, עננים
  - ה (ah): שמחה, ברכה, חלומה, נסיכה, ארוכה, גבוהה, יפה, טובה
  - ת (et/at): חברות, ארצות, לבבות, כוכבת, מלכות, שמחות, חלומות
  - ור (or): אור, דבור, ציפור, תנור, חלון, סיפור
  - + topic tags for RAG retrieval
- [ ] `apps/api/app/rhyme/rhyme_validator.py` — Compare final words against dictionary
- [ ] `apps/api/app/rhyme/rhyme_rag.py` — Retrieve 20 most relevant pairs by topic embedding

### 13.6 AI Evaluation Framework
- [ ] `apps/api/app/ai/eval/evaluator.py` — Run agent against test cases, score results
- [ ] `apps/api/app/ai/eval/rubrics.py` — Quality rubrics per agent
- [ ] `apps/api/app/ai/eval/test_cases/story_generation.json`
- [ ] `apps/api/app/ai/eval/test_cases/age_adaptation.json`
- [ ] `apps/api/app/ai/eval/test_cases/cultural_sensitivity.json`

### 13.7 Verification
- [ ] Each agent produces correct output schema with mock providers
- [ ] Story Architect outputs all 5 narrative roles
- [ ] Hebrew Poet rhyme validation works
- [ ] Art Director includes style-specific directives
- [ ] Quality Critic scores and issues are structured correctly
- [ ] Narration Director produces complete Performance Markup
- [ ] Unit tests pass for each agent

---

## Step 14: LangGraph Orchestrator + Temporal.io
**Risk:** VERY HIGH | **Spec ref:** Ch5.17 (orchestrator), Ch4.3 (Temporal) | **Depends on:** Steps 5, 13

- [ ] `apps/api/app/ai/orchestrator/state.py` — BookGenerationState (all intermediate data)
- [ ] `apps/api/app/ai/orchestrator/nodes.py` — Graph nodes wrapping each agent
- [ ] `apps/api/app/ai/orchestrator/conditions.py` — Edge conditions: quality pass/fail, retry counts, phase transitions
- [ ] `apps/api/app/ai/orchestrator/graph.py` — LangGraph StateGraph with 12 phases:
  - Phase 1 (0-5%): Story Architect
  - Phase 2 (5-20%): Hebrew Poet + Art Director + Character Sheet (parallel)
  - Phase 3 (20-35%): Age Adaptation (+ Accessibility if prefs set)
  - Phase 4 (35-45%): Emotional Tone (retry loop max 2 if issues)
  - Phase 5 (45-50%): Illustration Layout
  - Phase 6 (50-55%): Quality Critic text eval (critical = restart from Ph2 max 1x)
  - Phase 7 (55-85%): Image generation (4 parallel, per-page progress)
  - Phase 8 (85-88%): Quality + Likeness gates (repair or regen max 2x per page)
  - Phase 9 (88-92%): Consistency Guardian (multi-reference check)
  - Phase 10 (92-95%): Narration Director + Voice generation
  - Phase 11 (95-97%): Parental Guidance + Cultural Sensitivity
  - Phase 12 (97-100%): Book Assembly (interactive JSON + preview images + PDF if ordered)
- [ ] `apps/api/app/workflows/book_generation.py` — Temporal.io workflow wrapper
- [ ] `apps/api/app/workflows/activities.py` — Temporal activities for each agent call
- [ ] `apps/api/worker/main.py` — Temporal worker process
- [ ] SSE progress stream from orchestrator to FastAPI to BFF to frontend
- [ ] Additional Temporal workflows:
  - [ ] `apps/api/app/workflows/voice_generation.py` — Voice narration pipeline
  - [ ] `apps/api/app/workflows/print_order.py` — Print order fulfillment
  - [ ] `apps/api/app/workflows/voice_cloning.py` — Voice clone processing
  - [ ] `apps/api/app/workflows/photo_processing.py` — Face embedding creation
- [ ] Verify: full pipeline runs with mock providers, progress streams correctly, Temporal Web UI shows execution

---

## Step 15: Quality Pipeline
**Risk:** MEDIUM | **Spec ref:** Ch6 (all gates) | **Depends on:** Steps 13, 14

- [ ] `apps/api/app/quality/safety_gate.py` — 500+ word blocklists (violence, sexual, drugs, profanity, self-harm), age-calibrated sensitivity, pattern detection (phone/URL/email), secondary AI check
- [ ] `apps/api/app/quality/blocklists/he_blocked.txt` — Hebrew blocked words
- [ ] `apps/api/app/quality/blocklists/en_blocked.txt` — English blocked words
- [ ] `apps/api/app/quality/blocklists/blocked_names.txt` — Public figures' children
- [ ] `apps/api/app/quality/technical_quality_gate.py` — Min dimensions 1024x1024, aspect ratio, blur (Laplacian variance), anomaly detection (vision API)
- [ ] `apps/api/app/quality/consistency_gate.py` — Character descriptions across prompts, style consistency, color palette, multi-reference face embedding check
- [ ] `apps/api/app/quality/likeness_gate.py` — Face embedding cosine similarity, threshold 0.75, triggers repair/regen
- [ ] `apps/api/app/quality/pipeline.py` — Chain: SafetyGate (fail = halt) -> TechnicalQuality -> Likeness -> Consistency. Results stored as book events.
- [ ] Verify: pipeline correctly blocks unsafe content, detects blur, rejects low likeness

---

## Step 16: Real AI Provider Integration
**Risk:** VERY HIGH | **Spec ref:** Ch4.4 (services S-01 through S-05) | **Depends on:** Steps 5, 13-15

- [ ] `apps/api/app/ai/providers/claude_text.py` — Anthropic Claude API: structured output (JSON Schema), system prompts, streaming
- [ ] `apps/api/app/ai/providers/gemini_text.py` — Google Gemini API: secondary LLM
- [ ] `apps/api/app/ai/providers/openai_text.py` — OpenAI GPT-4o: tertiary LLM
- [ ] `apps/api/app/ai/providers/comfyui_image.py` — ComfyUI orchestration: workflow JSON, Flux Kontext base model
- [ ] `apps/api/app/ai/providers/flux_kontext_image.py` — Flux Kontext direct integration with PuLID for FaceID, ControlNet for pose
- [ ] `apps/api/app/ai/providers/elevenlabs_voice.py` — ElevenLabs: narration, SSML, voice cloning
- [ ] `apps/api/app/ai/providers/cartesia_voice.py` — Cartesia: low-latency for co-creation
- [ ] `apps/api/app/ai/providers/fish_audio_voice.py` — Fish Audio: open-source fallback
- [ ] `apps/api/app/ai/providers/insightface_face.py` — InsightFace/ArcFace: face embedding creation, comparison
- [ ] Character Sheet Pipeline: 4-view generation (front, profile, three-quarter, back)
- [ ] Post-processing: hand/finger fixer, upscaler (Real-ESRGAN for 300 DPI print), color profile (sRGB to CMYK)
- [ ] RunPod Serverless GPU setup: Tier 1 (A100/H100) for cover, Tier 2 (A10G/L4) for pages, Tier 3 (T4) for thumbnails
- [ ] Provider routing configuration + A/B test setup
- [ ] Verify: full book generation with real AI produces quality results

---

# MILESTONE 3: PREMIUM EXPERIENCE (Steps 17-25)

---

## Step 17: Voice System
**Risk:** MEDIUM | **Spec ref:** Ch3.3 (F-03), Ch11, Ch8.6 | **Depends on:** Step 16

- [ ] `components/voice/VoiceSelector.tsx` — 20+ preset voices with previews
- [ ] `components/voice/VoicePreviewPlayer.tsx` — Play sample audio
- [ ] `components/voice/FamilyVoiceRecorder.tsx` — Record 30-second reading sample
- [ ] `components/voice/RecordingQualityFeedback.tsx` — Background noise, volume, clarity checks
- [ ] `components/voice/VoiceNarrationPlayer.tsx` — Playback with Performance Markup
- [ ] `components/voice/AudioWaveform.tsx` — Visual waveform display
- [ ] `components/voice/VoiceCloneStatus.tsx` — Processing/ready/failed indicator
- [ ] Settings page: `apps/web/app/[locale]/(app)/settings/voices/page.tsx`
- [ ] ElevenLabs voice cloning integration
- [ ] Verify: voice narration plays with Performance Markup, clone from 30s recording

## Step 18: Co-Creation Mode
**Risk:** MEDIUM | **Spec ref:** Ch3.9 (F-09), Ch9.3 (UF-03) | **Depends on:** Steps 9, 17

- [ ] `apps/web/app/[locale]/(app)/books/create/together/page.tsx`
- [ ] `components/co-creation/CoCreationWizard.tsx` — Parent+child flow
- [ ] `components/co-creation/SparkyMascot.tsx` — Animated guide (small glowing star)
- [ ] `components/co-creation/SparkyChatBubble.tsx` — Speech bubbles for Sparky
- [ ] `components/co-creation/VoiceInteractionProvider.tsx` — Web Speech API STT
- [ ] `components/co-creation/StoryChoiceCard.tsx` — Illustrated choice option
- [ ] `components/co-creation/ChoiceGrid.tsx` — Grid of 4 choices + "something else"
- [ ] `components/co-creation/CreationJourneyMap.tsx` — Visual journey of choices
- [ ] `components/reader/BehindTheStory.tsx` — "Behind the Story" page showing child's choices
- [ ] Full fallback: every voice step supports tap and type
- [ ] Verify: co-creation flow works with voice, fallback to tap/type works

## Step 19: Family Bookshelf
**Risk:** MEDIUM | **Spec ref:** Ch10.6 (bookshelf), Ch10.9 (Book DNA), Ch10.10 (seasonal) | **Depends on:** Step 11

- [ ] `apps/web/app/[locale]/(app)/books/library/page.tsx`
- [ ] `components/library/FamilyBookshelf.tsx` — 3D CSS shelf (perspective, rotateX tilt)
- [ ] `components/library/BookshelfShelf.tsx` — Individual shelf row
- [ ] `components/library/BookSpine.tsx` — Vertical book with colored spine by style, hover pull-forward
- [ ] `components/library/StoryWorldMap.tsx` — Alternative view: illustrated map of book "locations"
- [ ] `components/library/MapLocation.tsx` — Book as map point (star for space, island for ocean, tree for forest)
- [ ] `components/library/LibraryViewToggle.tsx` — Shelf vs Map view
- [ ] `components/library/LivingBookBadge.tsx` — Golden badge
- [ ] `components/library/LivingBookTimeline.tsx` — Chapter timeline
- [ ] `components/library/LivingBookToggle.tsx` — Enable/disable
- [ ] `components/library/ReadingCornerBackground.tsx` — Time-of-day: morning sun, evening sunset, night stars+moon
- [ ] `components/library/SeasonalBookshelfTheme.tsx` — Sukkah (Sukkot), candlelight (Hanukkah), beach (summer), costumes (Purim)
- [ ] `components/library/BookDNAPattern.tsx` — Unique generative visual from story embedding vectors
- [ ] Verify: bookshelf renders with 3D transforms, book spines clickable, map view works

## Step 20: Dream Journal
**Risk:** LOW | **Spec ref:** Ch3.11 (F-11), Ch8.17 | **Depends on:** Steps 9, 13

- [ ] `apps/web/app/[locale]/(app)/dreams/page.tsx`
- [ ] `components/dreams/DreamRecorder.tsx` — Voice (Web Speech API) + text input
- [ ] `components/dreams/DreamCard.tsx` — Dream with emotion classification
- [ ] `components/dreams/DreamTimeline.tsx` — Chronological dream list
- [ ] `components/dreams/DreamToBookButton.tsx` — Convert dream to book (Dreamscape style)
- [ ] After 10 dreams, offer "Book of Dreams" anthology
- [ ] Verify: record dream, emotional classification, convert to book

## Step 21: Marketplace
**Risk:** MEDIUM | **Spec ref:** Ch3.6 (F-06), Ch8.12-8.13 | **Depends on:** Steps 4, 6

- [ ] `apps/web/app/[locale]/(app)/marketplace/page.tsx`
- [ ] `apps/web/app/[locale]/(app)/marketplace/[id]/page.tsx`
- [ ] `apps/web/app/[locale]/(app)/marketplace/become-creator/page.tsx`
- [ ] `apps/web/app/[locale]/(app)/marketplace/creator/dashboard/page.tsx`
- [ ] `apps/web/app/[locale]/(app)/marketplace/creator/templates/new/page.tsx`
- [ ] `apps/web/app/[locale]/(app)/marketplace/creator/templates/[id]/edit/page.tsx`
- [ ] `apps/web/app/[locale]/(app)/marketplace/creator/earnings/page.tsx`
- [ ] `components/marketplace/TemplateGrid.tsx`, `TemplateCard.tsx`, `FilterSidebar.tsx`, `SearchBar.tsx`
- [ ] `components/marketplace/ReviewSection.tsx`, `ReviewForm.tsx`, `ReportButton.tsx`
- [ ] `components/creator/CreatorApplicationForm.tsx`
- [ ] `components/creator/TemplateBuilder.tsx`, `SceneEditor.tsx`, `PlaceholderInserter.tsx`, `TemplatePreview.tsx`
- [ ] `components/creator/CreatorDashboard.tsx`, `EarningsChart.tsx`, `SalesTable.tsx`, `PayoutRequest.tsx`
- [ ] Stripe Connect for 70/30 revenue split
- [ ] Content moderation before publication
- [ ] Verify: full creator and marketplace flow, reviews, reporting

## Step 22: Classroom Edition
**Risk:** MEDIUM | **Spec ref:** Ch3.14 (F-14), Ch8.14, Ch9.7 | **Depends on:** Steps 4, 7

- [ ] `apps/web/app/[locale]/(app)/classroom/` — All classroom pages
- [ ] `components/classroom/ClassroomRegistration.tsx`
- [ ] `components/classroom/StudentRoster.tsx`
- [ ] `components/classroom/ConsentStatusTable.tsx` — Track per-student consent status
- [ ] `components/classroom/ConsentForm.tsx` — Parent-facing COPPA consent
- [ ] `components/classroom/ClassBookCreator.tsx` — Select template, all consented kids as characters
- [ ] `components/classroom/StudentOfTheWeek.tsx`
- [ ] `components/classroom/TeacherDashboard.tsx`
- [ ] `apps/web/app/[locale]/(public)/consent/[token]/page.tsx` — Public consent page
- [ ] B2B pricing: free (1 book/semester), school ($49/mo), district (custom)
- [ ] Verify: register classroom, add students, consent flow, create class book

## Step 23: Subscriptions & Payments
**Risk:** MEDIUM | **Spec ref:** Ch3.5 (F-05), Ch8.10-8.11, Ch4.7 (Stripe) | **Depends on:** Step 4

- [ ] `apps/web/app/[locale]/(public)/pricing/page.tsx`
- [ ] `components/pricing/PricingTable.tsx`, `PlanCard.tsx`, `FeatureComparison.tsx`, `CurrencyToggle.tsx`
- [ ] `components/shared/SubscriptionGate.tsx` — Gate features by tier
- [ ] `components/shared/BooksRemainingIndicator.tsx` — Monthly: 2, Yearly: 24 cap
- [ ] `apps/web/app/[locale]/(app)/settings/subscription/page.tsx`
- [ ] `components/settings/SubscriptionManager.tsx` — Stripe Customer Portal
- [ ] Stripe webhook handlers: subscription.created, updated, deleted, invoice.paid, invoice.payment_failed
- [ ] Free tier: 1 digital book with watermark, 1 style, no voice
- [ ] Monthly ($14.99): 2 books, all styles, voice, 20% print discount
- [ ] Yearly ($119.99): all features, 3 free prints, voice cloning, 24 book cap
- [ ] Verify: purchase subscription, upgrade, downgrade, cancel, books remaining tracking

## Step 24: Print Pipeline
**Risk:** MEDIUM | **Spec ref:** Ch3.7 (F-07), Ch4.4 (S-05), Ch8.8-8.9 | **Depends on:** Steps 14, 16

- [ ] `apps/web/app/[locale]/(app)/books/[id]/print/page.tsx`
- [ ] `components/orders/PrintOptions.tsx` — Hardcover/softcover, square/A4, gift wrap
- [ ] `components/orders/SoftProofViewer.tsx` — CMYK preview for approval
- [ ] `components/orders/DedicationEditor.tsx` — Text + handwritten upload
- [ ] `components/orders/OrderTracker.tsx`, `TrackingTimeline.tsx`
- [ ] `apps/api/app/print/pdf_assembler.py` — CMYK, 3mm bleed, crop marks, spine width from page count
- [ ] `apps/api/app/print/provider_interface.py`, `router.py`
- [ ] `apps/api/app/print/qr_generator.py` — AR QR codes per page
- [ ] `apps/api/app/print/soft_proofer.py` — CMYK preview generation
- [ ] `apps/api/app/print/providers/lulu.py` — Lulu Print API integration
- [ ] `apps/api/app/print/providers/peecho.py` — Peecho fallback
- [ ] `apps/api/app/print/providers/blurb.py` — Blurb fallback
- [ ] `apps/api/app/print/providers/mock_print.py`
- [ ] Verify: generate print-ready PDF, submit to Lulu, soft proof, tracking

## Step 25: Gift Cards & Referral
**Risk:** LOW | **Spec ref:** Ch3.13 (F-13), Ch8.15-8.16, Ch9.6 | **Depends on:** Steps 4, 23

- [ ] `apps/web/app/[locale]/(public)/gift/page.tsx`
- [ ] `apps/web/app/[locale]/(public)/gift/redeem/[code]/page.tsx`
- [ ] `components/gifts/GiftPurchaseFlow.tsx` — 3 tiers: digital ($9.99), print ($34.99), experience ($49.99)
- [ ] `components/gifts/GiftMessageEditor.tsx` — Personal message
- [ ] `components/gifts/GiftDeliveryScheduler.tsx` — Scheduled email delivery
- [ ] `components/gifts/GiftRedeemExperience.tsx` — Gift unwrapping flow
- [ ] `components/gifts/UnwrappingAnimation.tsx` — Wrapping paper tears away (Lottie: `public/animations/unwrap-gift.lottie`)
- [ ] `components/shared/ReferralShareButton.tsx` — Share referral code
- [ ] `apps/web/app/[locale]/(app)/settings/referral/page.tsx`
- [ ] Verify: purchase gift, scheduled delivery, redeem with animation, referral tracking

---

# MILESTONE 4: SCALE (Steps 26-32)

---

## Step 25b: Augmented Reality (F-15)
**Risk:** HIGH | **Spec ref:** Ch3.15 | **Depends on:** Steps 24, 16

- [ ] `apps/web/app/[locale]/(public)/ar/[bookId]/[pageNumber]/page.tsx` — Web-based AR (no app required)
- [ ] `components/ar/ARViewer.tsx` — Camera feed + character overlay
- [ ] `components/ar/ARCharacterOverlay.tsx` — Characters "come alive" from book
- [ ] `components/ar/ARCaptureButton.tsx` — Capture photo/video of AR experience
- [ ] QR code on every printed page (generated in Step 24)
- [ ] Animations, fact bubbles in AR view
- [ ] Verify: scan QR from printed book, AR experience loads in mobile browser

## Step 25c: Ancillary Products (F-16)
**Risk:** LOW | **Spec ref:** Ch3.16, Ch8.7 (extras endpoints) | **Depends on:** Steps 14, 16

- [ ] Coloring pages generation ($1.99) — Desaturated illustration outlines
- [ ] Sticker sheet ($2.99) — Child's character in various poses
- [ ] Poster of favorite page ($14.99) — High-res single illustration
- [ ] Birthday invitation kit ($4.99) — Themed invitations with character
- [ ] Standalone audiobook ($4.99) — Full narration audio file
- [ ] `GET /books/{id}/extras` — List available ancillary products
- [ ] `POST /books/{id}/extras/generate` — Generate specific product
- [ ] Verify: generate each product type from existing book assets

## Step 25d: Story Remix (F-17)
**Risk:** MEDIUM | **Spec ref:** Ch3.17 | **Depends on:** Steps 13, 14

- [ ] Combine characters from multiple existing books into new crossover story
- [ ] Select characters/worlds from user's book library
- [ ] Story Architect generates crossover narrative
- [ ] Character sheets from original books reused for consistency
- [ ] Verify: select 2+ books, generate remix, characters remain consistent

## Step 25e: Seasonal Story Subscription (F-18)
**Risk:** LOW | **Spec ref:** Ch3.18 | **Depends on:** Steps 13, 23

- [ ] Seasonal content engine: calendar-aware recommendations
- [ ] Hanukkah book (December), Purim book (March), Back to School (September)
- [ ] Book arrives 1 week before event
- [ ] Push notification reminders
- [ ] Filter by user's cultural/holiday preferences
- [ ] `GET /seasonal` endpoint
- [ ] Verify: seasonal recommendations match calendar, notification fires 1 week before

---

## Step 26: Localization & Cultural Sensitivity
**Risk:** MEDIUM | **Spec ref:** Ch15 | **Depends on:** Steps 6, 13

- [ ] Complete translation files: `ar.json`, `ru.json`, `fr.json`, `es.json`
- [ ] RTL for Arabic (in addition to Hebrew)
- [ ] `components/book-creation/CulturalReviewPanel.tsx` — Show cultural warnings, "Keep As Is" / "Change It"
- [ ] Pixel-perfect RTL testing on every page
- [ ] Bilingual book rendering test (side-by-side + sequential layouts)
- [ ] `components/dashboard/SeasonalSuggestion.tsx` — Calendar-aware recommendations
- [ ] Unicode validation for non-Latin/non-Hebrew names
- [ ] Mixed RTL/LTR text handling (`unicode-bidi: embed`)
- [ ] Verify: full RTL experience, bilingual books render correctly

## Step 27: Analytics & Monitoring
**Risk:** MEDIUM | **Spec ref:** Ch12 | **Depends on:** Steps 4, 6

- [ ] Event tracking throughout app (40+ event types from spec 12.5)
- [ ] Implicit signals: time per page, pages reread, illustrations tapped, completion ratio
- [ ] `components/dashboard/ReadingStats.tsx` — Books read, time, questions answered, words tapped
- [ ] `components/reader/ReadingAnalytics.tsx` — Track reading behavior
- [ ] Admin dashboards:
  - [ ] `components/admin/AnalyticsDashboard.tsx` — Conversion funnel, user metrics
  - [ ] `components/admin/QualityDashboard.tsx` — AI quality scores, safety blocks, likeness pass rates
  - [ ] `components/admin/SystemHealth.tsx` — Provider status, GPU queue depth
- [ ] OpenTelemetry distributed tracing across full pipeline
- [ ] Sentry error tracking (frontend + backend)
- [ ] LangSmith/Langfuse for LLM observability
- [ ] Web Vitals collection with performance budget enforcement
- [ ] Daily quality sampling: 10 random books flagged for human review
- [ ] Verify: events captured, dashboards display data, tracing works

## Step 28: Offline-First & Edge
**Risk:** MEDIUM | **Spec ref:** Ch13 | **Depends on:** Steps 6, 11

- [ ] `apps/web/public/sw.js` — Service Worker:
  - Cache static assets on install
  - Cache book data on first read
  - Network-first for API, cache-first for book content
  - Background sync for reading progress
- [ ] `apps/web/lib/offline/service-worker-registration.ts`
- [ ] `apps/web/lib/offline/offline-book-manager.ts` — IndexedDB: illustration blobs, audio, animation data
- [ ] `apps/web/lib/offline/sync-manager.ts` — Sync progress on reconnection
- [ ] `components/shared/ConnectivityIndicator.tsx` — "You're offline" / "Back online! Syncing..."
- [ ] "Download for Offline Reading" button with size estimate + progress
- [ ] Green "Available Offline" badge on downloaded books
- [ ] Edge Middleware: locale detection, currency by geo, rate limiting, bot detection, security headers (CSP, X-Frame-Options, HSTS, X-Content-Type-Options)
- [ ] `apps/web/manifest.json` — PWA manifest
- [ ] Verify: offline reading works, sync on reconnection, PWA installable

## Step 29: Security Hardening
**Risk:** HIGH | **Spec ref:** Ch14 | **Depends on:** Steps 4, 7

- [ ] `apps/api/app/encryption/key_manager.py` — AWS KMS integration, per-user encryption keys
- [ ] `apps/api/app/encryption/crypto_shredding.py` — Delete key = delete all data permanently
- [ ] `apps/api/app/encryption/homomorphic.py` — Qdrant homomorphic encryption for face embeddings
- [ ] Complete audit logging for every operation on children's data
- [ ] Prompt injection defense layer (sanitize user inputs before AI prompts)
- [ ] `components/settings/PrivacyControls.tsx`
- [ ] `components/settings/DataExportButton.tsx` — "Download My Data" in machine-readable format
- [ ] `components/settings/DeleteAccountButton.tsx` — Confirmation modal, crypto shredding, CDN purge, log anonymization
- [ ] Blocked name list for public figures' children
- [ ] Photo verification for high-risk operations
- [ ] Automatic photo deletion after 30 days
- [ ] Automatic face embedding deletion after 12 months inactivity
- [ ] Verify: data export works, account deletion crypto-shreds all data, audit log complete

## Step 30: Testing Suite
**Risk:** MEDIUM | **Spec ref:** Ch18.3 | **Depends on:** All previous steps

### 30.1 E2E Tests (Playwright)
- [ ] `apps/web/tests/e2e/book-creation.spec.ts` — Full wizard flow
- [ ] `apps/web/tests/e2e/reading-experience.spec.ts` — Reader modes
- [ ] `apps/web/tests/e2e/co-creation.spec.ts` — Co-creation flow
- [ ] `apps/web/tests/e2e/marketplace.spec.ts` — Creator + marketplace
- [ ] `apps/web/tests/e2e/classroom.spec.ts` — Classroom flow
- [ ] `apps/web/tests/e2e/gift-flow.spec.ts` — Purchase + redeem
- [ ] `apps/web/tests/e2e/subscription.spec.ts` — Subscribe + manage
- [ ] `apps/web/tests/e2e/accessibility.spec.ts` — Keyboard nav, screen reader
- [ ] `apps/web/tests/e2e/rtl-rendering.spec.ts` — RTL pixel-perfect

### 30.2 Integration Tests
- [ ] `apps/web/tests/integration/api-client.test.ts`
- [ ] `apps/web/tests/integration/auth-flow.test.ts`
- [ ] `apps/web/tests/integration/payment-flow.test.ts`
- [ ] `apps/api/tests/integration/test_orchestrator.py`
- [ ] `apps/api/tests/integration/test_print_pipeline.py`
- [ ] `apps/api/tests/integration/test_payment_flow.py`

### 30.3 Unit Tests
- [ ] `apps/api/tests/unit/test_agents/` — All 15 agents
- [ ] `apps/api/tests/unit/test_quality/` — All 4 gates
- [ ] `apps/api/tests/unit/test_services/` — All 15 services
- [ ] `apps/api/tests/unit/test_encryption/` — Key manager, crypto shredding
- [ ] `apps/web/tests/unit/components/` — Critical components
- [ ] `apps/web/tests/unit/hooks/` — Custom hooks
- [ ] `apps/api/tests/conftest.py` — Shared fixtures

### 30.4 CI Pipelines
- [ ] `.github/workflows/ci.yml` — Lint, type-check, test
- [ ] `.github/workflows/e2e.yml` — Playwright E2E
- [ ] `.github/workflows/prompt-regression.yml` — Prompt test suite
- [ ] `.github/workflows/visual-regression.yml` — Percy/Chromatic
- [ ] `.github/workflows/accessibility-audit.yml` — axe-core
- [ ] `.github/workflows/performance-budget.yml` — Lighthouse CI (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- [ ] `.github/workflows/security-scan.yml` — Dependency audit
- [ ] `.github/workflows/deploy-staging.yml`
- [ ] `.github/workflows/deploy-production.yml`

### 30.5 Verification
- [ ] All tests pass
- [ ] Coverage >= 80%
- [ ] CI green on all pipelines
- [ ] `.github/CODEOWNERS`
- [ ] `.github/pull_request_template.md`

## Step 31: Documentation
**Risk:** LOW | **Spec ref:** Ch18.2 Step 31 | **Depends on:** All previous steps

- [ ] `README.md` — Comprehensive project README
- [ ] `CONTRIBUTING.md` — Contribution guide
- [ ] `docs/architecture.md` — System architecture overview
- [ ] `docs/api-reference.md` — Full API reference (or link to generated OpenAPI)
- [ ] `docs/ai-agents.md` — All 15 agents: purpose, I/O, implementation
- [ ] `docs/quality-pipeline.md` — 4-layer quality control
- [ ] `docs/coppa-compliance.md` — COPPA 2025 + GDPR-K compliance details
- [ ] `docs/deployment.md` — Deployment guide (AWS, RunPod, Temporal)
- [ ] `docs/contributing.md` — How to add new agents, providers, features
- [ ] `docs/testing-strategy.md` — Testing approach + how to run
- [ ] `docs/performance-budget.md` — Performance targets + enforcement
- [ ] `docs/disaster-recovery.md` — DR plan (RPO 1 hour, RTO 4 hours)
- [ ] `docs/cost-model.md` — Per-book costs, margins, infrastructure
- [ ] Architecture Decision Records (12):
  - [ ] `docs/adr/001-langgraph-orchestration.md`
  - [ ] `docs/adr/002-temporal-workflow-engine.md`
  - [ ] `docs/adr/003-python-only-agents.md`
  - [ ] `docs/adr/004-cqrs-over-event-sourcing.md`
  - [ ] `docs/adr/005-webgpu-particle-system.md`
  - [ ] `docs/adr/006-provider-abstraction-layer.md`
  - [ ] `docs/adr/007-face-embedding-coppa.md`
  - [ ] `docs/adr/008-multi-tier-gpu-strategy.md`
  - [ ] `docs/adr/009-openapi-typescript-generation.md`
  - [ ] `docs/adr/010-bff-pattern.md`
  - [ ] `docs/adr/011-subscription-book-cap.md`
  - [ ] `docs/adr/012-character-sheet-pipeline.md`

## Step 32: Mobile Application
**Risk:** HIGH | **Spec ref:** Ch4.2, Ch18.2 Step 32 | **Depends on:** Steps 1-25

- [ ] `apps/mobile/` — React Native + Expo SDK 52+
- [ ] Core screens:
  - [ ] Auth (login, register)
  - [ ] Dashboard
  - [ ] Child profile management
  - [ ] Book creation (simplified wizard)
  - [ ] Book reader (may need native module for performance)
  - [ ] Library / bookshelf
  - [ ] Settings
- [ ] Shared types from `packages/shared-types`
- [ ] Shared utils from `packages/shared-utils`
- [ ] Expo Camera for photo capture
- [ ] Push notifications: book ready, birthday reminders, book of the week
- [ ] Offline reading via AsyncStorage + SQLite
- [ ] Optional native Swift (iOS) / Kotlin (Android) reader module for performance
- [ ] `apps/mobile/eas.json` — EAS build config
- [ ] Verify: runs on iOS and Android simulators

---

# INFRASTRUCTURE (parallel with development)

## Terraform
- [ ] `infrastructure/terraform/main.tf`
- [ ] `infrastructure/terraform/variables.tf`
- [ ] `infrastructure/terraform/outputs.tf`
- [ ] `infrastructure/terraform/state.tf` — S3 backend
- [ ] `infrastructure/terraform/modules/ecs/` — ECS Fargate for API + worker
- [ ] `infrastructure/terraform/modules/rds/` — PostgreSQL / Aurora
- [ ] `infrastructure/terraform/modules/redis/` — ElastiCache
- [ ] `infrastructure/terraform/modules/s3/` — Assets bucket + CloudFront
- [ ] `infrastructure/terraform/modules/cloudfront/` — CDN config
- [ ] `infrastructure/terraform/modules/kms/` — Encryption key management
- [ ] `infrastructure/terraform/modules/monitoring/` — CloudWatch, alarms
- [ ] `infrastructure/terraform/environments/staging/`
- [ ] `infrastructure/terraform/environments/production/`

## Docker
- [ ] `infrastructure/docker/Dockerfile.web` — Next.js production
- [ ] `infrastructure/docker/Dockerfile.api` — FastAPI production
- [ ] `infrastructure/docker/Dockerfile.worker` — Temporal worker
- [ ] `infrastructure/docker/Dockerfile.temporal` — Custom Temporal config

## Temporal
- [ ] `infrastructure/temporal/docker-compose.temporal.yml`
- [ ] `infrastructure/temporal/config/` — Namespace, retention

## Kubernetes (Scale phase)
- [ ] `infrastructure/k8s/base/` — Base manifests
- [ ] `infrastructure/k8s/staging/` — Staging overlays
- [ ] `infrastructure/k8s/production/` — Production overlays

---

# CROSS-CUTTING CONCERNS (enforced throughout)

## Quality Gates (Before every step — spec 18.3)
- [ ] TypeScript strict mode: zero errors
- [ ] Python mypy: zero errors
- [ ] All existing tests pass
- [ ] No ESLint errors (including RTL rule)
- [ ] No accessibility violations (automated)
- [ ] App starts without console errors
- [ ] RTL and LTR both render correctly

## Design System Constraints
- [ ] All CSS uses logical properties (no margin-left, etc.)
- [ ] Zero hardcoded strings (all from i18n)
- [ ] Mobile-first responsive (375px -> 768px -> 1024px -> 1440px)
- [ ] Dark mode support everywhere
- [ ] WCAG 2.1 AA: 4.5:1 contrast, keyboard nav, screen reader, focus management
- [ ] All images have alt text

## Performance Budget (spec 12.1)
- [ ] Page weight: < 500KB (HTML + CSS + JS)
- [ ] Illustration size: < 200KB (WebP/AVIF)
- [ ] Full book load: < 3 seconds
- [ ] FCP: < 1.5s
- [ ] LCP: < 2.5s
- [ ] CLS: < 0.1
- [ ] INP: < 200ms
- [ ] TTI: < 3.5s
- [ ] Animations: 60fps ambient, 30fps minimum complex

## Compliance Deadlines
- [ ] COPPA 2025 Final Rule enforcement: **April 22, 2026** (12 days from today)
  - Face embeddings = biometric identifiers
  - Verifiable parental consent with biometric disclosure
  - Minimum data retention
  - Right to deletion

---

# STATS SUMMARY

| Category | Count |
|----------|-------|
| Total steps | 36 (32 + 4 Phase 4 features) |
| Total sub-tasks | ~570 |
| API endpoints | 76 |
| Database tables | 23 |
| Frontend components | 130+ |
| AI agents | 15 |
| Quality gates | 4 |
| Prompt templates | 11 |
| Translation files | 6 languages |
| CI/CD pipelines | 9 |
| ADR documents | 12 |
| Illustration styles | 10 |
| Voice presets | 20+ |
| Sound effects | 30 |
| Particle presets | 6 |
| Seed templates | 12 |
