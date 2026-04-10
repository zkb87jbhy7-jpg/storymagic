

# StoryMagic — Enterprise-Grade Architecture & Implementation Document

## Complete Blueprint for Production Development with Claude-Code

---

# PART I — STRATEGIC FOUNDATION

---

## Chapter 1 — Executive Vision & Product DNA

### 1.1 What StoryMagic Is

StoryMagic is an AI-powered platform that creates fully personalized children's books where the child is the hero. Unlike every competitor in the market that substitutes a name into a pre-written template, StoryMagic dynamically generates every element of the book from scratch: the narrative, the illustrations featuring the child's actual likeness, the vocal narration, and the interactive digital reading experience. Every single book produced by the platform is unique — written, illustrated, and performed by a coordinated ensemble of specialized AI agents.

The platform serves parents of children aged 2–10, primarily in Israel (Hebrew-first) and English-speaking markets. Secondary audiences include grandparents purchasing gifts, educators creating classroom stories, and content creators building and selling story templates.

### 1.2 Core Differentiators That No Competitor Offers

The competitive landscape reveals a fundamental gap. MeBook.ai relies on template injection with pre-written stories and suffers from AI illustration anomalies. Wonderbly and Hooray Heroes offer name substitution or generic avatar builders. Once Upon a Memory comes closest but lacks voice narration, mobile apps, subscriptions, and interactive experiences.

StoryMagic closes every one of these gaps simultaneously. The platform provides dynamic story generation from free-form prompts with real Hebrew rhyming, AI illustrations where the character actually resembles the child through face embedding technology, Performance Markup voice narration where different characters speak with different emotions and pacing, an interactive digital reader with animations and tappable elements, a co-creation mode where parent and child build the story together using voice, a Reading Buddy AI companion that asks age-appropriate questions during reading, Living Books that grow with the child over years, voice cloning that lets the book be read in a parent's or grandparent's voice, full RTL and bilingual support with cultural adaptation rather than mechanical translation, and a creator marketplace where anyone can build and sell story templates.

### 1.3 Core Values Encoded Into Architecture

Every architectural decision flows from five non-negotiable values.

**Child Safety Above All.** COPPA 2025 Final Rule (enforcement deadline April 22, 2026) now classifies face templates and faceprints as biometric identifiers requiring explicit verifiable parental consent. GDPR-K compliance with Crypto Shredding ensures that deleting a user's encryption key renders all their data permanently unreadable. Zero-tolerance content safety filtering runs on every AI output before it reaches any screen.

**Inclusion and Accessibility.** The platform supports neuro-diverse children (dyslexia mode, ADHD mode, autism spectrum mode), physical disabilities represented naturally in illustrations, diverse family structures (single parents, same-sex parents, grandparent caregivers, foster families, blended families), and full WCAG 2.1 AA compliance with keyboard navigation, screen reader support, and focus management.

**Cultural Sensitivity.** Content adapts to cultural context — dietary restrictions, modesty preferences, holiday relevance, and stereotype avoidance. Bilingual books receive cultural adaptation rather than mechanical translation.

**Uncompromising Quality.** Every AI-generated artifact passes through four quality gates: Safety Gate, Technical Quality Gate, Consistency Gate, and Likeness Gate. No content reaches the user without scoring above threshold on all four.

**Privacy as Architecture.** End-to-end encryption of children's photos with AES-256, face embeddings stored with homomorphic encryption in a separate vector database, automatic photo deletion after 30 days, face embedding deletion after 12 months of inactivity, and complete audit logging of every operation touching children's data.

---

## Chapter 2 — Competitive Analysis Deep Dive

### 2.1 Competitor Weaknesses Matrix

**MeBook.ai** uses template injection where stories are pre-written with name placeholders. Their AI illustrations exhibit anomalies including extra fingers, inconsistent hair color across pages, and facial distortion at certain angles. They have no native mobile application, no voice narration capability, no interactive digital experience, and their Hebrew rhyming is hand-written by humans because their AI cannot rhyme in Hebrew. Users cannot edit illustrations. There is no subscription model. The platform runs on WordPress with WooCommerce, which creates fundamental scalability limitations.

**Wonderbly** offers name substitution only within fixed templates. There is zero visual resemblance to the actual child. Customization does not extend beyond the child's name.

**Hooray Heroes** builds a generic avatar from a selection menu of hair styles, eye shapes, and skin tones. The result looks generic and impersonal — it is not generated from the child's actual photograph.

**Once Upon a Memory** comes closest to StoryMagic's vision but lacks free-form story creation, voice narration, a mobile application, subscription models, and interactive reading experiences.

### 2.2 Capability Gaps Across All Competitors

No competitor in the market offers any of the following: AI voice narration with Performance Markup controlling tone, emotion, and pacing per sentence; parent voice cloning from a 30-second recording; family voice library where grandparents, aunts, and uncles can each record their voice; interactive reading with page animations and tappable elements; free-form prompt story generation; AI recommendation engine for next books; full RTL support with real Hebrew rhyming; multiple children as characters in the same book; bilingual books with cultural adaptation; co-creation mode with voice UI; Reading Buddy AI companion; Living Books that grow with the child; Classroom Edition for schools; or a creator marketplace with revenue sharing.

---

## Chapter 3 — Complete Feature Specification

### 3.1 Feature F-01: Free-Form Story Generation

The user describes a story topic in natural language. For example: "A book about Mika who flew to the moon with a magical cat and learned about courage." The system generates a complete story of 8 to 24 pages with plot structure, dialogue, a full dramatic arc (introduction, rising action, climax, falling action, resolution), and an educational message.

Optional Hebrew rhyming uses a dedicated rhyming module containing a dictionary of 200+ Hebrew rhyme pairs organized by ending sound, with metric validation. When rhyming is requested, the AI attempts to end alternating lines with rhyming words from the dictionary. If rhyming validation fails after two retry attempts with specific feedback, the system falls back to elegant prose and marks the book accordingly.

The user can edit any sentence, add or remove pages, change the writing style, adjust the emotional tone, and request changes in natural language such as "make the story funnier" or "add a hug at the end." Hundreds of pre-built templates are available organized by category: adventure, friendship, learning, bedtime, holidays, emotions, life transitions, and seasonal themes.

### 3.2 Feature F-02: Personalized AI Illustrations

The user uploads one to five photographs of the child. More photographs produce better likeness. The system generates a face embedding and creates a consistent character representation across every page of the book.

Ten or more illustration styles are available: Watercolor with soft edges and visible brush strokes, Comic Book with bold outlines and dynamic angles, 3D Pixar-style with subsurface scattering and volumetric lighting, Retro Vintage with muted earth tones and halftone textures, Minimalist with clean lines and negative space, Oil Painting with rich depth and chiaroscuro lighting, Fantasy with ethereal glow and magical particles, Manga with large eyes and speed lines, Classic Storybook with warm watercolors and golden hour lighting, and Whimsical with exaggerated proportions and swirling patterns.

Each style functions as a complete Illustrator Persona with not just graphical parameters but composition rules, emotional expression guidelines, and a unique visual DNA. The style adapts to the emotional tone of each scene: happy scenes receive bright warm colors with rounded forms, scary scenes receive darker tones with deeper shadows, and bedtime scenes receive warm soft palettes with gentle lighting.

Up to four children or characters can appear in the same book for siblings and friends. A built-in illustration editor allows the user to request specific changes through natural chat, such as "change the background to a forest" or "add a red hat." An automatic QA mechanism detects anomalies including extra fingers, facial distortions, and cross-page inconsistencies, then either auto-corrects through targeted inpainting or regenerates the specific illustration.

A Character Sheet Pipeline runs before book illustration begins, generating four views of the character (front, profile, three-quarter, back) in the chosen illustration style. This character sheet serves as the reference image for every subsequent illustration, ensuring consistency across the entire book.

### 3.3 Feature F-03: AI Voice Narration with Performance Markup

The book is narrated by an AI voice selected from 20+ options across genders, ages, and styles — warm female narrator, deep gentle grandfather, energetic child, adventurous captain. Support for 10+ languages includes polished Hebrew with correct pronunciation and intonation.

"Parent Voice" mode allows a parent to record 30 seconds of reading, from which the system creates an AI voice clone that reads the entire book. Family Voice Library lets every family member record their voice — grandmother, grandfather, uncle, aunt — and the child chooses who reads to them.

Unlike flat text-to-speech, the system uses Performance Markup that annotates every text segment with metadata specifying who is speaking (narrator or specific character), the emotion (happy, scared, whispering, shouting, singing, brave, gentle), the pacing (slow, normal, fast), dramatic pauses before and after key moments, emphasized words, and scene-appropriate sound effects from a library of 30 effects mapped to narrative keywords.

### 3.4 Feature F-04: Interactive Digital Experience

The digital book is a full interactive experience rather than a static PDF. Each page displays scene-appropriate ambient animations from six presets: falling leaves, twinkling stars, floating bubbles, gentle rain, snowfall, and fireflies. Interactive elements on every page let children tap objects to discover fun facts, and small search-and-find games are embedded within scenes.

Karaoke Mode highlights words in real time with a bouncing pointer that moves from word to word as the narration plays. Night Mode automatically activates between 7 PM and 7 AM, switching to dimmed colors, slower pacing, and calming background music.

At the end of each book, a celebration sequence plays with confetti animation, one interactive quiz question about the story, and the book is saved to the child's personal bookshelf.

### 3.5 Feature F-05: Subscription and Recommendation System

The Free Tier provides one digital book with watermark, one illustration style, and no voice narration. Pay-Per-Book pricing offers a digital book at $9.99, softcover at $24.99, hardcover at $34.99, and hardcover with gift packaging at $44.99.

Monthly Subscription at $14.99 per month includes two digital books, all illustration styles, voice narration, 20% discount on printing, and Reading Buddy access. Yearly Subscription at $119.99 per year (with a cap of 24 books to maintain margin) includes all digital features, three free prints per year, voice cloning, full interactive experience, early access to new features, and priority generation queue.

The AI recommendation engine suggests new book topics based on the child's age, previous books, relevant life transitions, and a seasonal calendar. A "Book of the Week" feature delivers a personalized recommendation every week.

### 3.6 Feature F-06: Creator Marketplace

Creators write storylines, define scenes with placeholders for child name, pronouns, and age, and publish to the marketplace. The revenue model is 70% to the creator and 30% to the platform. Creator analytics provide sales figures, reviews, and demographic data. Automated content moderation runs before publication with safety checks, age-appropriateness validation, and placeholder usage verification. Human review queue handles edge cases.

### 3.7 Feature F-07: Print and Delivery

Integration with Lulu Print API as the primary provider with Peecho and Blurb as fallback creates a global print network that does not depend on a single printer. Print options include hardcover, softcover, square format (8.5" × 8.5"), and A4 format. Premium gift packaging includes a printed dedication with an option to upload a handwritten dedication. Real-time shipping tracking is provided. Local print providers serve Israel, USA, Europe, and Asia. Print-ready PDF includes CMYK color profile, 3mm bleed, crop marks, and spine width calculated from page count.

### 3.8 Feature F-08: Child Safety and Privacy

Full compliance with COPPA 2025 Final Rule and GDPR-K. The COPPA 2025 Final Rule (enforcement beginning April 22, 2026) explicitly classifies face templates and faceprints as biometric identifiers that constitute "personal information." This means StoryMagic's face embeddings require specific verifiable parental consent for biometric data collection (not just a general checkbox), minimum necessary data retention, and the right to deletion at any time.

Children's photos are encrypted with AES-256 end-to-end encryption. Face embeddings are stored separately from original photos with homomorphic encryption enabling search and comparison without decryption. Original photos are automatically deleted after 30 days. Face embeddings are automatically deleted after 12 months of account inactivity. Verifiable Parental Consent with specific biometric data disclosure is required before any face processing. Content Safety Filter runs on every generated story and illustration with zero-tolerance for unsafe content. Transparent and accessible privacy policy is provided in clear language. Crypto Shredding for GDPR "Right to be Forgotten" encrypts all user data with a unique key, and deletion means deleting the key rendering all events permanently unreadable. Complete audit log records every operation involving children's data.

### 3.9 Feature F-09: Co-Creation Mode

A collaborative creation mode where parent and child sit together and build the story. An animated guide character named Sparky (a small glowing star with eyes and a smile) leads the process. Sparky asks the child questions using voice synthesis, the child responds with their own voice or by tapping illustrated choice cards. At every step the child can say "I want there to be a dog!" and the system adapts. The interface is large and colorful, optimized for small fingers. Full fallback ensures every voice step also supports tap and type input. At the end, a "Behind the Story" page displays the child's choices and their creative journey.

### 3.10 Feature F-10: Reading Buddy AI

A small AI character (a wise owl with glasses) appears in the corner of the screen during reading and reacts to the story. Questions are adapted by age: ages 2–4 receive pointing and counting questions, ages 5–7 receive prediction and emotion questions, ages 8–10 receive analytical questions and connections to personal life. The buddy responds to taps with positive encouragement from a pool of 20 messages. It can be disabled in reader settings.

### 3.11 Feature F-11: Dream Journal

The child tells a dream by voice or text, and the system saves it in a personal dream journal with emotional classification. Every dream can be turned into an illustrated book using a unique Dreamscape illustration style. After 10 dreams, the system offers to create a "Book of Dreams" — an illustrated anthology.

### 3.12 Feature F-12: Living Book

A book that grows with the child over time. On every birthday, the parent receives a reminder to add a new chapter. The parent can also add chapters manually at any time. The book displays a timeline of all chapters. It can be printed as a complete book including all chapters in chronological order. Living Books receive a special golden badge in the library.

### 3.13 Feature F-13: Gift Cards

Digital gift cards allow purchasing a book creation experience as a gift. Three options: digital book ($9.99), printed book ($34.99), and StoryMagic experience ($49.99 for three digital plus one printed). Personal gift message and scheduled delivery. The recipient opens the gift with an unwrapping animation and creates their own book with the gift credit.

### 3.14 Feature F-14: Classroom Edition

A version for kindergartens and schools. Teacher creates a book for the whole class where each child is a character (with parental consent). Dedicated templates include "Our First Day," "The Class Trip," "Our Friendship Story," and "End of Year Memories." "Student of the Week" generates a short book celebrating a different student each week. B2B pricing: free tier (one classroom book per semester, up to 25 students), school tier ($49/month), district tier (custom pricing).

### 3.15 Feature F-15: Augmented Reality

Every page in the printed book includes a small QR code. Scanning with a phone launches a web-based AR experience (no app required) where characters "come alive" from the book with animations, fact bubbles, and the ability to capture photos or videos of the AR experience.

### 3.16 Feature F-16: Ancillary Products

Products generated automatically from book assets: coloring pages ($1.99), sticker sheet with the child's character ($2.99), poster of a favorite page ($14.99), birthday invitation kit ($4.99), and standalone audiobook ($4.99).

### 3.17 Feature F-17: Story Remix

A child who has created multiple books can combine characters and worlds from existing books into a new crossover story.

### 3.18 Feature F-18: Seasonal Story Subscription

Seasonally adapted content: a Hanukkah book in December, a Purim book in March, a "Back to School" book in September. The book arrives one week before the event.

---

# PART II — SYSTEM ARCHITECTURE

---

## Chapter 4 — Technology Stack

### 4.1 Frontend: Web Application

The primary framework is Next.js 15 with App Router and TypeScript in strict mode. React Server Components (RSC) are used for all static and semi-static pages including the landing page, marketplace browse, book detail, and pricing. Client-side rendering is reserved for highly interactive pages: Book Creation Wizard, Interactive Reader, and Co-Creation Mode.

Styling uses Tailwind CSS with shadcn/ui as the component library. All CSS uses logical properties exclusively — `margin-inline-start` instead of `margin-left`, `padding-inline-end` instead of `padding-right`, `text-start` instead of `text-left`. Physical direction properties (left, right) are banned via ESLint rule.

UI animations (page transitions, wizard steps, modals) use Framer Motion. Book animations (particles, ambient effects) use Three.js with WebGPU renderer for particle systems (falling leaves, twinkling stars, floating bubbles), with automatic fallback to Canvas API for browsers without WebGPU support. As of November 2025, WebGPU ships by default in Chrome, Firefox, Safari, and Edge, providing 15–30x performance improvement over WebGL/Canvas for particle animations.

The application is a Progressive Web App (PWA) installable on mobile. Interactive book rendering uses a custom Canvas-based renderer. Voice and audio use Web Audio API and Web Speech API. Localization uses next-intl with zero hardcoded strings.

### 4.2 Frontend: Mobile Application

React Native with Expo (SDK 52+) for native iOS and Android applications. Maximum code sharing with the web version through shared packages. Expo Camera for direct photo capture. Offline book reading via AsyncStorage and SQLite. Push notifications for "Book of the Week," birthday reminders, and generation completion alerts.

If the Interactive Reader exhibits performance issues on React Native, a native module in Swift (iOS) and Kotlin (Android) is built specifically for the reader component, while the rest of the application remains React Native.

### 4.3 Backend: API Server

Python 3.12 with FastAPI serves as the single source of truth for all business logic, AI orchestration, and data management. The Next.js API Routes function as a Backend-for-Frontend (BFF) layer that proxies requests to FastAPI, manages browser sessions, and provides Server-Sent Events (SSE) streams for real-time progress updates. This eliminates the dual-implementation problem where AI agents would otherwise be coded in both TypeScript and Python.

PostgreSQL 16 through Supabase serves as the primary database for the MVP phase, with a planned migration path to Aurora Serverless v2 or Neon for the scale phase. Only Supabase's PostgreSQL is used — Supabase Auth, Storage, and Realtime are not used to avoid vendor lock-in. Authentication is handled by a custom implementation. Redis handles caching and session management.

Temporal.io serves as the workflow orchestrator from Day 1, replacing the original Celery + Redis approach. Temporal provides durable execution for the book generation pipeline that involves 11+ agents and takes 5–10 minutes, automatic retry with configurable backoff at each workflow step, built-in checkpointing so that a workflow interrupted at step 7 resumes from step 7 rather than restarting, complete observability with Temporal Web UI showing every workflow execution, and replay capability for debugging production issues. WebSocket through FastAPI plus SSE as a lightweight alternative provide real-time progress updates.

### 4.4 Backend: AI Microservices

All AI agents run exclusively in the Python backend. The Next.js frontend never calls AI providers directly.

**Service S-01: Story Generation Service.** Claude API (Anthropic) as the primary LLM, Gemini API as secondary, GPT-4o as tertiary. Advanced prompt engineering with system prompts purpose-built for children's books, managed through a Prompt Versioning system. Chain-of-thought processing: first Story Architect builds structure, then Hebrew Poet writes literary text, then Age Adaptation adjusts vocabulary, then Quality Critic validates. A dedicated Hebrew rhyming module contains 200+ rhyme pairs with metric validation. Fallback: if rhyming fails after two attempts, the system switches to elegant prose.

**Service S-02: Face Processing Service.** InsightFace/ArcFace for creating face embeddings. Accepts one to five photos and creates an averaged embedding. Face quality assessment runs client-side with TensorFlow.js (BlazeFace) for immediate feedback and privacy preservation. The embedding is stored encrypted in Qdrant vector database with homomorphic encryption.

**Service S-03: Image Generation Service.** ComfyUI orchestrates the illustration generation pipeline. The base model is Flux Kontext for built-in character consistency, with PuLID for FaceID integration. ControlNet provides pose and composition control. Style LoRAs are trained for each illustration style.

A Character Sheet Pipeline generates four views of the character (front, profile, three-quarter, back) in the chosen style before any book illustrations begin. This character sheet serves as reference for every subsequent illustration.

Post-processing pipeline includes a Hand/Finger Fixer (dedicated model for hand correction), Face Consistency Checker (cross-page face embedding comparison), Illustration Repair Agent (targeted inpainting for localized anomalies rather than full regeneration), Upscaler (Real-ESRGAN for 300 DPI print quality), and Color Profile Conversion (sRGB to CMYK for print).

Deployment runs on RunPod Serverless GPUs with multi-tier strategy: Tier 1 (A100/H100) for cover and first page with maximum quality and batch of three variants, Tier 2 (A10G/L4) for regular pages at good quality and one-third the cost, Tier 3 (T4) for thumbnails, previews, and coloring pages at lowest cost.

Adaptive pipeline: simple scenes (one character, simple background) get a fast pipeline, complex scenes (multiple characters, action) get a full pipeline, and critical scenes (cover, first page) get a double pipeline with three variants and automatic selection of the best.

**Service S-04: Voice Generation Service.** ElevenLabs API for high-quality voice narration with Cartesia as a low-latency alternative for real-time co-creation interactions and Fish Audio as an open-source fallback. Library of 20+ preset voices across languages. Voice cloning from 30-second parent recording. SSML with Performance Markup for pacing, pauses, emphasis, and emotions. Sound effects generation for scene-appropriate audio.

**Service S-05: Book Assembly Service.** pdf-lib (WASM, runs in browser or server) for assembling print-ready PDF. Print specifications: CMYK, 3mm bleed, crop marks, spine width calculated from page count. Interactive digital book in JSON format with animation and interaction data. Thumbnail and preview image generation. QR code generation for AR pages.

### 4.5 AI Provider Abstraction Layer

Every AI integration is wrapped in a unified plugin interface so that providers can be swapped without touching business logic. The interface defines four capability types: TextGenerationProvider, ImageGenerationProvider, VoiceGenerationProvider, and FaceProcessingProvider.

Each provider is implemented as an independent plugin. A ProviderRegistry manages all plugins and returns the best available provider based on health check status, cost, speed, and historical quality score. A built-in circuit breaker marks a provider as unhealthy after three failures within five minutes, pauses for two minutes, then retries. An AIRouter selects the provider, executes with timeout, and automatically falls over to the next provider on failure. A/B testing support routes configurable percentages of requests to different providers via experiment IDs.

### 4.6 Prompt Versioning and Regression Testing

Every system prompt is managed like code with version number, automated testing, and rollback capability. Each prompt is stored with status (draft, testing, active, retired) and test results. An automated test suite runs each prompt against 50+ test cases checking: does the story contain the child's name, is it age-appropriate, is the content safe, does it include an educational message, does the rhyming work if requested, are pronouns consistent, is the emotional arc complete.

When an LLM updates or someone modifies a prompt, the test suite runs automatically. If regression is detected, an alert fires and automatic rollback occurs. When a new prompt version passes regression tests, it is rolled out to 10% of users with measurement of acceptance rate (how many parents approve without editing), editing rate (how many changes the parent makes), and purchase rate (how many buy prints).

### 4.7 Infrastructure and DevOps

**Cloud Provider:** AWS as primary. ECS Fargate or EKS for backend services. S3 plus CloudFront for static assets, images, and PDFs with global CDN. RDS PostgreSQL / Aurora Serverless for the scale phase. ElastiCache Redis. SQS as backup queue.

**GPU Computing:** RunPod Serverless with ComfyUI workers for illustration generation. Auto-scaling from zero to N instances based on queue depth. Cold start optimization with a warm pool of 2–3 instances. Predictive scaling: if 10 users are at wizard step 3, approximately 5 will reach step 5 (illustration generation) in 2 minutes, so instances are pre-warmed. Fallback GPU providers: Modal, Replicate, fal.ai.

**Edge:** Next.js Edge Middleware for locale detection, currency determination by geography, rate limiting (60 requests per minute for API, 10 per minute for AI generation, 20 per minute for auth), bot detection, and security headers (CSP, X-Frame-Options, X-Content-Type-Options). Cloudflare Workers or Vercel Edge Functions for routes that do not require GPU such as auth, payments, book metadata, and reading progress.

**CI/CD:** GitHub Actions for continuous integration. Terraform for Infrastructure as Code. Docker containers for every service. Staging to production promotion with manual approval gate. Feature Flags through LaunchDarkly or Unleash for gradual rollout of new features and AI models.

**Monitoring and Observability:** OpenTelemetry with Jaeger/Tempo for distributed tracing across the entire book generation pipeline (11 agents, 3+ external APIs, 2+ databases). Datadog or Grafana for metrics. Sentry for error tracking. Custom dashboard for AI quality metrics. Web Vitals collection with performance budget enforcement. LangSmith or Langfuse for LLM-specific observability including token usage, latency, quality scores, and prompt version performance.

**Payments and Billing:** Stripe for all payments (one-time and subscriptions). Stripe Connect for creator payouts. Regional pricing (ILS, USD, EUR). Apple/Google In-App Purchase for mobile subscriptions. Stripe Customer Portal for subscription management.

**Disaster Recovery:** Multi-region database replication with RPO of 1 hour and RTO of 4 hours. S3 cross-region replication for all assets. Provider failover for every external dependency. Weekly automated disaster recovery drills in staging.

---

## Chapter 5 — Multi-Agent AI System

### 5.1 Architecture Decision: LangGraph as Orchestration Framework

Rather than building a custom orchestrator with AsyncGenerator, the system uses LangGraph as the agent orchestration framework. LangGraph provides a visual state graph where each node is an agent and edges define transition conditions including retry loops. Built-in persistence and checkpointing work seamlessly with Temporal.io for durable execution. Human-in-the-loop support enables the editorial review flow where a parent can intervene between generation steps. Streaming is native rather than bolted on. LangSmith integration provides complete observability. The entire book generation pipeline is defined as a LangGraph state machine, with Temporal.io providing the durable execution layer underneath.

### 5.2 Agent A-01: Story Architect Agent

**Purpose:** Creates the structural skeleton of the story.

**Input:** Child name, age, gender, free-form prompt or template ID, language, whether rhyming is requested, page count, mood setting.

**Output:** StoryBlueprint — a structured document containing title, subtitle, central theme, moral/educational message, emotional arc (mapping page ranges to emotions: joy, curiosity, tension, mild fear, courage, triumph, warmth), and an array of scenes. Each scene includes page number, environment description, action description, dialogues (speaker and text), dominant emotion, narrative role (introduction, rising action, climax, falling action, resolution), and a brief illustration hint.

**Implementation:** Uses PromptManager to load the active "story-architect-system" prompt. Substitutes variables (name, age, gender, topic, mood, page count). Calls AIRouter.generateText() with structured output enforcement via JSON Schema (Pydantic model). Validates that scene count matches requested page count, all required fields are present, and the narrative arc includes all five structural roles. Uses Structured Outputs (response_format) to guarantee valid JSON, eliminating parsing failures and retry-on-format-error loops.

### 5.3 Agent A-02: Hebrew Poet Agent

**Purpose:** Transforms blueprint scenes into polished literary text in Hebrew or English.

**Input:** StoryBlueprint, language, whether rhyming is requested.

**Output:** Array of page objects with text content and reading level indicator.

**Implementation:** Uses the "hebrew-poet-system" prompt. When Hebrew rhyming is requested, a RAG approach retrieves the 20 most relevant rhyme pairs from the Hebrew rhyme dictionary based on the story's topic, rather than injecting the entire 200+ pair dictionary as context. This saves tokens and improves quality by focusing on thematically appropriate rhymes. The AI is instructed to end alternating lines with rhyming words from the retrieved set.

Post-generation rhyme validation compares final words against the dictionary. If validation fails, a retry is issued with specific feedback ("lines 3 and 4 do not rhyme, the last word of line 3 is X, please find a rhyme") — up to two retries. If still failing, the system switches to elegant prose with the flag isRhyming set to false.

Text length per page is validated against age-appropriate ranges: 50–150 words for ages 3–5, 100–250 words for ages 6–10. Consistency of child name and correct pronoun usage is verified throughout.

### 5.4 Agent A-03: Age Adaptation Agent

**Purpose:** Adapts text to the specific age and reading level of the child.

**Input:** Page texts, child age, reading preferences.

**Output:** Adapted text with Lexile score.

**Implementation:** Adapts by age group. Ages 2–3 receive sentences of at most 6 words, only concrete nouns, frequent repetition, and onomatopoeia. Ages 4–5 receive sentences of 10 words, simple adjectives, basic emotions, and dialogue. Ages 6–7 receive sentences of 15 words, complex sentences, richer vocabulary, and first metaphors. Ages 8–10 receive full literary quality, complex emotions, subtle humor, and multi-layered meaning.

If reading preferences include simplified language, the level shifts one notch down. If preferences include dyslexia-friendly mode, sentences become shorter, only common words are used, and confusing homophones are avoided.

### 5.5 Agent A-04: Art Director Agent

**Purpose:** Creates detailed prompts for illustration generation for every page.

**Input:** Scene description, illustration style, child description, emotional tone, previous page prompts (for consistency).

**Output:** Detailed image prompt, negative prompt, composition notes, color palette, camera angle.

**Implementation:** Uses the "art-director-system" prompt. Each illustration style carries detailed visual directives: Watercolor receives "soft edges, visible brush strokes, muted color bleeding, paper texture, gentle lighting." Comic Book receives "bold outlines, flat colors, dynamic angles, action lines, speech bubbles." 3D Pixar receives "subsurface scattering on skin, rounded features, large expressive eyes, volumetric lighting." And so on with five or more unique visual keywords per style.

Emotional tone influences visual choices: joy brings warm colors, high saturation, upward compositions, and golden lighting; tension brings cooler colors, diagonal compositions, and dramatic shadows; calm brings pastel colors, horizontal compositions, and soft diffused lighting.

The agent references previous page prompts to maintain environment continuity. The character sheet (generated in the Character Sheet Pipeline) is referenced in every prompt to ensure character consistency. Negative prompt always includes "extra fingers, malformed hands, blurry face, inconsistent character design, text, watermark, adult content."

### 5.6 Agent A-05: Emotional Tone Agent

**Purpose:** Analyzes and calibrates the emotional arc across the entire book.

**Input:** All page texts, target emotional arc from the blueprint.

**Output:** Emotional analysis per page (detected emotion, intensity 0–10, alignment with target), recommendations for specific pages that deviate.

**Implementation:** Analyzes each page for emotional keywords and sentence structure. Maps detected emotion against target arc. If a page deviates too far, provides specific rewriting recommendation. Enforces safety constraints: fear intensity never exceeds 4 for ages 2–5 or 6 for ages 6–10. Enforces emotional resolution: the final two pages must register warmth or joy at intensity 7 or above.

### 5.7 Agent A-06: Illustration Layout Agent

**Purpose:** Determines optimal layout of text and illustration on each page.

**Input:** Page number, text length, scene complexity, whether page is a spread.

**Output:** Layout type (full illustration with text overlay, top illustration with bottom text, side-by-side illustration and text, full spread, text-only with decorative border), text position, illustration area, and safe zones.

**Implementation:** Fixed rules: opening page always uses full illustration with text overlay, climax page always uses full spread if page count allows, dialogue pages use side-by-side (flipped for RTL), short-text pages use full illustration with overlay. Safe zones account for 3mm bleed for print, gutter margins near the spine, and trim area. For RTL layouts: illustration on the right, text on the left (reversed from LTR).

### 5.8 Agent A-07: Quality Critic Agent

**Purpose:** Evaluates every artifact produced by other agents.

**Input:** Content type (story, illustration prompt, or voice script), the content itself, child age, language.

**Output:** Overall score 0–100, pass/fail (threshold 75), list of issues with severity (critical, major, minor), category, description, and recommendation.

**Implementation:** Checks content safety, age appropriateness, narrative coherence, child name consistency, pronoun consistency, and cultural sensitivity. Uses LLM-as-Judge pattern: sends the output to a different LLM than the one that generated it (Claude evaluates GPT output, or vice versa) with a defined rubric. Critical issues (score equals zero): any safety violation triggers mandatory regeneration. Major issues (score decremented by 20): plot holes, age mismatch. Minor issues (score decremented by 5): word choice improvements.

### 5.9 Agent A-08: Consistency Guardian Agent

**Purpose:** Ensures consistency across all pages of the book.

**Input:** All pages, illustration prompts, child description.

**Output:** Consistency score 0–100, list of issues with involved pages and suggested fixes.

**Implementation:** Compares character descriptions across all illustration prompts (hair color, clothing, accessories). Checks environment continuity — scene changes need narrative transitions. Checks temporal consistency — if the story mentions morning on page 3, it should not be night on page 4 without explanation. Tracks accessory persistence — if a character picks up an object, it should appear in subsequent illustrations. Validates emotional progression — emotions should flow naturally without sharp jumps.

Additionally performs Multi-Reference Consistency Check: after all illustrations are generated, compares face embeddings not only against the original child photo but against every other illustration — ensuring the character is consistent with itself across the entire book.

### 5.10 Agent A-09: Parental Guidance Agent

**Purpose:** Generates an automatic parent guide for each book.

**Input:** StoryBlueprint, final text.

**Output:** ParentalGuide containing a three-sentence summary, educational value description, five discussion questions, three related activities with required materials, and emotional notes highlighting potentially sensitive moments.

### 5.11 Agent A-10: Cultural Sensitivity Agent

**Purpose:** Checks every story and illustration against cultural and religious norms.

**Input:** Story text, illustration prompts, child's cultural preferences.

**Output:** Approval status, cultural warnings, suggestions.

**Implementation:** Checks food references against dietary restrictions (kosher, halal, vegetarian). Checks clothing against modesty requirements. Validates holiday appropriateness (no Christmas for Jewish children, no Hanukkah for Muslim children). Validates family structure references (no "mom and dad" for single-parent families). Validates gender pronoun usage. Prevents stereotypes. Does not block — presents warnings to the parent with options to "keep as is" or "change it."

### 5.12 Agent A-11: Bilingual Adaptation Agent

**Purpose:** Adapts a story to a second language — not mechanical translation but cultural adaptation.

**Input:** Page texts in primary language, primary language, secondary language, child age.

**Output:** Adapted text in secondary language, adaptation notes.

**Implementation:** Food names, places, and customs are adapted to the target culture (for example "sabich" in Hebrew becomes "sandwich" in English). Idiomatic expressions are replaced with cultural equivalents. Humor is adapted. Validates: same narrative meaning is preserved, vocabulary is age-appropriate in the target language, names and nicknames are consistent.

### 5.13 Agent A-12: Accessibility Adaptation Agent

**Purpose:** Adapts all content to specific accessibility needs.

**Input:** Final text, accessibility preferences (dyslexia, ADHD, autism spectrum, visual impairment).

**Output:** Adapted text, detailed alt text for every illustration, TTS guidance (adapted pacing), animation guidance (reduced motion where needed).

**Implementation:** For autism spectrum: rewrites metaphors into concrete language, removes idioms and sarcasm, ensures cause-and-effect is explicit. For dyslexia: replaces complex words with simpler equivalents, shortens sentences, avoids confusing homophones. For ADHD: splits long paragraphs, ensures an interactive element on every page, adds encouragement messages every three pages. For visual impairment: generates rich descriptive alt text for each illustration that captures not just what is shown but the emotional tone and narrative significance.

### 5.14 Agent A-13: Narration Director Agent

**Purpose:** Produces Performance Markup at the level of an artistic director.

**Input:** Final text, book style, character profiles.

**Output:** Complete Performance Markup with timing, emotions, and sound effects.

**Implementation:** Goes beyond the rule-based PerformanceMarkupGenerator. Uses AI to understand context — "he whispered" is not always a gentle whisper; it might be a tense, frightened whisper. Matches sound effects to narrative moments with timing precision. Assigns distinct vocal characteristics to each character that remain consistent throughout the book. Marks dramatic pauses, crescendos, and decrescendos in the narration.

### 5.15 Agent A-14: Illustration Repair Agent

**Purpose:** Fixes anomalies in illustrations without full regeneration.

**Input:** Illustration with identified problem (extra fingers, facial distortion, background inconsistency).

**Output:** Repaired illustration.

**Implementation:** Uses targeted inpainting to fix only the problematic region. Identifies the bounding box of the anomaly, masks it, and regenerates just that area using the same style and character reference. This is five times faster and significantly cheaper than full regeneration. Handles: hand/finger anomalies, minor facial inconsistencies, background artifacts, and color bleeding between elements.

### 5.16 Agent A-15: Recommendation Agent

**Purpose:** Generates personalized book recommendations.

**Input:** Child profile, previous books, current season, upcoming life events.

**Output:** Five ranked recommendations with explanations.

**Implementation:** Combines collaborative filtering (similar children liked these topics), content-based filtering (based on themes the child has enjoyed), and contextual signals (upcoming birthday, starting school, new sibling, seasonal holidays). Respects cultural preferences — only recommends holiday-appropriate content. Generates a natural-language explanation for each recommendation that speaks to the parent.

### 5.17 Orchestrator: BookGenerationOrchestrator

The orchestrator is implemented as a LangGraph state graph running on top of Temporal.io for durable execution. The workflow proceeds through defined phases with parallel execution where dependencies allow and retry loops for quality failures.

**Phase 1 (0–5%):** Story Architect Agent creates the blueprint.

**Phase 2 (5–20%):** In parallel — Hebrew Poet Agent writes text AND Art Director Agent creates illustration prompts AND the Character Sheet Pipeline generates the four-view character reference. Speculative generation starts: the cover illustration begins generating immediately since its scene description is already known from the blueprint.

**Phase 3 (20–35%):** Age Adaptation Agent adjusts text. Accessibility Adaptation Agent runs if accessibility preferences are set.

**Phase 4 (35–45%):** Emotional Tone Agent analyzes the emotional arc. If issues are found, specific pages are sent back to Hebrew Poet (maximum two correction loops).

**Phase 5 (45–50%):** Illustration Layout Agent determines page layouts.

**Phase 6 (50–55%):** Quality Critic Agent evaluates text. Critical issues trigger restart from Phase 2 (maximum one full restart). Major issues send specific pages back to the relevant agent.

**Phase 7 (55–85%):** For each page, AIRouter.generateImage() is called with the Art Director prompt and character sheet reference. Batch processing sends up to four images to the GPU cluster simultaneously. Progress updates fire per page. The cover illustration (started speculatively in Phase 2) is likely already complete — displayed as an "Early Peek" at approximately 30% progress.

**Phase 8 (85–88%):** Quality Critic Agent evaluates each illustration. Technical Quality Gate checks dimensions and blur. Likeness Gate checks face similarity (threshold 0.75). Issues trigger Illustration Repair Agent first (targeted inpainting), then full regeneration if repair fails (maximum two retries per page).

**Phase 9 (88–92%):** Consistency Guardian Agent runs final cross-book validation including Multi-Reference Consistency Check.

**Phase 10 (92–95%):** Narration Director Agent generates Performance Markup. Voice generation runs through AIRouter.generateVoice().

**Phase 11 (95–97%):** Parental Guidance Agent and Cultural Sensitivity Agent generate the guide and check sensitivity.

**Phase 12 (97–100%):** Book Assembly Service creates the interactive digital book JSON, preview images, and (if ordered) print-ready PDF. All events are stored.

Every phase is logged as a Temporal.io activity with the agent name, input hash, output hash, quality score, latency, and provider ID.

---

## Chapter 6 — Quality Control Layers

### 6.1 Layer L-01: Safety Gate

SafetyGate runs on every generated text. Contains a blocklist of 500+ words and phrases organized by category (violence, sexual, drugs, profanity, self-harm) with separate lists for Hebrew and English. Sensitivity is calibrated by age: ages 2–5 blocks even mildly scary words (monster, ghost, darkness, scary, death, blood); ages 6–10 allows moderate tension words but blocks graphic content. Pattern detection via regex catches phone numbers, URLs, and email addresses that should never appear in children's content. Secondary AI check runs on suspicious content that passes the blocklist. Zero tolerance: high risk level results in absolute blocking plus audit log entry.

### 6.2 Layer L-02: Technical Quality Gate

TechnicalQualityGate runs on every illustration. Checks minimum dimensions (1024×1024 for print quality) and correct aspect ratio for the layout. Blur detection via Laplacian variance — below threshold fails the check. Anomaly detection via Gemini Vision API or equivalent that checks "Are there anatomical anomalies such as extra fingers, distorted hands, asymmetric eyes? PASS or FAIL with description."

### 6.3 Layer L-03: Consistency Gate

ConsistencyGate runs on all book pages together. Extracts character descriptions from every illustration prompt (hair color, clothing, accessories). Compares across pages and flags changes. Checks stylistic consistency by comparing style keywords. Checks color palette consistency. After illustrations are generated, runs Multi-Reference Consistency Check comparing face embeddings across all illustrations against each other.

### 6.4 Layer L-04: Likeness Gate

LikenessGate verifies that the illustrated character resembles the actual child. Extracts face from the illustration, computes embedding, and calculates cosine similarity against the original embedding. Minimum threshold: 0.75. Below threshold triggers Illustration Repair Agent for targeted face region inpainting, then full regeneration if repair fails.

### 6.5 Quality Pipeline Execution

The QualityPipeline chains all layers in sequence. SafetyGate on text runs first — failure causes immediate halt with critical failure status. TechnicalQualityGate on each illustration — failure marks the illustration for repair/regeneration. LikenessGate on each illustration — failure marks for repair/regeneration. After all pages are processed, ConsistencyGate runs on the complete book. Results are stored as book events.

---

## Chapter 7 — Data Model

### 7.1 Architecture Decision: CQRS Over Full Event Sourcing

Rather than full Event Sourcing which introduces complexity beyond what StoryMagic needs, the system uses CQRS (Command Query Responsibility Segregation) with an append-only event log. Write operations create events in the event log AND update materialized state tables. Read operations query the materialized state tables for fast lookups. The event log provides complete audit trail, enables replay for debugging, and supports Crypto Shredding.

This avoids the complexity of projections, eventual consistency, and snapshot management while retaining the benefits of complete audit logging and cryptographic deletion.

### 7.2 Database Schema

All schemas use PostgreSQL with JSONB for flexible nested data. Time-based partitioning is applied to `analytics_events` and `book_events` tables from Day 1. Read replicas serve the Interactive Reader which requires fast reads and near-zero writes.

**Table: users**

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    language_preference VARCHAR(10) DEFAULT 'he',
    currency_preference VARCHAR(3) DEFAULT 'ILS',
    subscription_tier VARCHAR(20) DEFAULT 'free' 
        CHECK (subscription_tier IN ('free', 'monthly', 'yearly')),
    accessibility_prefs JSONB DEFAULT '{}'::jsonb,
    -- Structure: {dyslexia_mode: bool, adhd_mode: bool, autism_mode: bool,
    --             font_size: "normal"|"large"|"xl", high_contrast: bool, 
    --             reduced_motion: bool}
    onboarding_type VARCHAR(20) DEFAULT 'guided'
        CHECK (onboarding_type IN ('quick', 'creative', 'guided')),
    encryption_key_ref VARCHAR(255) NOT NULL,
    referral_code VARCHAR(8) UNIQUE NOT NULL,
    referred_by VARCHAR(8),
    timezone VARCHAR(50) DEFAULT 'Asia/Jerusalem',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
```

**Table: children_profiles**

```sql
CREATE TABLE children_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(30) CHECK (gender IN ('boy', 'girl', 'prefer_not_to_say')),
    birth_date DATE,
    physical_traits JSONB DEFAULT '{}'::jsonb,
    -- Structure: {wheelchair: bool, glasses: bool, hearing_aid: bool,
    --             skin_tone: str, hair_color: str, hair_style: str,
    --             custom_notes: str}
    preferences JSONB DEFAULT '{}'::jsonb,
    -- Structure: {family_structure: str, cultural_prefs: [str],
    --             accessibility_needs: [str], reading_prefs: [str],
    --             dietary_restrictions: [str], modesty_concerns: bool,
    --             holiday_preferences: [str], pronouns: str}
    face_embedding_ref VARCHAR(255),
    character_sheet_urls JSONB,
    -- Structure: {front: url, profile: url, three_quarter: url, back: url}
    photos_expiry_date TIMESTAMPTZ,
    photos_count INT DEFAULT 0,
    face_processing_status VARCHAR(20) DEFAULT 'pending'
        CHECK (face_processing_status IN 
            ('pending', 'processing', 'ready', 'failed', 'expired')),
    face_embedding_expiry TIMESTAMPTZ,
    -- Auto-delete after 12 months of inactivity per COPPA 2025
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_children_user ON children_profiles(user_id);
```

**Table: story_templates**

```sql
CREATE TABLE story_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id),
    title VARCHAR(500) NOT NULL,
    title_he VARCHAR(500),
    description TEXT,
    description_he TEXT,
    category VARCHAR(50) NOT NULL,
    age_range_min INT DEFAULT 2,
    age_range_max INT DEFAULT 10,
    language VARCHAR(10) DEFAULT 'he',
    is_rhyming BOOLEAN DEFAULT false,
    scene_definitions JSONB NOT NULL,
    -- Array of scenes with text, illustration hints, animation presets,
    -- interactive elements, and placeholder markers
    cover_image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'review', 'published', 'suspended')),
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    purchase_count INT DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0,
    seo_metadata JSONB DEFAULT '{}'::jsonb,
    -- Structure: {title: str, description: str, tags: [str], 
    --             og_image: str, structured_data: json}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON story_templates(category);
CREATE INDEX idx_templates_status ON story_templates(status);
CREATE INDEX idx_templates_creator ON story_templates(creator_id);
```

**Table: generated_books**

```sql
CREATE TABLE generated_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_profile_ids UUID[] NOT NULL,
    story_template_id UUID REFERENCES story_templates(id),
    free_prompt TEXT,
    title VARCHAR(500),
    generated_story JSONB,
    -- Full story with pages including text, illustration prompts,
    -- layout data, animation presets, interactive elements,
    -- performance markup
    illustration_style VARCHAR(50),
    character_sheet_ref VARCHAR(255),
    illustrations JSONB,
    -- {page_number: {url: str, thumbnail_url: str, print_url: str}}
    voice_narration_url VARCHAR(500),
    voice_profile_id UUID,
    interactive_book_data JSONB,
    print_ready_pdf_url VARCHAR(500),
    digital_pdf_url VARCHAR(500),
    parental_guide JSONB,
    quality_scores JSONB,
    -- {overall: float, per_page: [{page: int, text_score: float, 
    --  illustration_score: float, likeness_score: float}],
    --  consistency_score: float}
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'generating', 'preview', 
            'approved', 'ordered', 'printing', 'shipped')),
    generation_workflow_id VARCHAR(255),
    -- Temporal.io workflow ID for tracking/debugging
    is_living_book BOOLEAN DEFAULT false,
    is_bilingual BOOLEAN DEFAULT false,
    secondary_language VARCHAR(10),
    mood_setting VARCHAR(30),
    creation_method VARCHAR(20)
        CHECK (creation_method IN 
            ('free_prompt', 'template', 'co_creation', 'dream', 'remix')),
    co_creation_journey JSONB,
    book_dna_pattern VARCHAR(500),
    -- Generative visual pattern unique to this book
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_books_user ON generated_books(user_id);
CREATE INDEX idx_books_status ON generated_books(status);
```

**Table: book_pages**

```sql
CREATE TABLE book_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES generated_books(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    text_primary TEXT NOT NULL,
    text_secondary TEXT,
    illustration_url VARCHAR(500),
    illustration_thumbnail_url VARCHAR(500),
    illustration_print_url VARCHAR(500),
    illustration_prompt TEXT,
    illustration_negative_prompt TEXT,
    layout_type VARCHAR(50),
    animation_preset VARCHAR(30),
    interactive_elements JSONB,
    -- [{type: "tappable", position: {x,y,w,h}, content: str, 
    --   sound_effect: str}]
    performance_markup JSONB,
    -- {speaker: str, emotion: str, pace: str, pause_before: int,
    --  pause_after: int, emphasized_words: [int], sound_effect: str}
    alt_text TEXT,
    alt_text_secondary TEXT,
    fun_facts JSONB,
    reading_buddy_question JSONB,
    -- {question: str, type: "pointing"|"prediction"|"analytical",
    --  answer_hint: str}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(book_id, page_number)
);

CREATE INDEX idx_pages_book ON book_pages(book_id);
```

**Table: book_events (append-only, partitioned)**

```sql
CREATE TABLE book_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    agent_name VARCHAR(50),
    payload JSONB,
    quality_score DECIMAL(5,2),
    latency_ms INT,
    provider_id VARCHAR(50),
    prompt_version_id UUID,
    error_details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions
CREATE TABLE book_events_2026_01 PARTITION OF book_events
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE book_events_2026_02 PARTITION OF book_events
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- Continue for each month...

CREATE INDEX idx_events_book ON book_events(book_id);
CREATE INDEX idx_events_type ON book_events(event_type);
CREATE INDEX idx_events_timestamp ON book_events(timestamp);
```

**Table: orders**

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    book_id UUID NOT NULL REFERENCES generated_books(id),
    order_type VARCHAR(20) NOT NULL
        CHECK (order_type IN ('digital', 'softcover', 'hardcover', 'gift')),
    dedication_text TEXT,
    dedication_handwritten_url VARCHAR(500),
    print_options JSONB,
    -- {cover_type: str, size: str, gift_wrap: bool, 
    --  paper_quality: str, quantity: int}
    payment_status VARCHAR(20) DEFAULT 'pending'
        CHECK (payment_status IN 
            ('pending', 'paid', 'failed', 'refunded')),
    payment_provider VARCHAR(20) DEFAULT 'stripe',
    stripe_session_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    shipping_address JSONB,
    shipping_method VARCHAR(20),
    tracking_number VARCHAR(255),
    tracking_url VARCHAR(500),
    print_provider VARCHAR(20),
    external_order_id VARCHAR(255),
    estimated_delivery DATE,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ILS',
    soft_proof_url VARCHAR(500),
    -- CMYK preview for customer approval before printing
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(payment_status);
```

**Table: creators**

```sql
CREATE TABLE creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    display_name VARCHAR(255) NOT NULL,
    bio TEXT,
    bio_he TEXT,
    avatar_url VARCHAR(500),
    portfolio_links VARCHAR(500)[],
    revenue_share_percent INT DEFAULT 70,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    pending_payout DECIMAL(10,2) DEFAULT 0,
    stripe_connect_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table: subscriptions**

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    tier VARCHAR(20) NOT NULL
        CHECK (tier IN ('monthly', 'yearly')),
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'cancelled', 'past_due', 'paused')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    books_remaining_this_period INT DEFAULT 0,
    books_cap_per_period INT DEFAULT 2,
    -- Monthly: 2, Yearly: 24 (to maintain margin)
    free_prints_remaining INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subs_user ON subscriptions(user_id);
CREATE INDEX idx_subs_status ON subscriptions(status);
```

**Table: voice_profiles**

```sql
CREATE TABLE voice_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('preset', 'family')),
    family_role VARCHAR(30),
    language VARCHAR(10),
    gender VARCHAR(20),
    age_range VARCHAR(20),
    preview_audio_url VARCHAR(500),
    original_recording_url VARCHAR(500),
    clone_status VARCHAR(20)
        CHECK (clone_status IN ('processing', 'ready', 'failed')),
    provider VARCHAR(30),
    provider_voice_id VARCHAR(255),
    quality_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table: living_books**

```sql
CREATE TABLE living_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initial_book_id UUID NOT NULL REFERENCES generated_books(id),
    child_id UUID NOT NULL REFERENCES children_profiles(id),
    user_id UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    chapters JSONB DEFAULT '[]'::jsonb,
    -- [{chapter_number: int, book_id: uuid, title: str, added_at: timestamp}]
    next_reminder_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table: dreams**

```sql
CREATE TABLE dreams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    child_id UUID NOT NULL REFERENCES children_profiles(id),
    transcript TEXT NOT NULL,
    emotion VARCHAR(30),
    emotion_intensity DECIMAL(3,1),
    illustration_url VARCHAR(500),
    book_id UUID REFERENCES generated_books(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table: gift_cards**

```sql
CREATE TABLE gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchaser_id UUID NOT NULL REFERENCES users(id),
    recipient_email VARCHAR(255),
    recipient_name VARCHAR(255),
    gift_type VARCHAR(20)
        CHECK (gift_type IN ('digital', 'print', 'experience')),
    gift_message TEXT,
    delivery_date DATE,
    redeem_code VARCHAR(12) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'purchased'
        CHECK (status IN ('purchased', 'delivered', 'redeemed', 'expired')),
    stripe_payment_id VARCHAR(255),
    credits JSONB,
    -- {digital_books: int, print_books: int}
    redeemed_by_user_id UUID,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gifts_code ON gift_cards(redeem_code);
```

**Table: referrals**

```sql
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id),
    referred_user_id UUID REFERENCES users(id),
    referral_code VARCHAR(8) NOT NULL,
    status VARCHAR(20) DEFAULT 'signed_up'
        CHECK (status IN ('signed_up', 'created_book', 'reward_given')),
    reward_type VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table: classrooms**

```sql
CREATE TABLE classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_user_id UUID NOT NULL REFERENCES users(id),
    school_name VARCHAR(255),
    grade_name VARCHAR(100),
    student_count INT,
    subscription_tier VARCHAR(20) DEFAULT 'free'
        CHECK (subscription_tier IN ('free', 'school', 'district')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table: classroom_students**

```sql
CREATE TABLE classroom_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    age INT,
    consent_status VARCHAR(20) DEFAULT 'pending'
        CHECK (consent_status IN ('pending', 'consented', 'opted_out')),
    consent_parent_email VARCHAR(255),
    consent_token VARCHAR(255) UNIQUE,
    consent_date TIMESTAMPTZ,
    has_photos BOOLEAN DEFAULT false,
    face_embedding_ref VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table: prompt_versions**

```sql
CREATE TABLE prompt_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_key VARCHAR(100) NOT NULL,
    -- e.g., "story-architect-system", "hebrew-poet-system"
    version INT NOT NULL,
    content TEXT NOT NULL,
    variables VARCHAR(100)[],
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'testing', 'active', 'retired')),
    test_results JSONB,
    -- {pass_rate: float, avg_quality_score: float, 
    --  acceptance_rate: float, last_tested_at: timestamp}
    ab_test_traffic_percent INT DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(prompt_key, version)
);

CREATE INDEX idx_prompts_key_status ON prompt_versions(prompt_key, status);
```

**Table: prompt_test_cases**

```sql
CREATE TABLE prompt_test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_key VARCHAR(100) NOT NULL,
    input_variables JSONB NOT NULL,
    expected_traits VARCHAR(100)[] NOT NULL,
    -- ['contains_child_name', 'age_appropriate', 'safe_content',
    --  'has_moral_lesson', 'rhymes_if_requested', 'consistent_pronouns',
    --  'complete_arc']
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table: analytics_events (partitioned)**

```sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(100) NOT NULL,
    user_id UUID,
    session_id VARCHAR(100),
    properties JSONB,
    locale VARCHAR(10),
    device_type VARCHAR(20),
    page_url VARCHAR(500),
    timestamp TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (timestamp);

CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_event ON analytics_events(event_name);
CREATE INDEX idx_analytics_time ON analytics_events(timestamp);
```

**Table: notifications**

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(30) NOT NULL,
    title VARCHAR(255),
    title_he VARCHAR(255),
    message TEXT,
    message_he TEXT,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    is_push_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
```

**Table: user_drafts**

```sql
CREATE TABLE user_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    draft_type VARCHAR(30) NOT NULL,
    step INT,
    data JSONB NOT NULL,
    expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drafts_user ON user_drafts(user_id, draft_type);
```

**Table: creator_transactions**

```sql
CREATE TABLE creator_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES story_templates(id),
    creator_id UUID NOT NULL REFERENCES creators(id),
    user_id UUID NOT NULL REFERENCES users(id),
    book_id UUID NOT NULL REFERENCES generated_books(id),
    total_amount DECIMAL(10,2),
    creator_share DECIMAL(10,2),
    platform_share DECIMAL(10,2),
    payout_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table: abuse_reports**

```sql
CREATE TABLE abuse_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_user_id UUID REFERENCES users(id),
    reported_template_id UUID REFERENCES story_templates(id),
    reported_book_id UUID REFERENCES generated_books(id),
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Chapter 8 — API Specification

### 8.1 API Architecture Decisions

All endpoints are versioned from Day 1 using URL versioning (`/api/v1/...`). Deprecation policy: old versions are supported for 6 months after a new version launches. An OpenAPI spec is auto-generated from FastAPI and used to produce TypeScript client SDK via Fern, ensuring zero drift between frontend and backend types.

### 8.2 Authentication Endpoints

`POST /api/v1/auth/register` — Register new user (email, password, name, language, parental consent acknowledgment with specific biometric data disclosure). Returns JWT access token and refresh token.

`POST /api/v1/auth/login` — Login with email and password or Google OAuth. Returns JWT tokens.

`POST /api/v1/auth/verify-parent` — Verifiable Parental Consent with biometric data collection disclosure per COPPA 2025. Requires knowledge-based or payment-based verification.

`POST /api/v1/auth/refresh` — Refresh access token.

`POST /api/v1/auth/forgot-password` — Send password reset link.

`POST /api/v1/auth/reset-password` — Reset password with token.

`POST /api/v1/auth/logout` — Invalidate tokens.

### 8.3 Children Profile Endpoints

`POST /api/v1/children` — Create child profile. Accepts name, gender, birth_date, physical_traits, preferences, and up to 5 photos (multipart upload). Returns profile with face_processing_status.

`GET /api/v1/children` — List user's children profiles.

`GET /api/v1/children/{id}` — Get specific child profile.

`PUT /api/v1/children/{id}` — Update profile including new photos (triggers new face embedding).

`DELETE /api/v1/children/{id}` — Delete child profile including face embedding, character sheet, and all associated data.

`GET /api/v1/children/{id}/face-status` — Poll face processing status.

### 8.4 Story Endpoints

`POST /api/v1/stories/generate` — Generate story from free-form prompt. Triggers full Orchestrator pipeline. Returns SSE stream with progress updates.

`POST /api/v1/stories/from-template` — Generate story from template ID plus child profile. Returns SSE stream.

`GET /api/v1/stories/templates` — Browse templates with filters: category, age_range, language, price_range, rating_min, is_rhyming, sort_by. Paginated.

`GET /api/v1/stories/templates/{id}` — Template detail with preview.

`PUT /api/v1/stories/{id}/edit` — Edit specific page text or request full rewrite.

`POST /api/v1/stories/{id}/edit-conversational` — Natural language editing ("make the story funnier"). Returns updated pages.

`POST /api/v1/stories/{id}/regenerate-page` — Regenerate a specific page (text and/or illustration).

### 8.5 Illustration Endpoints

`POST /api/v1/illustrations/generate` — Generate all illustrations for a book. Returns SSE stream with per-page progress.

`POST /api/v1/illustrations/{id}/edit` — Edit specific illustration via natural language chat. Returns updated illustration.

`POST /api/v1/illustrations/{id}/regenerate` — Full regeneration of an illustration.

`POST /api/v1/illustrations/{id}/repair` — Targeted repair of an illustration anomaly.

`GET /api/v1/illustrations/{id}/status` — Generation status (SSE or poll).

### 8.6 Voice Endpoints

`POST /api/v1/voice/generate` — Generate voice narration for a book with Performance Markup. Returns audio URL.

`POST /api/v1/voice/clone` — Upload recording for voice cloning. Returns clone status.

`GET /api/v1/voice/presets` — List available preset voices with previews.

`POST /api/v1/voice/family/record` — Save family member voice recording.

`GET /api/v1/voice/family` — List family voice profiles.

`DELETE /api/v1/voice/family/{id}` — Delete family voice profile.

### 8.7 Book Endpoints

`POST /api/v1/books/create` — Master endpoint: triggers full book creation pipeline. Returns SSE stream with progress phases.

`GET /api/v1/books` — List user's books with pagination and filters.

`GET /api/v1/books/{id}` — Book detail with quality scores and status.

`GET /api/v1/books/{id}/preview` — Preview with page thumbnails.

`GET /api/v1/books/{id}/interactive` — Full interactive book data for the reader.

`GET /api/v1/books/{id}/read-progress` — Get reading progress and bookmarks.

`PUT /api/v1/books/{id}/read-progress` — Update reading progress.

`POST /api/v1/books/{id}/approve` — Approve book for printing.

`POST /api/v1/books/{id}/living-book/toggle` — Enable/disable Living Book.

`POST /api/v1/books/{id}/living-book/add-chapter` — Add new chapter.

`GET /api/v1/books/{id}/extras` — Available ancillary products.

`POST /api/v1/books/{id}/extras/generate` — Generate specific ancillary product.

### 8.8 Order Endpoints

`POST /api/v1/orders` — Create order (digital or print).

`GET /api/v1/orders` — List orders.

`GET /api/v1/orders/{id}` — Order detail with tracking.

`GET /api/v1/orders/{id}/tracking` — Shipping tracking detail.

`GET /api/v1/orders/{id}/soft-proof` — CMYK soft proof preview.

`POST /api/v1/orders/{id}/approve-proof` — Approve soft proof for printing.

### 8.9 Print Endpoints

`POST /api/v1/print/prepare-pdf` — Generate print-ready PDF with CMYK, bleed, crop marks.

`POST /api/v1/print/submit` — Submit to print provider.

`GET /api/v1/print/status/{orderId}` — Print status.

`POST /api/v1/print/shipping-rates` — Get shipping rate quotes.

### 8.10 Subscription Endpoints

`POST /api/v1/subscriptions/create-checkout` — Create Stripe Checkout session for subscription.

`POST /api/v1/subscriptions/portal` — Create Stripe Customer Portal session.

`POST /api/v1/subscriptions/webhook` — Stripe webhook handler for subscription events.

`GET /api/v1/subscriptions/status` — Current subscription status including books remaining.

### 8.11 Payment Endpoints

`POST /api/v1/payments/create-checkout` — Stripe Checkout for one-time purchase.

`POST /api/v1/payments/webhook` — Stripe webhook handler for payment events.

### 8.12 Creator Endpoints

`POST /api/v1/creators/apply` — Submit creator application.

`POST /api/v1/creators/templates` — Create story template.

`PUT /api/v1/creators/templates/{id}` — Update template.

`GET /api/v1/creators/analytics` — Creator analytics dashboard data.

`POST /api/v1/creators/payout-request` — Request payout.

### 8.13 Marketplace Endpoints

`GET /api/v1/marketplace/templates` — Search and filter templates.

`GET /api/v1/marketplace/templates/{id}` — Template detail with reviews.

`POST /api/v1/marketplace/templates/{id}/review` — Write review.

`POST /api/v1/marketplace/templates/{id}/report` — Report template.

### 8.14 Classroom Endpoints

`POST /api/v1/classroom/register` — Register classroom.

`POST /api/v1/classroom/students` — Add students.

`GET /api/v1/classroom/consent/{token}` — Parental consent page.

`POST /api/v1/classroom/consent/{token}` — Submit parental consent.

`POST /api/v1/classroom/create-book` — Create classroom book.

`GET /api/v1/classroom/dashboard` — Teacher dashboard.

### 8.15 Gift Endpoints

`POST /api/v1/gifts/purchase` — Purchase gift card.

`GET /api/v1/gifts/redeem/{code}` — Validate and redeem gift card.

`POST /api/v1/gifts/redeem/{code}` — Complete redemption.

### 8.16 Referral Endpoints

`GET /api/v1/referral/status` — Referral statistics.

`POST /api/v1/referral/share` — Log share event for analytics.

### 8.17 Dream Endpoints

`POST /api/v1/dreams` — Save a dream.

`GET /api/v1/dreams` — List dreams for a child.

`POST /api/v1/dreams/{id}/create-book` — Convert dream to book.

### 8.18 Recommendation Endpoints

`GET /api/v1/recommendations/{childId}` — Get personalized recommendations.

`GET /api/v1/seasonal` — Get current seasonal content.

### 8.19 Admin Endpoints

`GET /api/v1/admin/prompts` — List all prompt versions.

`POST /api/v1/admin/prompts/{key}/version` — Create new prompt version.

`POST /api/v1/admin/prompts/{key}/test` — Run test suite against prompt.

`POST /api/v1/admin/prompts/{key}/promote` — Promote to active.

`POST /api/v1/admin/prompts/{key}/rollback` — Rollback to previous version.

`GET /api/v1/admin/analytics` — Admin analytics dashboard.

`GET /api/v1/admin/quality-dashboard` — AI quality metrics dashboard.

`GET /api/v1/admin/moderation-queue` — Content moderation queue.

`POST /api/v1/admin/moderation/{id}/action` — Take moderation action.

### 8.20 System Endpoints

`GET /api/v1/health` — System health check.

`GET /api/v1/health/deep` — Deep health check (database, Redis, GPU, AI providers).

---

# PART III — USER EXPERIENCE

---

## Chapter 9 — User Flows

### 9.1 Flow UF-01: Free-Form Book Creation

The user signs in or registers. They select or create a child profile providing name, age, gender, and photographs with client-side face detection that provides real-time quality feedback (face centering, lighting, sharpness). They write a free-form prompt, optionally selecting illustration style, rhyming preference, language, page count, and mood through the Quick Mood Selector (a grid of six large emoji: happy, exciting, sad, scared, angry, calm).

For users who find the blank prompt daunting, the Prompt Builder offers guiding questions: "What is the theme?" (adventure, friendship, holiday, bedtime), "Where does it happen?" (space, ocean, forest, city), "Who else is there?" (animal, friend, magical creature), "What does the child learn?" (courage, sharing, patience). From these answers the system composes a prompt that the user sees and can edit.

The system displays a text-only story preview within 10–15 seconds, streamed word-by-word directly from the LLM for a perceived latency of 1–2 seconds. The user approves or edits the text using direct editing or conversational editing.

The system generates illustrations through the Magic Moment Experience. Rather than a progress bar, each phase becomes an experience: Phase 1 "Crafting the Story" shows text writing itself word by word with a feather cursor. Phase 2 "Bringing Characters to Life" shows the child's photo on the left transforming into the illustration style on the right with sparkle particles. Phase 3 "Painting the Story" shows book pages fanning across the screen, each starting white and filling with color through a paint splash animation; the Early Peek displays the first completed illustration (approximately 30% through) full-screen with the child's character as the "aha moment." Phase 4 "Final Touches" shows the book assembling with pages stacking and cover wrapping. Phase 5 "Your Book Is Ready!" shows confetti, the cover revealed with 3D tilt effect, and a glowing pulse "Open Your Book" button.

Throughout the experience: a fact ticker rotates every 8 seconds, estimated time remaining is displayed, and a "Notify Me When Ready" button offers push notification if the user navigates away. Social proof displays: "47 books are being created right now on StoryMagic!"

The user sees a full preview with page-flip animation. They can edit any illustration through natural language. They choose digital book, print, or both. Payment processes through Stripe. The digital version is immediately available in the library with voice narration. Print orders include soft proofing (CMYK preview), tracking with a visual timeline, and delivery within 5–10 days.

### 9.2 Flow UF-02: Quick Create (One-Page Flow)

For the "quick" onboarding type: a single page with three fields — child name, age, and "What should the story be about?" plus an optional photo upload. One tap on "Create Book" and the AI fills all defaults: illustration style matched to age (Whimsical for ages 2–4, Classic Storybook for ages 5–7, Comic Book for ages 8–10), 12 pages, mood based on topic analysis, no rhyming, Hebrew. The user can always go back and customize after seeing the preview.

### 9.3 Flow UF-03: Co-Creation (Parent and Child Together)

Parent and child sit together. The parent taps "Create Together" and Sparky (animated guide character) appears with a greeting. Sparky asks the child questions using voice synthesis. The child responds with their own voice (Web Speech API STT) or by tapping illustrated choice cards. Steps: "What should the story be about?" (four illustrated options plus "something else"), "Who do you meet?" (four character options), "Where does the adventure happen?" (four location options), "Something special you want?" (open-ended voice or type). At every step the child can add requests ("I want a dog!") and the system adapts.

The system generates a book from the choices. At the end, a "Behind the Story" page displays the child's journey of choices with illustrations of each decision point. Full fallback ensures every voice step supports tap and type.

### 9.4 Flow UF-04: Interactive Reading

User opens a book from the library. They choose a reading mode: "I Read" (text only, no narration), "Read to Me" (AI narration), "Read in Mama/Papa's Voice" (family voice), or "Night Mode" (dimmed colors, calming music, slow pace — activates automatically between 7 PM and 7 AM).

In "Read to Me" mode: the book plays with word-by-word karaoke highlighting with a bouncing pointer, page-appropriate ambient animations (leaves, stars, bubbles), Performance Markup voice narration with different voices for different characters and emotional pacing, and scene-appropriate sound effects. Each page offers tappable elements — tapping a butterfly reveals "Did you know? Butterflies taste with their feet!" Reading Buddy (wise owl with glasses) appears periodically with age-appropriate questions.

At the end: one interactive quiz question about the story, a celebration sequence with confetti, and the book is saved to the child's bookshelf.

Reading Analytics for parents shows: books read this week, total reading time, questions answered by Reading Buddy, and words the child tapped on (indicating interest).

### 9.5 Flow UF-05: Living Book

Parent enables "Living Book" on an existing book. Before each birthday, a reminder notification arrives with a personalized message from the Growth Agent ("Mika is turning 6 next week! Time for a new chapter in her adventure?"). The parent taps "Add New Chapter" and describes the new adventure. A new chapter is generated in the same illustration style with an updated character (the child looks one year older). A timeline shows all chapters chronologically. The book can be printed as a complete volume including all chapters.

### 9.6 Flow UF-06: Gift Card

Grandmother navigates to the /gift page and selects a gift card tier. She writes a personal message and optionally selects a scheduled delivery date. Payment processes through Stripe. On the delivery date, the recipient parent receives an email with a link. They tap the link and see a gift-unwrapping animation (wrapping paper tears away to reveal the StoryMagic gift). They register and create a book using the gift credit.

### 9.7 Flow UF-07: Classroom Edition

Teacher registers and creates a classroom with school name, grade, and student count. The system generates unique consent links for each student's parents. Parents receive the link, review the COPPA-compliant disclosure about biometric data collection, provide consent, and optionally upload photos. The teacher selects a classroom template ("Our First Day," "The Class Trip") and creates a book where every consented child appears as a character. Each family receives a personalized copy where their child is the cover character. "Student of the Week" generates a short celebratory book for a different student each week.

---

## Chapter 10 — UX/UI Design System

### 10.1 Visual Design Foundation

**Color Palette.** Primary: Indigo-600 (#4F46E5). Secondary: Purple-500 (#8B5CF6). Accent: Amber-400 (#FBBF24). Success: Green-500 (#22C55E). Warning: Orange-400 (#FB923C). Danger: Red-500 (#EF4444). Background Light: Slate-50 (#F8FAFC). Background Dark: Slate-900 (#0F172A). Surface Light: White (#FFFFFF). Surface Dark: Slate-800 (#1E293B).

**All CSS uses Logical Properties exclusively.** `margin-inline-start` replaces `margin-left`. `padding-inline-end` replaces `padding-right`. `text-start` replaces `text-left`. `border-start-start-radius` replaces `border-top-left-radius`. `inset-inline-start` replaces `left`. An ESLint rule flags any use of physical direction properties as an error.

**Zero hardcoded strings.** Every user-facing text comes from i18n translation files via next-intl.

**Responsive breakpoints (mobile-first).** Default: mobile. md: 768px. lg: 1024px. xl: 1440px.

**Dark Mode and Light Mode** with system preference detection and manual toggle.

**High Contrast Mode** toggle in accessibility settings.

**Font size adjustment** in three levels: normal, large, extra-large.

**Fonts.** Noto Sans Hebrew for Hebrew text. Noto Sans for English text. OpenDyslexic for dyslexia mode. Each illustration style comes with a paired decorative title font and readable body font, selected from a library of 15–20 Hebrew font pairs tested for readability at ages 4–10.

### 10.2 WCAG 2.1 AA Compliance

All images carry descriptive alt text generated by the Art Director Agent and refined by the Accessibility Adaptation Agent. Full keyboard navigation across all wizard flows and interactive elements. Screen reader announcements for step changes, loading states, and dynamic content updates. Focus management between wizard steps with visible focus indicators. Minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text. All form elements carry proper label associations. ARIA attributes on all interactive components. Skip-to-content link on every page.

### 10.3 Neuro-Inclusive Reading Modes

**Dyslexia Mode.** Font: OpenDyslexic. Line height: 2.0. Letter spacing: 0.05em. Word spacing: 0.16em. Background: cream (#FDF6E3). Text color: dark brown (#3E2723). No italic text. No justified alignment — always text-start. Optional syllable markers. Maximum 10 words per line. No serif fonts anywhere.

**ADHD Mode.** Maximum 3 sentences per page view (longer pages split into sub-pages with smooth transition). Guaranteed interactive element on every page. Positive encouragement message every 3 pages from a pool of 15 messages. Prominent progress indicator with celebration at milestones (25%, 50%, 75%, done). Optional break reminder after 10 pages. Reduced decorative elements. Focused layout with minimal distractions.

**Autism Spectrum Mode.** Uniform predictable layout (identical structure on every page). No surprise animations — all animations are gentle, predictable, and consistent. Explicit emotion labels beneath every illustration ("Dana feels happy because she found a new friend"). Social story structure with clear cause-and-effect. Calm muted color palette. No flashing or sudden elements. Concrete language only — no idioms, metaphors, or sarcasm. Transition warning before page change. Consistent character positioning on each page.

### 10.4 Adaptive Onboarding

Three onboarding paths presented on first login. "Quick" asks three questions (child name, age, favorite topic) and creates a book immediately. "Creative" provides full access to all tools, advanced templates, and illustration editing. "Guided" offers step-by-step wizard with explanations, examples, and contextual help at every stage.

### 10.5 Magic Moment Experience (Wait State Design)

Described in Flow UF-01 above. Additional design details: each phase has a unique ambient background color gradient that shifts slowly. Sparky (the mascot) appears in the corner making encouraging comments. The "Early Peek" of the first illustration is the critical conversion moment — it must appear within 60 seconds of generation start. Background music plays softly (optional, toggleable). The Share button "We're creating a book!" generates a preview image of the cover with a blur overlay and the text "Coming soon..." that the parent can share on social media before the book is even finished.

### 10.6 Family Bookshelf (Visual Library)

A three-dimensional visual bookshelf using CSS transforms (perspective, slight rotateX tilt). Books stand vertically with visible spines colored by illustration style. Hovering a book pulls it forward slightly (translateZ) revealing the cover. Living Books have a golden spine with a growth symbol. Shelves are organized by child with tab navigation. Empty shelf displays a friendly message with "Create Your First Book" call to action. Drag-and-drop for reordering. 

The "Reading Corner" background changes with time of day: morning shows sunshine and birds, evening shows a sunset glow, night shows stars and a crescent moon. This subtle detail makes the bookshelf feel alive and encourages return visits.

**Story World Map** (alternative view): instead of shelves, a whimsical illustrated map where each book is a "location." A space book is a glowing star, an ocean book is a tropical island, a forest book is a green tree. The child "travels" the map and taps locations to open books. Living Books appear as locations that visually grow over time.

### 10.7 Emotional Journey Mapping

Before writing the prompt, the Quick Mood Selector presents a grid of six large illustrated emoji: happy, exciting, sad, scared, angry, calm. Each is represented not as a flat emoji but as an illustrated character expression in the chosen illustration style. The selection influences story tone, illustration color palette, narration pacing, and background music selection.

### 10.8 Typography as First-Class Citizen

Font Pairing Engine matches decorative title fonts with readable body fonts for each illustration style and each scene. A library of 15–20 Hebrew font pairs tested for readability ages 4–10. Emphasized words ("BOOM!", "WHOOSH!") receive special hand-lettered treatment that integrates with the illustration. Animated Drop Caps on chapter openings where the first letter grows decoratively into the page. Emotion Typography: scary words in a trembling font, happy words in a bouncing font, quiet words in a small delicate font.

### 10.9 Book DNA

Every book receives a unique generative visual pattern (Book DNA) created from the story's embedding vectors. This pattern appears on the book spine in the Bookshelf, on the title page, on the back cover, and as a subtle watermark on each page. No two books ever share the same DNA pattern. This gives every book a unique fingerprint that is visually distinctive and uncopyable.

### 10.10 Seasonal Bookshelf Themes

The bookshelf environment changes with seasons and holidays: Sukkot shows the bookshelf inside a sukkah with hanging decorations, Hanukkah illuminates books with candle light, summer places books on a beach with waves, Purim adds costume elements. The seasonal environment loads based on the calendar and the user's cultural preferences.

---

## Chapter 11 — Voice and Music System

### 11.1 Performance Markup Specification

Every text segment carries metadata: speaker (narrator, character_1, character_2, character_3 — each with a distinct voice profile), emotion (neutral, happy, excited, scared, whispering, shouting, singing, sad, brave, gentle), pace (slow, normal, fast), pause_before_ms (0–2000), pause_after_ms (0–2000), emphasized_word_indices, and sound_effect (from the 30-effect library: door_creak, wind_howl, bird_chirp, splash, magic_sparkle, thunder_rumble, children_laugh, soft_footsteps, gentle_bells, rain_drops, cat_meow, dog_bark, horse_gallop, dragon_roar_gentle, fairy_sparkle, rocket_launch, water_splash, door_knock, owl_hoot, frog_croak, rooster_crow, clock_tick, whistle_blow, trumpet_fanfare, drum_roll, guitar_strum, piano_chord, harp_glissando, flute_melody, sleepy_yawn).

The Narration Director Agent (A-13) generates this markup using AI understanding of context rather than simple keyword matching.

### 11.2 Preset Voice Library

Twenty or more voices across languages, each with a name, description, style descriptor, and audio preview. Examples: "Storyteller Sarah" (warm female narrator), "Grandpa Joe" (deep gentle male), "Young Maya" (energetic girl), "Captain Alex" (adventurous male), "Wise Grandma Ruth" (warm elderly female), "Playful Dani" (mischievous boy). Hebrew voices include "Noa the Storyteller," "Saba Moshe," "Savta Miriam."

### 11.3 Family Voice Library

Any family member can record 30 seconds of reading from a provided text sample. The recording passes quality checks for background noise, volume consistency, and clarity. Voice cloning through ElevenLabs API (primary) or Fish Audio (fallback) creates an AI voice that reads the entire book. Family voices are stored in a personal voice library accessible from the reader. Emotional marketing feature: "Record Grandpa's voice today — he'll read stories to his grandchildren for years to come."

---

# PART IV — OPERATIONAL EXCELLENCE

---

## Chapter 12 — Performance, Monitoring, and Analytics

### 12.1 Performance Budget

Maximum page weight (HTML + CSS + JS): 500KB. Maximum illustration size: 200KB (WebP/AVIF). Full book load time (12 pages): below 3 seconds. First Contentful Paint: below 1.5 seconds. Largest Contentful Paint: below 2.5 seconds. Cumulative Layout Shift: below 0.1. Interaction to Next Paint: below 200ms. Time to Interactive: below 3.5 seconds. Animation frame rate: 60fps for ambient effects, 30fps minimum for complex particle systems.

Performance Budget is enforced in CI: Lighthouse scores must maintain LCP below 2.5s, CLS below 0.1, and INP below 200ms. Build fails if budget is exceeded.

### 12.2 Image Optimization Pipeline

Every illustration is stored in four sizes: thumbnail (200px width, WebP, ~10KB), preview (600px, WebP, ~40KB), full (1024px, WebP, ~150KB), print (2400px, PNG/TIFF, ~2MB). AVIF format is served where browser support exists (smaller than WebP by 20–30%). Lazy loading with blur placeholder for all book images. Predictive pre-caching: when a user opens page 1, pages 2–3 are pre-loaded.

### 12.3 CDN Strategy

CloudFront as primary CDN with regional edge locations. Israel POP (Tel Aviv) for primary market. Illustration and audio files cached at edge with 30-day TTL. Cache invalidation only on asset regeneration (edit/repair). Signed URLs for private content (user's books, voice recordings) with 24-hour expiry.

### 12.4 Monitoring Stack

**Distributed Tracing.** OpenTelemetry instrumentation across all services. Jaeger or Grafana Tempo for trace storage and visualization. Every book generation request produces a single trace spanning the entire pipeline: frontend request → BFF → FastAPI → Temporal workflow → each agent execution → each AI provider call → image generation → voice generation → assembly. This enables pinpointing exactly which step is slow or failing.

**Metrics.** Datadog or Grafana for infrastructure and application metrics. Key metrics: book generation latency (p50, p95, p99), AI provider latency per provider, quality scores distribution, conversion funnel (visit → register → create profile → start book → complete book → purchase), error rates per endpoint and per agent, GPU utilization and queue depth, cache hit rates.

**Error Tracking.** Sentry for frontend and backend error tracking with source maps, breadcrumbs, and user context.

**AI-Specific Observability.** LangSmith or Langfuse for LLM observability: token usage per request, prompt version performance comparison, quality score trends over time, cost per book broken down by agent and provider, A/B test results for prompt versions and provider selection.

**Custom Quality Dashboard.** Real-time dashboard showing: books created in last hour/day/week, average quality score, safety gate block rate, likeness gate pass rate, consistency gate pass rate, most common illustration repair types, rhyming success rate for Hebrew.

**Daily Quality Sampling.** Automated daily sampling of 10 randomly selected books created in the last 24 hours, flagged for human review. Human reviewers rate narrative quality, illustration quality, likeness accuracy, and overall experience. Trends are tracked and alerts fire if quality drops below baseline.

### 12.5 Analytics Events

Key events tracked: page_view, user_registered, child_profile_created, photo_uploaded, book_creation_started, book_creation_completed, book_creation_abandoned (with step), prompt_written (anonymized), template_selected, illustration_style_selected, illustration_edited, text_edited, voice_selected, reading_started, reading_completed, reading_paused, page_turned, interactive_element_tapped, reading_buddy_question_answered, book_purchased_digital, book_purchased_print, subscription_started, subscription_cancelled, gift_purchased, gift_redeemed, referral_shared, referral_converted, creator_template_published, classroom_created, dream_recorded, ar_experience_launched.

Implicit signals tracked for the recommendation engine: time spent per page (interest indicator), pages re-read (favorite indicator), illustrations tapped (curiosity indicator), books completed vs. abandoned (engagement indicator), re-reads of same book (love indicator).

---

## Chapter 13 — Offline-First, Edge, and Error Recovery

### 13.1 Offline-First Architecture

Service Worker caches static assets (CSS, JS, fonts, icons) on install and caches book data and illustrations on first read. Network-first strategy for API calls. Cache-first strategy for book content. Background sync: when connectivity returns, reading progress and bookmarks sync automatically.

OfflineBookManager downloads all book data to IndexedDB (illustration blobs, audio, animation data). A "Download for Offline Reading" button shows estimated size and download progress. A green "Available Offline" badge appears on downloaded books. ConnectivityIndicator shows a subtle banner "You're offline. Downloaded books are still available" and when reconnected "Back online! Syncing your progress..."

### 13.2 Edge Optimization

Next.js Edge Middleware handles locale detection from Accept-Language header, currency determination by geography (ILS for Israel, USD for US, EUR for Europe), rate limiting (60 requests/minute for API, 10/minute for AI generation, 20/minute for auth), bot detection, and security headers (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, X-XSS-Protection).

Static pages, auth checks, book list queries, and reading progress updates run on Edge for minimal latency.

### 13.3 Error Recovery UX

Defined error types: NetworkError (retryable), AIGenerationError (retryable, with agent name and step), PaymentError (retryable or not depending on reason), StorageError (retryable), ValidationError (not retryable), RateLimitError (retryable with countdown).

ErrorRecovery component displays context-appropriate messages with child-friendly illustrations. NetworkError shows "It looks like you lost your internet connection. We saved your progress!" with a disconnected cable illustration. AIGenerationError shows "Our wizard needs another moment to recharge. Your story is saved safely!" with a countdown to automatic retry plus a "Try Again Now" button plus a fallback "Use a Template Instead" button. PaymentError shows the Stripe-specific error message plus "Try Again" and "Try a Different Card" options. RateLimitError shows "You're creating books faster than we can draw! Please wait [countdown] seconds."

AutoSave persists wizard state to the database every 30 seconds, on every step change, and on visibility change (tab switch or app background). On return: "You have an unfinished book! Continue from where you left off?" with a preview of the last step.

DraftRecoveryManager handles save, load, clear, and list operations for drafts. The dashboard displays a banner if there are unfinished drafts.

Push Notifications fire when book generation completes and the user is not on the page: "Your book is ready! Open it now."

### 13.4 Graceful Degradation

Three feature tiers that work independently. Basic tier (works everywhere): static book with text and illustrations, no animations, no voice, no interactivity — essentially a digital picture book. AI-Enhanced tier: adds voice narration, Performance Markup, and ambient animations. Premium tier: adds interactive elements, Reading Buddy, co-creation mode, AR, and voice cloning. Each tier degrades gracefully to the next lower tier if required capabilities are unavailable.

---

## Chapter 14 — Security and Child Privacy

### 14.1 COPPA 2025 Final Rule Compliance

The COPPA 2025 Final Rule (enforcement April 22, 2026) makes critical changes that directly affect StoryMagic.

**Biometric identifiers are now "personal information."** Face templates, faceprints, and voiceprints are explicitly included. This means StoryMagic's face embeddings AND voice clones require specific verifiable parental consent that explicitly discloses: what biometric data is collected, why it is collected, how it is stored, how long it is retained, and how it can be deleted.

**Data retention limitations.** The Rule requires operators to retain children's personal information only as long as reasonably necessary to fulfill the purpose for which it was collected. StoryMagic's implementation: face embeddings are retained only while there are active books or the account is active, with automatic deletion after 12 months of inactivity. Voice clones follow the same policy. Original photos are deleted after 30 days.

**Verifiable Parental Consent methods.** The Rule requires more than a checkbox. Acceptable methods include: signed consent form (physical or electronic), payment transaction as verification, video conference verification, or knowledge-based challenge. StoryMagic implements: Stripe payment transaction as consent verification (the first purchase serves as VPC), or a signed electronic consent form with specific biometric data disclosure for free tier users.

### 14.2 GDPR and GDPR-K Compliance

All children's data encrypted with AES-256. Face embeddings stored separately from PII with homomorphic encryption in Qdrant. Crypto Shredding: every user's data is encrypted with a unique key stored in AWS KMS. Deletion means deleting the key from KMS, rendering all associated data permanently unreadable across all storage systems including backups, CDN cache, and logs.

Right to Access: "Download My Data" button exports all user data in machine-readable format. Right to be Forgotten: "Delete My Account" button with confirmation modal that explains consequences, then deletes everything including Crypto Shredding of all encrypted data, CDN cache purge, and log anonymization. Data Processing Agreements prepared for all third-party processors.

### 14.3 Content Safety

SafetyGate runs on every AI output (text and images) before display, as specified in Chapter 6. Zero tolerance for unsafe content. Audit log on every block event.

**Prompt Injection Defense.** User inputs (free-form prompts, conversational edits) are sanitized before being injected into AI prompts. A dedicated prompt injection detection layer identifies and strips attempts to override system prompts. Input is treated as data, never as instructions — the system prompt clearly delineates the boundary.

**Blocked name list.** Names of public figures' children and other sensitive names are blocked from use as character names.

### 14.4 Encryption Architecture

Children's photos: AES-256 end-to-end encryption. At-rest encryption with user-specific keys managed in AWS KMS. Face embeddings: homomorphic encryption in Qdrant enabling similarity search without decryption. Voice recordings: AES-256 encryption with user-specific keys. Voice clones: encrypted at rest, access controlled per user. All data in transit: TLS 1.3.

### 14.5 Audit and Compliance

Complete audit log for every operation involving children's data: who uploaded a photo, when, what processing was performed, when it will be deleted, when a face embedding was created, accessed, or deleted. Quarterly penetration testing. SOC 2 Type II compliance target for Year 2. Annual COPPA compliance review.

### 14.6 Anti-Abuse Measures

Rate limiting at Edge level. Prompt injection detection. Anomaly detection on usage patterns (sudden spike in book creation, unusual photo uploads). Blocked name list for public figures' children. Photo verification: the system can request a selfie of parent and child together for high-risk operations. Abuse reporting mechanism for marketplace content. IP-based fraud detection for gift card purchases.

---

## Chapter 15 — Localization, Bilingual Support, and Cultural Sensitivity

### 15.1 Localization Infrastructure

Day-1 languages: Hebrew (default) and English. Within 6 months: Arabic, Russian, French, Spanish. Locale detection priority: user preference, browser Accept-Language, geographic default. Direction mapping: Hebrew and Arabic are RTL, all others LTR. Currency mapping: ILS for Hebrew, USD for English, EUR for French and Spanish. Locale-aware date formatting. Complete translation files with 200+ keys per language. Language Switcher in the header with flag icons. RTL testing: a development-mode component outlines any element using physical CSS properties (left/right) with a red border.

### 15.2 Bilingual Books

The Bilingual Adaptation Agent (A-11) produces cultural adaptation rather than mechanical translation. Two layout options: "Side by Side" (primary language page facing secondary language page) and "Sequential" (primary language page followed by same content in secondary language on the next page). The Illustration Layout Agent handles mixed RTL/LTR layouts correctly.

### 15.3 Cultural Sensitivity

The Cultural Sensitivity Agent (A-10) checks food references, clothing, holiday appropriateness, family structure, gender pronouns, and stereotype prevention. The CulturalReviewPanel presents warnings to the parent with "Keep As Is" and "Change It" options — the system never blocks silently.

### 15.4 Seasonal Content Engine

The engine is calendar-aware and returns recommendations based on upcoming holidays (within 3 weeks), school events, seasons, and life events. Content is filtered by cultural preferences — only relevant holidays appear. Push reminders fire one week before events.

### 15.5 Special Cases Coverage

**Children with non-Latin/non-Hebrew names.** Unicode validation, correct rendering in all illustration styles (name on cover), TTS pronunciation guidance for names in any script.

**Children with physical characteristics.** Optional physical traits field in child profile: wheelchair, glasses, hearing aid, custom notes. Art Director Agent incorporates these naturally and positively into all illustrations.

**Children without photos.** Complete flow without photos using an Avatar Builder (skin tone, hair color/style, eye color, glasses, accessories) as a fallback. The avatar is rendered in the chosen illustration style.

**Mixed RTL/LTR text.** `unicode-bidi: embed` on foreign language spans. Dedicated testing for mixed-direction typography.

**Sensitive topics.** Three to five templates for loss, divorce, moving, new sibling, and hospitalization developed in consultation with child psychologists. Extended Parental Guide for sensitive topics.

**Name changes.** Profile name update without losing existing books. Optional book refresh with new name.

**Twins.** Face embedding resolution is sufficient for differentiation. Side-by-side character sheets for twins.

**Deepfake protection.** Verifiable Parental Consent serves as primary protection. Abuse reporting mechanism. Anomaly detection flags unusual patterns (many different children's photos from the same account in a short period).

---

# PART V — DEVELOPMENT EXECUTION

---

## Chapter 16 — Monorepo Structure

```
storymagic/
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
├── .env.example
├── .env.local
├── .env.staging
├── .env.production
├── docker-compose.yml
├── docker-compose.dev.yml
├── Makefile
├── README.md
├── CONTRIBUTING.md
├── LICENSE
│
├── apps/
│   ├── web/                              # Next.js 15 Web Application
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── postcss.config.js
│   │   ├── middleware.ts                  # Edge middleware
│   │   │
│   │   ├── app/
│   │   │   ├── layout.tsx                 # Root layout: providers, fonts
│   │   │   ├── not-found.tsx
│   │   │   ├── error.tsx
│   │   │   ├── loading.tsx
│   │   │   │
│   │   │   ├── [locale]/
│   │   │   │   ├── layout.tsx             # Locale layout: dir, lang, fonts
│   │   │   │   ├── page.tsx               # Landing page (RSC)
│   │   │   │   │
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   ├── register/page.tsx
│   │   │   │   │   ├── forgot-password/page.tsx
│   │   │   │   │   └── reset-password/page.tsx
│   │   │   │   │
│   │   │   │   ├── (app)/                 # Authenticated layout group
│   │   │   │   │   ├── layout.tsx         # App shell: sidebar, header
│   │   │   │   │   │
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │
│   │   │   │   │   ├── children/
│   │   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       ├── page.tsx
│   │   │   │   │   │       └── edit/page.tsx
│   │   │   │   │   │
│   │   │   │   │   ├── books/
│   │   │   │   │   │   ├── create/
│   │   │   │   │   │   │   ├── page.tsx           # Book Creation Wizard
│   │   │   │   │   │   │   ├── quick/page.tsx     # Quick Create (1 page)
│   │   │   │   │   │   │   └── together/page.tsx  # Co-Creation Mode
│   │   │   │   │   │   ├── [id]/
│   │   │   │   │   │   │   ├── page.tsx           # Book Detail
│   │   │   │   │   │   │   ├── read/page.tsx      # Interactive Reader
│   │   │   │   │   │   │   ├── edit/page.tsx      # Book Editor
│   │   │   │   │   │   │   ├── extras/page.tsx    # Ancillary Products
│   │   │   │   │   │   │   └── print/page.tsx     # Print Options + Proof
│   │   │   │   │   │   └── library/page.tsx       # Family Bookshelf
│   │   │   │   │   │
│   │   │   │   │   ├── dreams/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │
│   │   │   │   │   ├── marketplace/
│   │   │   │   │   │   ├── page.tsx               # Browse Templates
│   │   │   │   │   │   ├── [id]/page.tsx          # Template Detail
│   │   │   │   │   │   ├── become-creator/page.tsx
│   │   │   │   │   │   ├── creator/
│   │   │   │   │   │   │   ├── dashboard/page.tsx
│   │   │   │   │   │   │   ├── templates/
│   │   │   │   │   │   │   │   ├── new/page.tsx   # Template Builder
│   │   │   │   │   │   │   │   └── [id]/edit/page.tsx
│   │   │   │   │   │   │   └── earnings/page.tsx
│   │   │   │   │   │
│   │   │   │   │   ├── classroom/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── register/page.tsx
│   │   │   │   │   │   ├── dashboard/page.tsx
│   │   │   │   │   │   └── [classroomId]/
│   │   │   │   │   │       ├── students/page.tsx
│   │   │   │   │   │       └── books/page.tsx
│   │   │   │   │   │
│   │   │   │   │   ├── orders/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [id]/page.tsx
│   │   │   │   │   │
│   │   │   │   │   ├── settings/
│   │   │   │   │   │   ├── page.tsx               # General Settings
│   │   │   │   │   │   ├── profile/page.tsx
│   │   │   │   │   │   ├── voices/page.tsx        # Family Voice Library
│   │   │   │   │   │   ├── subscription/page.tsx
│   │   │   │   │   │   ├── accessibility/page.tsx
│   │   │   │   │   │   ├── privacy/page.tsx       # Data download/delete
│   │   │   │   │   │   └── referral/page.tsx
│   │   │   │   │   │
│   │   │   │   │   └── notifications/page.tsx
│   │   │   │   │
│   │   │   │   ├── (public)/                      # Public pages (RSC)
│   │   │   │   │   ├── pricing/page.tsx
│   │   │   │   │   ├── gift/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── redeem/[code]/page.tsx
│   │   │   │   │   ├── ar/[bookId]/[pageNumber]/page.tsx
│   │   │   │   │   ├── about/page.tsx
│   │   │   │   │   ├── privacy/page.tsx
│   │   │   │   │   ├── terms/page.tsx
│   │   │   │   │   └── consent/[token]/page.tsx   # Classroom consent
│   │   │   │   │
│   │   │   │   └── (admin)/
│   │   │   │       ├── layout.tsx                 # Admin layout
│   │   │   │       ├── prompts/page.tsx
│   │   │   │       ├── quality/page.tsx
│   │   │   │       ├── analytics/page.tsx
│   │   │   │       └── moderation/page.tsx
│   │   │   │
│   │   │   └── api/                               # BFF API Routes
│   │   │       ├── auth/
│   │   │       │   ├── [...nextauth]/route.ts
│   │   │       │   └── verify-parent/route.ts
│   │   │       ├── books/
│   │   │       │   ├── route.ts
│   │   │       │   ├── [id]/route.ts
│   │   │       │   ├── [id]/progress/route.ts     # SSE stream
│   │   │       │   └── [id]/interactive/route.ts
│   │   │       ├── children/route.ts
│   │   │       ├── illustrations/
│   │   │       │   ├── [id]/edit/route.ts
│   │   │       │   └── [id]/repair/route.ts
│   │   │       ├── voice/route.ts
│   │   │       ├── orders/route.ts
│   │   │       ├── subscriptions/
│   │   │       │   ├── route.ts
│   │   │       │   └── webhook/route.ts
│   │   │       ├── payments/
│   │   │       │   ├── route.ts
│   │   │       │   └── webhook/route.ts
│   │   │       ├── marketplace/route.ts
│   │   │       ├── classroom/route.ts
│   │   │       ├── gifts/route.ts
│   │   │       ├── dreams/route.ts
│   │   │       ├── referral/route.ts
│   │   │       ├── recommendations/route.ts
│   │   │       ├── admin/route.ts
│   │   │       └── health/route.ts
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                                # shadcn/ui primitives
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── slider.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── command.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── carousel.tsx
│   │   │   │   ├── accordion.tsx
│   │   │   │   └── separator.tsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── MobileNav.tsx
│   │   │   │   ├── LanguageSwitcher.tsx
│   │   │   │   ├── ThemeToggle.tsx
│   │   │   │   ├── NotificationBell.tsx
│   │   │   │   └── BreadcrumbNav.tsx
│   │   │   │
│   │   │   ├── shared/
│   │   │   │   ├── ErrorRecovery.tsx
│   │   │   │   ├── AutoSave.tsx
│   │   │   │   ├── RetryWithBackoff.tsx
│   │   │   │   ├── ConnectivityIndicator.tsx
│   │   │   │   ├── SubscriptionGate.tsx
│   │   │   │   ├── BooksRemainingIndicator.tsx
│   │   │   │   ├── ReferralShareButton.tsx
│   │   │   │   ├── NotificationPermission.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── ConfirmationDialog.tsx
│   │   │   │   ├── FileUpload.tsx
│   │   │   │   ├── ImageOptimizer.tsx
│   │   │   │   └── SEOHead.tsx
│   │   │   │
│   │   │   ├── landing/
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── HowItWorks.tsx
│   │   │   │   ├── StyleShowcase.tsx
│   │   │   │   ├── TestimonialCarousel.tsx
│   │   │   │   ├── PricingPreview.tsx
│   │   │   │   ├── SampleBookFlipper.tsx
│   │   │   │   └── CTASection.tsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   ├── ParentalConsentModal.tsx
│   │   │   │   ├── BiometricConsentDisclosure.tsx
│   │   │   │   └── OnboardingSelector.tsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── WelcomeBanner.tsx
│   │   │   │   ├── QuickActions.tsx
│   │   │   │   ├── RecentBooks.tsx
│   │   │   │   ├── ChildProfileCards.tsx
│   │   │   │   ├── SubscriptionCard.tsx
│   │   │   │   ├── RecommendationCards.tsx
│   │   │   │   ├── DraftRecoveryBanner.tsx
│   │   │   │   ├── SeasonalSuggestion.tsx
│   │   │   │   └── ReadingStats.tsx
│   │   │   │
│   │   │   ├── children/
│   │   │   │   ├── ChildProfileForm.tsx
│   │   │   │   ├── PhotoUploader.tsx
│   │   │   │   ├── FaceDetectionOverlay.tsx
│   │   │   │   ├── FaceQualityFeedback.tsx
│   │   │   │   ├── AvatarBuilder.tsx
│   │   │   │   ├── PhysicalTraitsForm.tsx
│   │   │   │   ├── PreferencesForm.tsx
│   │   │   │   ├── FamilyStructureSelector.tsx
│   │   │   │   └── CulturalPreferencesForm.tsx
│   │   │   │
│   │   │   ├── book-creation/
│   │   │   │   ├── CreationWizard.tsx
│   │   │   │   ├── QuickCreateForm.tsx
│   │   │   │   ├── PromptBuilder.tsx
│   │   │   │   ├── MoodSelector.tsx
│   │   │   │   ├── StyleSelector.tsx
│   │   │   │   ├── StylePreviewCard.tsx
│   │   │   │   ├── ChildSelector.tsx
│   │   │   │   ├── MultiChildSelector.tsx
│   │   │   │   ├── OptionsPanel.tsx
│   │   │   │   ├── StoryPreview.tsx
│   │   │   │   ├── StoryStreamingDisplay.tsx
│   │   │   │   ├── ConversationalEditor.tsx
│   │   │   │   ├── IllustrationEditor.tsx
│   │   │   │   ├── MagicMomentExperience.tsx
│   │   │   │   ├── MagicPhaseTyping.tsx
│   │   │   │   ├── MagicPhaseTransform.tsx
│   │   │   │   ├── MagicPhasePainting.tsx
│   │   │   │   ├── MagicPhaseAssembly.tsx
│   │   │   │   ├── MagicPhaseReveal.tsx
│   │   │   │   ├── EarlyPeek.tsx
│   │   │   │   ├── FactTicker.tsx
│   │   │   │   ├── SocialProofCounter.tsx
│   │   │   │   ├── SharePreviewButton.tsx
│   │   │   │   ├── BookPreview.tsx
│   │   │   │   ├── PageFlipViewer.tsx
│   │   │   │   ├── BilingualModeSelector.tsx
│   │   │   │   ├── CulturalReviewPanel.tsx
│   │   │   │   └── GenerationProgressTracker.tsx
│   │   │   │
│   │   │   ├── reader/
│   │   │   │   ├── InteractiveBookReader.tsx
│   │   │   │   ├── ReaderModeSelector.tsx
│   │   │   │   ├── PageRenderer.tsx
│   │   │   │   ├── PageAnimationLayer.tsx
│   │   │   │   ├── ParticleSystem.tsx           # Three.js WebGPU
│   │   │   │   ├── ParticleSystemFallback.tsx   # Canvas fallback
│   │   │   │   ├── KaraokeReader.tsx
│   │   │   │   ├── WordHighlighter.tsx
│   │   │   │   ├── InteractiveElements.tsx
│   │   │   │   ├── TappableObject.tsx
│   │   │   │   ├── FunFactBubble.tsx
│   │   │   │   ├── NightMode.tsx
│   │   │   │   ├── EndOfBookCelebration.tsx
│   │   │   │   ├── QuizQuestion.tsx
│   │   │   │   ├── ReadingBuddy.tsx
│   │   │   │   ├── ReadingBuddyQuestion.tsx
│   │   │   │   ├── ReaderSettingsPanel.tsx
│   │   │   │   ├── ReadingSpeedSlider.tsx
│   │   │   │   ├── BehindTheStory.tsx
│   │   │   │   ├── NeuroInclusiveModes.tsx
│   │   │   │   ├── DyslexiaMode.tsx
│   │   │   │   ├── ADHDMode.tsx
│   │   │   │   ├── AutismMode.tsx
│   │   │   │   ├── ReadingPreferencesContext.tsx
│   │   │   │   ├── OfflineDownloadButton.tsx
│   │   │   │   └── ReadingAnalytics.tsx
│   │   │   │
│   │   │   ├── voice/
│   │   │   │   ├── VoiceSelector.tsx
│   │   │   │   ├── VoicePreviewPlayer.tsx
│   │   │   │   ├── FamilyVoiceRecorder.tsx
│   │   │   │   ├── RecordingQualityFeedback.tsx
│   │   │   │   ├── VoiceNarrationPlayer.tsx
│   │   │   │   ├── AudioWaveform.tsx
│   │   │   │   └── VoiceCloneStatus.tsx
│   │   │   │
│   │   │   ├── co-creation/
│   │   │   │   ├── CoCreationWizard.tsx
│   │   │   │   ├── SparkyMascot.tsx
│   │   │   │   ├── SparkyChatBubble.tsx
│   │   │   │   ├── VoiceInteractionProvider.tsx
│   │   │   │   ├── StoryChoiceCard.tsx
│   │   │   │   ├── ChoiceGrid.tsx
│   │   │   │   └── CreationJourneyMap.tsx
│   │   │   │
│   │   │   ├── dreams/
│   │   │   │   ├── DreamRecorder.tsx
│   │   │   │   ├── DreamCard.tsx
│   │   │   │   ├── DreamTimeline.tsx
│   │   │   │   └── DreamToBookButton.tsx
│   │   │   │
│   │   │   ├── library/
│   │   │   │   ├── FamilyBookshelf.tsx
│   │   │   │   ├── BookshelfShelf.tsx
│   │   │   │   ├── BookSpine.tsx
│   │   │   │   ├── StoryWorldMap.tsx
│   │   │   │   ├── MapLocation.tsx
│   │   │   │   ├── LibraryViewToggle.tsx
│   │   │   │   ├── LivingBookBadge.tsx
│   │   │   │   ├── LivingBookTimeline.tsx
│   │   │   │   ├── LivingBookToggle.tsx
│   │   │   │   ├── ReadingCornerBackground.tsx
│   │   │   │   ├── SeasonalBookshelfTheme.tsx
│   │   │   │   └── BookDNAPattern.tsx
│   │   │   │
│   │   │   ├── marketplace/
│   │   │   │   ├── TemplateGrid.tsx
│   │   │   │   ├── TemplateCard.tsx
│   │   │   │   ├── FilterSidebar.tsx
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── ReviewSection.tsx
│   │   │   │   ├── ReviewForm.tsx
│   │   │   │   └── ReportButton.tsx
│   │   │   │
│   │   │   ├── creator/
│   │   │   │   ├── CreatorApplicationForm.tsx
│   │   │   │   ├── TemplateBuilder.tsx
│   │   │   │   ├── SceneEditor.tsx
│   │   │   │   ├── PlaceholderInserter.tsx
│   │   │   │   ├── TemplatePreview.tsx
│   │   │   │   ├── CreatorDashboard.tsx
│   │   │   │   ├── EarningsChart.tsx
│   │   │   │   ├── SalesTable.tsx
│   │   │   │   └── PayoutRequest.tsx
│   │   │   │
│   │   │   ├── classroom/
│   │   │   │   ├── ClassroomRegistration.tsx
│   │   │   │   ├── StudentRoster.tsx
│   │   │   │   ├── ConsentStatusTable.tsx
│   │   │   │   ├── ConsentForm.tsx
│   │   │   │   ├── ClassBookCreator.tsx
│   │   │   │   ├── StudentOfTheWeek.tsx
│   │   │   │   └── TeacherDashboard.tsx
│   │   │   │
│   │   │   ├── orders/
│   │   │   │   ├── OrderCard.tsx
│   │   │   │   ├── OrderTracker.tsx
│   │   │   │   ├── TrackingTimeline.tsx
│   │   │   │   ├── PrintOptions.tsx
│   │   │   │   ├── SoftProofViewer.tsx
│   │   │   │   └── DedicationEditor.tsx
│   │   │   │
│   │   │   ├── pricing/
│   │   │   │   ├── PricingTable.tsx
│   │   │   │   ├── PlanCard.tsx
│   │   │   │   ├── FeatureComparison.tsx
│   │   │   │   └── CurrencyToggle.tsx
│   │   │   │
│   │   │   ├── gifts/
│   │   │   │   ├── GiftPurchaseFlow.tsx
│   │   │   │   ├── GiftMessageEditor.tsx
│   │   │   │   ├── GiftDeliveryScheduler.tsx
│   │   │   │   ├── GiftRedeemExperience.tsx
│   │   │   │   └── UnwrappingAnimation.tsx
│   │   │   │
│   │   │   ├── ar/
│   │   │   │   ├── ARViewer.tsx
│   │   │   │   ├── ARCharacterOverlay.tsx
│   │   │   │   └── ARCaptureButton.tsx
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── ProfileForm.tsx
│   │   │   │   ├── AccessibilitySettings.tsx
│   │   │   │   ├── PrivacyControls.tsx
│   │   │   │   ├── DataExportButton.tsx
│   │   │   │   ├── DeleteAccountButton.tsx
│   │   │   │   └── SubscriptionManager.tsx
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── PromptVersionManager.tsx
│   │   │   │   ├── PromptTestRunner.tsx
│   │   │   │   ├── QualityDashboard.tsx
│   │   │   │   ├── AnalyticsDashboard.tsx
│   │   │   │   ├── ModerationQueue.tsx
│   │   │   │   └── SystemHealth.tsx
│   │   │   │
│   │   │   └── dev/
│   │   │       ├── RTLChecker.tsx
│   │   │       └── PerformanceBudgetOverlay.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useBookGeneration.ts
│   │   │   ├── useBookGenerationSSE.ts
│   │   │   ├── useFaceDetection.ts
│   │   │   ├── useFaceQuality.ts
│   │   │   ├── useOfflineBook.ts
│   │   │   ├── useVoiceSynthesis.ts
│   │   │   ├── useSpeechRecognition.ts
│   │   │   ├── useSubscription.ts
│   │   │   ├── useAutoSave.ts
│   │   │   ├── useAnalytics.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   ├── useNightMode.ts
│   │   │   ├── useReadingProgress.ts
│   │   │   ├── useConnectivity.ts
│   │   │   ├── useWebGPU.ts
│   │   │   ├── useParticleSystem.ts
│   │   │   ├── usePerformanceBudget.ts
│   │   │   └── useLocale.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── api-client.ts                     # Auto-generated from OpenAPI
│   │   │   ├── auth/
│   │   │   │   ├── session.ts
│   │   │   │   └── guards.ts
│   │   │   ├── edge/
│   │   │   │   ├── locale-detection.ts
│   │   │   │   ├── rate-limiter.ts
│   │   │   │   └── security-headers.ts
│   │   │   ├── face-detection/
│   │   │   │   ├── blazeface-client.ts
│   │   │   │   ├── quality-scorer.ts
│   │   │   │   └── image-enhancer.ts
│   │   │   ├── reader/
│   │   │   │   ├── particle-engine.ts             # Three.js WebGPU
│   │   │   │   ├── particle-engine-canvas.ts      # Canvas fallback
│   │   │   │   ├── animation-presets.ts
│   │   │   │   ├── audio-controller.ts
│   │   │   │   ├── karaoke-engine.ts
│   │   │   │   └── night-mode-controller.ts
│   │   │   ├── offline/
│   │   │   │   ├── service-worker-registration.ts
│   │   │   │   ├── offline-book-manager.ts
│   │   │   │   └── sync-manager.ts
│   │   │   ├── analytics/
│   │   │   │   ├── event-tracker.ts
│   │   │   │   └── implicit-signals.ts
│   │   │   ├── monitoring/
│   │   │   │   ├── web-vitals.ts
│   │   │   │   └── performance-budget.ts
│   │   │   ├── errors/
│   │   │   │   ├── error-types.ts
│   │   │   │   └── draft-recovery.ts
│   │   │   ├── stripe/
│   │   │   │   ├── client.ts
│   │   │   │   └── webhook-handler.ts
│   │   │   └── utils/
│   │   │       ├── formatting.ts
│   │   │       ├── validation.ts
│   │   │       └── constants.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── fonts.css
│   │   │   ├── dyslexia.css
│   │   │   └── print.css
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                          # Re-exports from shared-types
│   │   │
│   │   ├── i18n/
│   │   │   ├── config.ts
│   │   │   ├── request.ts
│   │   │   └── messages/
│   │   │       ├── he.json
│   │   │       ├── en.json
│   │   │       ├── ar.json
│   │   │       ├── ru.json
│   │   │       ├── fr.json
│   │   │       └── es.json
│   │   │
│   │   ├── public/
│   │   │   ├── sw.js                              # Service Worker
│   │   │   ├── manifest.json                      # PWA manifest
│   │   │   ├── data/
│   │   │   │   └── word-embeddings-he.json
│   │   │   ├── audio/
│   │   │   │   └── sfx-atlas.mp3
│   │   │   ├── fonts/
│   │   │   │   ├── NotoSansHebrew-Regular.woff2
│   │   │   │   ├── NotoSansHebrew-Bold.woff2
│   │   │   │   ├── NotoSans-Regular.woff2
│   │   │   │   ├── NotoSans-Bold.woff2
│   │   │   │   ├── OpenDyslexic-Regular.woff2
│   │   │   │   └── OpenDyslexic-Bold.woff2
│   │   │   ├── images/
│   │   │   │   ├── style-previews/
│   │   │   │   ├── mascots/
│   │   │   │   │   ├── sparky/
│   │   │   │   │   └── reading-buddy/
│   │   │   │   ├── error-illustrations/
│   │   │   │   └── onboarding/
│   │   │   └── animations/
│   │   │       ├── confetti.lottie
│   │   │       ├── unwrap-gift.lottie
│   │   │       ├── sparkle-transform.lottie
│   │   │       └── paint-splash.lottie
│   │   │
│   │   └── tests/
│   │       ├── e2e/                               # Playwright
│   │       │   ├── book-creation.spec.ts
│   │       │   ├── reading-experience.spec.ts
│   │       │   ├── co-creation.spec.ts
│   │       │   ├── marketplace.spec.ts
│   │       │   ├── classroom.spec.ts
│   │       │   ├── gift-flow.spec.ts
│   │       │   ├── subscription.spec.ts
│   │       │   ├── accessibility.spec.ts
│   │       │   └── rtl-rendering.spec.ts
│   │       ├── integration/
│   │       │   ├── api-client.test.ts
│   │       │   ├── auth-flow.test.ts
│   │       │   └── payment-flow.test.ts
│   │       └── unit/
│   │           ├── components/
│   │           └── hooks/
│   │
│   ├── api/                                       # FastAPI Backend
│   │   ├── Dockerfile
│   │   ├── pyproject.toml
│   │   ├── poetry.lock
│   │   ├── alembic.ini
│   │   ├── alembic/
│   │   │   └── versions/
│   │   │
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── main.py                            # FastAPI app factory
│   │   │   ├── config.py                          # Settings via pydantic-settings
│   │   │   ├── dependencies.py                    # Dependency injection
│   │   │   │
│   │   │   ├── models/                            # SQLAlchemy models
│   │   │   │   ├── __init__.py
│   │   │   │   ├── user.py
│   │   │   │   ├── child.py
│   │   │   │   ├── book.py
│   │   │   │   ├── page.py
│   │   │   │   ├── event.py
│   │   │   │   ├── order.py
│   │   │   │   ├── template.py
│   │   │   │   ├── subscription.py
│   │   │   │   ├── voice.py
│   │   │   │   ├── living_book.py
│   │   │   │   ├── dream.py
│   │   │   │   ├── gift.py
│   │   │   │   ├── referral.py
│   │   │   │   ├── classroom.py
│   │   │   │   ├── creator.py
│   │   │   │   ├── prompt_version.py
│   │   │   │   ├── notification.py
│   │   │   │   ├── draft.py
│   │   │   │   └── abuse_report.py
│   │   │   │
│   │   │   ├── schemas/                           # Pydantic schemas (API contracts)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── user.py
│   │   │   │   ├── child.py
│   │   │   │   ├── book.py
│   │   │   │   ├── page.py
│   │   │   │   ├── order.py
│   │   │   │   ├── template.py
│   │   │   │   ├── subscription.py
│   │   │   │   ├── voice.py
│   │   │   │   ├── dream.py
│   │   │   │   ├── gift.py
│   │   │   │   ├── classroom.py
│   │   │   │   ├── creator.py
│   │   │   │   ├── recommendation.py
│   │   │   │   └── common.py
│   │   │   │
│   │   │   ├── routers/                           # API route handlers
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── children.py
│   │   │   │   ├── stories.py
│   │   │   │   ├── illustrations.py
│   │   │   │   ├── voice.py
│   │   │   │   ├── books.py
│   │   │   │   ├── orders.py
│   │   │   │   ├── print.py
│   │   │   │   ├── subscriptions.py
│   │   │   │   ├── payments.py
│   │   │   │   ├── marketplace.py
│   │   │   │   ├── classroom.py
│   │   │   │   ├── gifts.py
│   │   │   │   ├── dreams.py
│   │   │   │   ├── referral.py
│   │   │   │   ├── recommendations.py
│   │   │   │   ├── admin.py
│   │   │   │   └── health.py
│   │   │   │
│   │   │   ├── services/                          # Business logic services
│   │   │   │   ├── __init__.py
│   │   │   │   ├── user_service.py
│   │   │   │   ├── child_service.py
│   │   │   │   ├── book_service.py
│   │   │   │   ├── order_service.py
│   │   │   │   ├── payment_service.py
│   │   │   │   ├── print_service.py
│   │   │   │   ├── subscription_service.py
│   │   │   │   ├── voice_service.py
│   │   │   │   ├── gift_service.py
│   │   │   │   ├── classroom_service.py
│   │   │   │   ├── creator_service.py
│   │   │   │   ├── recommendation_service.py
│   │   │   │   ├── notification_service.py
│   │   │   │   ├── analytics_service.py
│   │   │   │   └── moderation_service.py
│   │   │   │
│   │   │   ├── ai/                                # AI System (SINGLE SOURCE OF TRUTH)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── providers/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── base.py                    # Provider interfaces
│   │   │   │   │   ├── registry.py                # Provider registry
│   │   │   │   │   ├── router.py                  # AI router with fallback
│   │   │   │   │   ├── circuit_breaker.py
│   │   │   │   │   ├── claude_text.py
│   │   │   │   │   ├── gemini_text.py
│   │   │   │   │   ├── openai_text.py
│   │   │   │   │   ├── comfyui_image.py
│   │   │   │   │   ├── flux_kontext_image.py
│   │   │   │   │   ├── elevenlabs_voice.py
│   │   │   │   │   ├── cartesia_voice.py
│   │   │   │   │   ├── fish_audio_voice.py
│   │   │   │   │   ├── insightface_face.py
│   │   │   │   │   ├── mock_text.py
│   │   │   │   │   ├── mock_image.py
│   │   │   │   │   └── mock_voice.py
│   │   │   │   │
│   │   │   │   ├── agents/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── base_agent.py
│   │   │   │   │   ├── story_architect.py         # A-01
│   │   │   │   │   ├── hebrew_poet.py             # A-02
│   │   │   │   │   ├── age_adaptation.py          # A-03
│   │   │   │   │   ├── art_director.py            # A-04
│   │   │   │   │   ├── emotional_tone.py          # A-05
│   │   │   │   │   ├── illustration_layout.py     # A-06
│   │   │   │   │   ├── quality_critic.py          # A-07
│   │   │   │   │   ├── consistency_guardian.py     # A-08
│   │   │   │   │   ├── parental_guidance.py       # A-09
│   │   │   │   │   ├── cultural_sensitivity.py    # A-10
│   │   │   │   │   ├── bilingual_adaptation.py    # A-11
│   │   │   │   │   ├── accessibility_adaptation.py # A-12
│   │   │   │   │   ├── narration_director.py      # A-13
│   │   │   │   │   ├── illustration_repair.py     # A-14
│   │   │   │   │   └── recommendation.py          # A-15
│   │   │   │   │
│   │   │   │   ├── orchestrator/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── graph.py                   # LangGraph state graph
│   │   │   │   │   ├── state.py                   # Workflow state definition
│   │   │   │   │   ├── nodes.py                   # Graph node definitions
│   │   │   │   │   └── conditions.py              # Edge conditions
│   │   │   │   │
│   │   │   │   ├── prompts/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── manager.py                 # Prompt version manager
│   │   │   │   │   ├── tester.py                  # Prompt regression tester
│   │   │   │   │   └── templates/
│   │   │   │   │       ├── story_architect_v1.txt
│   │   │   │   │       ├── hebrew_poet_v1.txt
│   │   │   │   │       ├── age_adaptation_v1.txt
│   │   │   │   │       ├── art_director_v1.txt
│   │   │   │   │       ├── emotional_tone_v1.txt
│   │   │   │   │       ├── quality_critic_v1.txt
│   │   │   │   │       ├── consistency_guardian_v1.txt
│   │   │   │   │       ├── cultural_sensitivity_v1.txt
│   │   │   │   │       ├── bilingual_adaptation_v1.txt
│   │   │   │   │       ├── accessibility_adaptation_v1.txt
│   │   │   │   │       └── narration_director_v1.txt
│   │   │   │   │
│   │   │   │   └── eval/
│   │   │   │       ├── __init__.py
│   │   │   │       ├── evaluator.py               # Eval framework
│   │   │   │       ├── rubrics.py                 # Quality rubrics
│   │   │   │       └── test_cases/
│   │   │   │           ├── story_generation.json
│   │   │   │           ├── age_adaptation.json
│   │   │   │           └── cultural_sensitivity.json
│   │   │   │
│   │   │   ├── quality/                           # Quality control pipeline
│   │   │   │   ├── __init__.py
│   │   │   │   ├── safety_gate.py
│   │   │   │   ├── technical_quality_gate.py
│   │   │   │   ├── consistency_gate.py
│   │   │   │   ├── likeness_gate.py
│   │   │   │   ├── pipeline.py
│   │   │   │   └── blocklists/
│   │   │   │       ├── he_blocked.txt
│   │   │   │       ├── en_blocked.txt
│   │   │   │       └── blocked_names.txt
│   │   │   │
│   │   │   ├── rhyme/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── hebrew_dictionary.py
│   │   │   │   ├── rhyme_validator.py
│   │   │   │   └── rhyme_rag.py                   # RAG retrieval for rhymes
│   │   │   │
│   │   │   ├── print/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── pdf_assembler.py
│   │   │   │   ├── provider_interface.py
│   │   │   │   ├── router.py
│   │   │   │   ├── qr_generator.py
│   │   │   │   ├── soft_proofer.py
│   │   │   │   └── providers/
│   │   │   │       ├── lulu.py
│   │   │   │       ├── peecho.py
│   │   │   │       ├── blurb.py
│   │   │   │       └── mock_print.py
│   │   │   │
│   │   │   ├── workflows/                         # Temporal.io workflows
│   │   │   │   ├── __init__.py
│   │   │   │   ├── book_generation.py
│   │   │   │   ├── voice_generation.py
│   │   │   │   ├── print_order.py
│   │   │   │   ├── voice_cloning.py
│   │   │   │   ├── photo_processing.py
│   │   │   │   └── activities.py
│   │   │   │
│   │   │   ├── middleware/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── rate_limiter.py
│   │   │   │   ├── audit_log.py
│   │   │   │   ├── cors.py
│   │   │   │   └── request_tracing.py
│   │   │   │
│   │   │   ├── encryption/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── key_manager.py
│   │   │   │   ├── crypto_shredding.py
│   │   │   │   └── homomorphic.py
│   │   │   │
│   │   │   └── utils/
│   │   │       ├── __init__.py
│   │   │       ├── events.py
│   │   │       ├── pagination.py
│   │   │       └── helpers.py
│   │   │
│   │   ├── worker/                                # Temporal.io worker
│   │   │   ├── __init__.py
│   │   │   └── main.py
│   │   │
│   │   └── tests/
│   │       ├── unit/
│   │       │   ├── test_agents/
│   │       │   ├── test_quality/
│   │       │   ├── test_services/
│   │       │   └── test_encryption/
│   │       ├── integration/
│   │       │   ├── test_orchestrator.py
│   │       │   ├── test_print_pipeline.py
│   │       │   └── test_payment_flow.py
│   │       └── conftest.py
│   │
│   └── mobile/                                    # React Native + Expo
│       ├── app.json
│       ├── App.tsx
│       ├── eas.json
│       ├── babel.config.js
│       └── src/
│           ├── screens/
│           ├── components/
│           ├── navigation/
│           ├── hooks/
│           ├── services/
│           └── utils/
│
├── packages/
│   ├── shared-types/                              # Shared TypeScript types
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── user.ts
│   │       ├── child.ts
│   │       ├── book.ts
│   │       ├── page.ts
│   │       ├── order.ts
│   │       ├── template.ts
│   │       ├── subscription.ts
│   │       ├── voice.ts
│   │       ├── quality.ts
│   │       ├── analytics.ts
│   │       ├── ai-providers.ts
│   │       ├── agents.ts
│   │       └── common.ts
│   │
│   ├── shared-utils/                              # Shared utilities
│   │   ├── package.json
│   │   └── src/
│   │       ├── validation.ts
│   │       ├── formatting.ts
│   │       └── constants.ts
│   │
│   └── eslint-config/                             # Shared ESLint config
│       ├── package.json
│       ├── base.js
│       ├── rtl-rules.js                           # Ban physical CSS properties
│       └── accessibility-rules.js
│
├── infrastructure/
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── modules/
│   │   │   ├── ecs/
│   │   │   ├── rds/
│   │   │   ├── redis/
│   │   │   ├── s3/
│   │   │   ├── cloudfront/
│   │   │   ├── kms/
│   │   │   └── monitoring/
│   │   ├── environments/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   └── state.tf
│   │
│   ├── docker/
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.worker
│   │   └── Dockerfile.temporal
│   │
│   ├── temporal/
│   │   ├── docker-compose.temporal.yml
│   │   └── config/
│   │
│   └── k8s/                                       # Kubernetes manifests (EKS)
│       ├── base/
│       ├── staging/
│       └── production/
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 20260101000001_users.sql
│   │   ├── 20260101000002_children_profiles.sql
│   │   ├── 20260101000003_story_templates.sql
│   │   ├── 20260101000004_generated_books.sql
│   │   ├── 20260101000005_book_pages.sql
│   │   ├── 20260101000006_book_events.sql
│   │   ├── 20260101000007_orders.sql
│   │   ├── 20260101000008_creators.sql
│   │   ├── 20260101000009_subscriptions.sql
│   │   ├── 20260101000010_voice_profiles.sql
│   │   ├── 20260101000011_living_books.sql
│   │   ├── 20260101000012_dreams.sql
│   │   ├── 20260101000013_gift_cards.sql
│   │   ├── 20260101000014_referrals.sql
│   │   ├── 20260101000015_classrooms.sql
│   │   ├── 20260101000016_prompt_versions.sql
│   │   ├── 20260101000017_analytics_events.sql
│   │   ├── 20260101000018_notifications.sql
│   │   ├── 20260101000019_user_drafts.sql
│   │   ├── 20260101000020_creator_transactions.sql
│   │   ├── 20260101000021_abuse_reports.sql
│   │   └── 20260101000022_indexes_and_partitions.sql
│   └── seed.sql
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                                 # Lint, type-check, test
│   │   ├── e2e.yml                                # Playwright E2E
│   │   ├── deploy-staging.yml
│   │   ├── deploy-production.yml
│   │   ├── prompt-regression.yml                  # Prompt test suite
│   │   ├── visual-regression.yml                  # Percy/Chromatic
│   │   ├── accessibility-audit.yml                # axe-core
│   │   ├── performance-budget.yml                 # Lighthouse CI
│   │   └── security-scan.yml                      # Dependency audit
│   ├── CODEOWNERS
│   └── pull_request_template.md
│
└── docs/
    ├── architecture.md
    ├── api-reference.md
    ├── ai-agents.md
    ├── quality-pipeline.md
    ├── coppa-compliance.md
    ├── deployment.md
    ├── contributing.md
    ├── testing-strategy.md
    ├── performance-budget.md
    ├── disaster-recovery.md
    ├── cost-model.md
    └── adr/                                       # Architecture Decision Records
        ├── 001-langgraph-orchestration.md
        ├── 002-temporal-workflow-engine.md
        ├── 003-python-only-agents.md
        ├── 004-cqrs-over-event-sourcing.md
        ├── 005-webgpu-particle-system.md
        ├── 006-provider-abstraction-layer.md
        ├── 007-face-embedding-coppa.md
        └── 008-multi-tier-gpu-strategy.md
```

---

## Chapter 17 — Development Roadmap

### Phase 1 — MVP Foundation (Weeks 1–8)

Initialize Turborepo monorepo with all packages. Set up Docker Compose for local development including PostgreSQL, Redis, and Temporal.io. Build shared types package with all TypeScript interfaces.

Build the FastAPI backend skeleton: all routers, schemas, models, database migrations, authentication with JWT, and Stripe payment integration. Implement the AI Provider Abstraction Layer with mock providers that return realistic but pre-generated content.

Build the Next.js web application: landing page (RSC), auth pages, dashboard, child profile creation with client-side face detection (TensorFlow.js BlazeFace), Book Creation Wizard (6 steps with mock AI generation), basic book reader (text plus placeholder illustrations), settings page, and i18n setup with Hebrew and English.

Implement the Quality Pipeline foundation: SafetyGate with blocklists, basic TechnicalQualityGate structure. Implement Event logging (CQRS append-only events). Implement AutoSave and Error Recovery. Set up CI/CD with GitHub Actions, Docker builds, and Terraform for staging environment.

All pages operational. User can register, create a child profile, go through the entire book creation wizard, see a mock-generated book, and make a payment.

### Phase 2 — AI Integration (Weeks 9–16)

Integrate real AI providers: Claude API for story generation, Flux Kontext via ComfyUI for illustrations, ElevenLabs for voice narration. Implement all 15 AI agents in Python. Build the LangGraph orchestrator with Temporal.io workflow. Build the Character Sheet Pipeline. Implement five or more illustration styles.

Build the full Quality Pipeline: all four gates operational. Implement Prompt Versioning and Regression Testing. Build Performance Markup generation and voice narration with multiple voices. Implement conversational text editing and illustration editing. Build the Magic Moment Experience with all five phases and Early Peek.

Implement Stripe subscriptions (monthly and yearly). Build the print pipeline with Lulu API integration. Begin React Native mobile app development.

### Phase 3 — Premium Experience (Weeks 17–24)

Build the full Interactive Reader: ambient animations with Three.js WebGPU particle system, Karaoke Mode, tappable interactive elements, Night Mode, end-of-book celebration. Build Reading Buddy AI.

Implement Voice Cloning and Family Voice Library. Build all three Neuro-Inclusive Modes (dyslexia, ADHD, autism spectrum). Build Co-Creation Mode with Sparky mascot and voice interaction. Build Dream Journal.

Build Living Book system. Build Creator Marketplace with template builder and revenue sharing. Build Classroom Edition. Build Gift Cards and Referral Program. Build Family Bookshelf with both shelf and Story World Map views.

Launch React Native mobile app on iOS and Android.

### Phase 4 — Scale (Weeks 25–36)

Add 10+ languages with the Bilingual Adaptation Agent. Expand the global print network (Lulu plus Peecho plus Blurb with regional routing). Build the full Cultural Sensitivity system. Build the Seasonal Content Engine.

Build AR Experience. Build the AI Recommendation Engine. Build Story Remix. Build ancillary products (coloring pages, stickers, posters, invitations, standalone audiobook). Build complete Offline-First system.

Build comprehensive Admin dashboards: quality monitoring, analytics, moderation queue, prompt management. Implement A/B testing infrastructure across all layers. Build the Evaluation Framework for systematic AI output assessment.

Implement advanced monetization: White-Label API, institutional licensing. Pursue SOC 2 Type II compliance. Conduct first penetration test.

---

## Chapter 18 — Development Instructions for Claude-Code

### 18.1 General Principles

Every file must be complete, compilable, and runnable. No placeholders like "// rest of code here" or "// implement similarly" or "pass # TODO." Every function has full implementation.

TypeScript uses strict mode everywhere. Python uses complete type hints on every function signature and return type. All code follows the project's ESLint configuration, including the ban on physical CSS direction properties.

Every component is responsive (mobile-first), supports RTL, uses logical CSS properties, and pulls all user-facing text from i18n translation files.

### 18.2 Build Sequence

Follow this exact sequence. At each step, verify that the entire project compiles and runs before proceeding to the next step.

**Step 1: Monorepo Initialization.** Initialize Turborepo with pnpm workspaces. Set up all three apps (web, api, mobile) and all packages (shared-types, shared-utils, eslint-config). Configure Docker Compose with PostgreSQL 16, Redis 7, and Temporal.io. Create Makefile with common commands. Verify: `pnpm install` succeeds, `docker-compose up` starts all services.

**Step 2: Shared Types Package.** Define all TypeScript interfaces and types in the shared-types package. These are the contract between frontend and backend. Every type must match the database schema exactly. Verify: package builds without errors.

**Step 3: Database Migrations.** Write all SQL migrations for Supabase/PostgreSQL including tables, indexes, partitions, and constraints. Write seed data with sample users, children, templates, and voice presets. Verify: `supabase db push` succeeds, seed data loads.

**Step 4: FastAPI Backend Skeleton.** Set up FastAPI application factory with all routers, middleware (CORS, auth, rate limiting, audit logging, request tracing), and dependency injection. Implement all Pydantic schemas matching shared types. Implement all SQLAlchemy models. Implement all router handlers with proper error handling, pagination, and authentication guards. Implement Stripe integration (checkout, webhooks, customer portal). Verify: `uvicorn app.main:app` starts, all endpoints respond, OpenAPI docs are accessible.

**Step 5: AI Provider Abstraction Layer.** Implement the provider interface, registry, router, and circuit breaker. Implement mock providers for text, image, voice, and face processing that return realistic pre-generated content. Verify: mock providers respond correctly through the router.

**Step 6: Next.js Web Application Foundation.** Set up Next.js 15 with App Router, Tailwind CSS, shadcn/ui, Framer Motion, and next-intl. Build the design system: all shadcn/ui primitives customized with the StoryMagic color palette. Build all layout components (AppShell, Header, Sidebar, Footer, MobileNav). Set up i18n with Hebrew and English translation files containing all 200+ keys. Verify: app runs, all pages render, RTL switching works, dark mode works.

**Step 7: Authentication and User Management.** Build registration, login, forgot/reset password pages and API integration. Build ParentalConsentModal with BiometricConsentDisclosure per COPPA 2025. Build OnboardingSelector (quick/creative/guided). Verify: full auth flow works end-to-end.

**Step 8: Child Profile Management.** Build ChildProfileForm, PhotoUploader with FaceDetectionOverlay and FaceQualityFeedback (TensorFlow.js BlazeFace), AvatarBuilder (fallback for no photos), PhysicalTraitsForm, PreferencesForm including FamilyStructureSelector and CulturalPreferencesForm. Verify: can create child profile with photo upload, face detection works client-side.

**Step 9: Book Creation Wizard.** Build the full 6-step CreationWizard plus QuickCreateForm (1-page flow). Build PromptBuilder with guiding questions. Build MoodSelector, StyleSelector with StylePreviewCard, ChildSelector and MultiChildSelector, OptionsPanel. Build StoryStreamingDisplay that shows text appearing word-by-word. Build ConversationalEditor for natural language editing. Build IllustrationEditor for natural language illustration editing. Build GenerationProgressTracker. Integrate with mock AI providers through FastAPI. Verify: full wizard flow works from prompt to preview with mock content.

**Step 10: Magic Moment Experience.** Build all five phases: MagicPhaseTyping, MagicPhaseTransform, MagicPhasePainting, MagicPhaseAssembly, MagicPhaseReveal. Build EarlyPeek, FactTicker, SocialProofCounter, SharePreviewButton. Build the SSE-based progress tracking from backend to frontend. Verify: magic moment plays with all phase transitions using mock data.

**Step 11: Interactive Book Reader.** Build InteractiveBookReader with ReaderModeSelector, PageRenderer, PageFlipViewer. Build ParticleSystem with Three.js WebGPU for ambient animations (all 6 presets: leaves, stars, bubbles, rain, snow, fireflies) plus ParticleSystemFallback with Canvas. Build KaraokeReader with WordHighlighter. Build InteractiveElements with TappableObject and FunFactBubble. Build NightMode. Build EndOfBookCelebration with confetti animation and QuizQuestion. Build ReaderSettingsPanel with ReadingSpeedSlider. Build all three NeuroInclusiveModes (DyslexiaMode, ADHDMode, AutismMode). Build OfflineDownloadButton. Verify: book reader plays with all modes using mock data.

**Step 12: Reading Buddy.** Build ReadingBuddy (owl mascot) and ReadingBuddyQuestion components. Build age-appropriate question display and encouragement messages. Verify: buddy appears during reading and asks questions.

**Step 13: AI Agents (Python Backend).** Implement all 15 agents in Python with full logic: StoryArchitect, HebrewPoet (with rhyme RAG), AgeAdaptation, ArtDirector, EmotionalTone, IllustrationLayout, QualityCritic (LLM-as-Judge), ConsistencyGuardian, ParentalGuidance, CulturalSensitivity, BilingualAdaptation, AccessibilityAdaptation, NarrationDirector, IllustrationRepair, Recommendation. Each agent uses the Provider Abstraction Layer. Each agent has complete prompt templates. Verify: each agent produces correct output structure with mock providers.

**Step 14: LangGraph Orchestrator.** Build the LangGraph state graph with all nodes (agents), edges (transitions), and conditions (retry loops, quality checks). Define the workflow state. Build the Temporal.io workflow wrapper. Build the SSE progress stream from orchestrator to frontend. Verify: full book generation pipeline runs with mock providers, progress streams to frontend.

**Step 15: Quality Pipeline.** Implement SafetyGate with full blocklists (Hebrew and English). Implement TechnicalQualityGate with blur detection and anomaly check. Implement LikenessGate with cosine similarity. Implement ConsistencyGate with cross-page comparison. Wire all gates into QualityPipeline. Verify: pipeline correctly identifies and flags issues in test content.

**Step 16: Real AI Provider Integration.** Replace mock providers with real integrations: Claude API, Gemini API, ComfyUI/Flux Kontext, ElevenLabs, InsightFace. Build the Character Sheet Pipeline. Configure provider routing and A/B testing. Verify: full book generation with real AI produces quality results.

**Step 17: Voice System.** Build VoiceSelector with VoicePreviewPlayer. Build FamilyVoiceRecorder with RecordingQualityFeedback. Build VoiceNarrationPlayer with AudioWaveform. Build VoiceCloneStatus. Integrate with ElevenLabs voice cloning. Verify: voice narration plays with Performance Markup.

**Step 18: Co-Creation Mode.** Build CoCreationWizard with SparkyMascot, SparkyChatBubble, VoiceInteractionProvider. Build StoryChoiceCard and ChoiceGrid. Build CreationJourneyMap and BehindTheStory page. Verify: co-creation flow works with voice interaction and fallback to tap/type.

**Step 19: Family Bookshelf.** Build FamilyBookshelf with 3D CSS transforms, BookSpine components. Build StoryWorldMap alternative view with MapLocation components. Build LibraryViewToggle. Build LivingBookBadge, LivingBookTimeline, LivingBookToggle. Build ReadingCornerBackground with time-of-day awareness. Build SeasonalBookshelfTheme. Build BookDNAPattern. Verify: bookshelf renders with visual richness.

**Step 20: Dream Journal.** Build DreamRecorder (voice and text input), DreamCard, DreamTimeline, DreamToBookButton. Verify: can record dream and convert to book.

**Step 21: Marketplace.** Build TemplateGrid, TemplateCard, FilterSidebar, SearchBar, ReviewSection, ReviewForm, ReportButton. Build CreatorApplicationForm, TemplateBuilder with SceneEditor and PlaceholderInserter, TemplatePreview. Build CreatorDashboard with EarningsChart, SalesTable, PayoutRequest. Build ModerationQueue in admin. Verify: full creator and marketplace flow works.

**Step 22: Classroom Edition.** Build ClassroomRegistration, StudentRoster, ConsentStatusTable, ConsentForm (parent-facing), ClassBookCreator, StudentOfTheWeek, TeacherDashboard. Verify: classroom flow from registration to consent to book creation.

**Step 23: Subscriptions and Payments.** Build PricingTable with PlanCard and FeatureComparison. Build SubscriptionGate component. Build BooksRemainingIndicator. Build SubscriptionManager in settings. Wire Stripe subscriptions with webhook handling. Verify: subscription purchase, upgrade, downgrade, cancellation all work.

**Step 24: Print Pipeline.** Build PrintOptions, SoftProofViewer, DedicationEditor. Build PDF assembler with CMYK, bleed, crop marks, spine calculation. Integrate Lulu Print API. Build OrderTracker with TrackingTimeline. Verify: can generate print-ready PDF and submit to print provider.

**Step 25: Gift Cards and Referral.** Build GiftPurchaseFlow, GiftMessageEditor, GiftDeliveryScheduler, GiftRedeemExperience with UnwrappingAnimation. Build ReferralShareButton and referral tracking. Verify: full gift purchase and redemption flow.

**Step 26: Localization and Cultural Sensitivity.** Complete all translation files. Build CulturalReviewPanel. Test RTL rendering on every page. Test bilingual book generation. Build SeasonalSuggestion. Verify: full RTL experience is pixel-perfect, bilingual books render correctly.

**Step 27: Analytics and Monitoring.** Implement event tracking throughout the application. Build ReadingStats and ReadingAnalytics for parents. Build admin AnalyticsDashboard and QualityDashboard. Set up OpenTelemetry distributed tracing. Set up Sentry error tracking. Verify: events are captured, dashboards display data.

**Step 28: Offline-First and Edge.** Implement Service Worker with caching strategies. Build OfflineBookManager with IndexedDB storage. Build ConnectivityIndicator. Implement Edge Middleware with all security headers, rate limiting, locale detection. Verify: offline reading works, sync works on reconnection.

**Step 29: Security Hardening.** Implement encryption key management with AWS KMS. Implement Crypto Shredding. Implement complete audit logging for children's data. Implement prompt injection defense. Build PrivacyControls, DataExportButton, DeleteAccountButton in settings. Verify: data export produces correct output, account deletion crypto-shreds all data.

**Step 30: Testing Suite.** Write Playwright E2E tests for all critical flows. Write integration tests for API endpoints. Write unit tests for all agents, quality gates, and business logic. Set up visual regression testing with Percy or Chromatic. Set up accessibility auditing with axe-core in CI. Set up Lighthouse CI for performance budget enforcement. Verify: all tests pass, coverage meets 80%+ target.

**Step 31: Documentation.** Write comprehensive README.md. Write all docs files: architecture, API reference, AI agents guide, quality pipeline, COPPA compliance, deployment guide, contributing guide, testing strategy, performance budget, disaster recovery plan, and cost model. Write all Architecture Decision Records.

**Step 32: Mobile Application.** Build React Native app with Expo. Share types and utilities from shared packages. Implement core screens: auth, dashboard, child profile, book creation (simplified wizard), reader (may use native module for performance), library, settings. Implement push notifications. Implement offline reading with AsyncStorage. Verify: app runs on iOS and Android simulators.

### 18.3 Quality Gates for Each Step

Before proceeding to the next step, every step must pass: TypeScript compiles with zero errors in strict mode. Python type checks pass with mypy. All existing tests pass. No ESLint errors (including RTL rule enforcement). No accessibility violations detected by automated tools. The application starts and renders without console errors. RTL and LTR modes both render correctly.

---

## Chapter 19 — Cost Model

### 19.1 Per-Book Generation Cost

Story generation (Claude API, approximately 3000 tokens input plus 2000 tokens output): $0.35–0.50. Character sheet (4 illustrations on Tier 1 GPU): $0.40. Book illustrations (12 pages on Tier 2 GPU with 1 retry average): $1.20–1.80. Voice narration (ElevenLabs, approximately 5 minutes of audio): $0.20–0.40. Quality pipeline (LLM-as-Judge calls, vision API checks): $0.15–0.25. Infrastructure overhead (compute, storage, CDN): $0.10–0.20. **Total per book: $2.40–3.55.**

### 19.2 Margin Analysis

Digital book at $9.99: margin $6.44–7.59 (64–76%). Monthly subscription at $14.99 for 2 books: margin $7.89–10.19 (53–68%). Yearly subscription at $119.99 for max 24 books: margin $34.79–62.39 (29–52%) — the 24-book cap prevents negative margins. Print book at $34.99 (print cost approximately $8–12): margin $19.44–24.59 (56–70%).

### 19.3 Infrastructure Monthly Costs (Estimated at Scale)

AWS infrastructure (ECS, RDS, Redis, S3, CloudFront): $2,000–4,000. RunPod GPU (variable, scales with usage): $1,000–5,000. Temporal.io (self-hosted on ECS): $200–500. AI API costs (Claude, ElevenLabs, Gemini): scales linearly with books created. Monitoring (Datadog or Grafana Cloud, Sentry, LangSmith): $500–1,000. Third-party services (Stripe fees, Lulu fees): percentage of revenue.

---

## Appendix A — Hebrew Rhyme Dictionary Structure

200+ pairs organized by ending sound. Examples by ending: ending in "ים" (im) — ימים, שמיים, מים, חיים, כוכבים, פרחים, חברים, ציפורים, נמלים, עננים. Ending in "ה" (ah) — שמחה, ברכה, חלומה, נסיכה, ארוכה, גבוהה, יפה, טובה. Ending in "ת" (et/at) — חברות, ארצות, לבבות, כוכבת, מלכות, שמחות, חלומות. Ending in "ור" (or) — אור, דבור, ציפור, תנור, חלון, סיפור. Each pair is stored with topic tags for RAG retrieval.

## Appendix B — Sound Effects Library

Thirty effects mapped to narrative keywords with file references and duration. door → door_creak (1.2s), water/sea/ocean → splash (0.8s), wind → wind_howl (2.0s), bird → bird_chirp (0.5s), magic/spell/wand → magic_sparkle (1.0s), thunder/storm → thunder_rumble (1.5s), laugh → children_laugh (1.0s), footsteps → soft_footsteps (0.6s), bells → gentle_bells (1.2s), rain → rain_drops (2.0s), cat → cat_meow (0.4s), dog → dog_bark (0.3s), horse → horse_gallop (1.5s), dragon → dragon_roar_gentle (1.0s), fairy → fairy_sparkle (0.8s), rocket → rocket_launch (1.5s), splash → water_splash (0.6s), knock → door_knock (0.5s), owl → owl_hoot (0.8s), frog → frog_croak (0.3s), rooster → rooster_crow (1.0s), clock → clock_tick (0.4s), whistle → whistle_blow (0.6s), trumpet → trumpet_fanfare (1.2s), drum → drum_roll (1.5s), guitar → guitar_strum (0.8s), piano → piano_chord (1.0s), harp → harp_glissando (1.5s), flute → flute_melody (2.0s), yawn → sleepy_yawn (1.0s).

## Appendix C — Illustration Style Definitions

Each style is defined with visual keywords, color palette guidelines, line treatment, lighting approach, and overall mood.

**Watercolor:** soft edges, visible brush strokes, muted color bleeding, paper texture, gentle lighting, pastel palette, organic shapes. Suitable for bedtime and gentle stories.

**Comic Book:** bold outlines, flat colors, dynamic angles, action lines, speech bubbles, high contrast, cel shading. Suitable for adventure and action stories.

**3D Pixar-style:** subsurface scattering on skin, rounded features, large expressive eyes, volumetric lighting, soft shadows, warm color grading. Suitable for all story types, especially humor.

**Retro Vintage:** muted earth tones, grainy texture, halftone dots, limited color palette, mid-century illustration style. Suitable for nostalgic and classic stories.

**Minimalist:** clean lines, limited color palette, negative space, geometric shapes, subtle textures. Suitable for concept books and learning stories.

**Oil Painting:** rich color depth, visible brush strokes, chiaroscuro lighting, textured surface, classical composition. Suitable for dramatic and emotional stories.

**Fantasy:** ethereal glow, magical particles, rich saturated colors, dramatic lighting, intricate details. Suitable for magical and adventure stories.

**Manga:** large eyes, simplified features, dynamic poses, speed lines, expressive emotions, clean outlines. Suitable for action and emotion-focused stories.

**Classic Storybook:** warm watercolors, detailed backgrounds, gentle characters, golden hour lighting, traditional composition. Suitable for all story types.

**Whimsical:** exaggerated proportions, playful colors, swirling patterns, dotted textures, hand-drawn feel. Suitable for younger children and playful stories.

## Appendix D — Seed Templates

Twelve initial templates across categories.

**Adventure:** "Space Adventure" (ages 4–8, the child flies to a planet of friendly aliens), "Under the Sea" (ages 3–7, the child discovers an underwater kingdom), "The Enchanted Forest" (ages 5–9, the child follows a trail of glowing mushrooms).

**Friendship:** "The New Friend" (ages 3–6, the child meets someone different and discovers they have a lot in common), "Together We're Strong" (ages 5–8, a group of friends each contribute their unique talent to solve a problem).

**Learning:** "The Colors of the Rainbow" (ages 2–4, the child travels through a world where each stop teaches a color), "Counting to Ten" (ages 2–4, the child counts animals on a farm).

**Bedtime:** "My Star" (ages 2–5, a star watches over the child through the night), "Goodnight Moon" (ages 2–4, the child says goodnight to everything in the room).

**Holidays:** "Happy Hanukkah" (ages 3–7, the child lights candles and discovers the story of the Maccabees), "A Sweet New Year" (ages 3–7, the child prepares for Rosh Hashanah with family).

**Emotions:** "When I Feel..." (ages 3–6, the child navigates different emotions with a wise animal guide).

## Appendix E — Architecture Decision Records Index

ADR-001: LangGraph for agent orchestration instead of custom AsyncGenerator.
ADR-002: Temporal.io as workflow engine from Day 1 instead of Celery upgrade path.
ADR-003: Python-only AI agents to eliminate dual-implementation drift.
ADR-004: CQRS with append-only event log instead of full Event Sourcing.
ADR-005: WebGPU particle system with Canvas fallback for book animations.
ADR-006: Provider Abstraction Layer with circuit breaker for all AI integrations.
ADR-007: Face embedding retention policy per COPPA 2025 biometric data rules.
ADR-008: Multi-tier GPU strategy for cost optimization.
ADR-009: OpenAPI-driven TypeScript client generation to eliminate frontend-backend drift.
ADR-010: BFF pattern — Next.js API Routes proxy to FastAPI.
ADR-011: Subscription book cap to protect margins.
ADR-012: Character Sheet Pipeline for cross-page illustration consistency.

---

*This document is the complete technical blueprint for building StoryMagic from scratch. Every chapter contains sufficient detail for implementation without guessing requirements. The document covers technology, architecture, AI systems, quality control, user experience, visual design, accessibility, security, privacy compliance, localization, performance, monitoring, offline support, error recovery, cost modeling, and a precise development roadmap with build instructions for Claude-Code.*