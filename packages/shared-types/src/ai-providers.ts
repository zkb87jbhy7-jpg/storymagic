// ─── AI Provider Abstraction Types ─── matches Chapter 4.5

/** Capability types matching the four provider interfaces */
export type ProviderCapability =
  | 'text_generation'
  | 'image_generation'
  | 'voice_generation'
  | 'face_processing';

// ─── Text Generation (Claude / Gemini / GPT-4o) ───

export interface TextGenerationRequest {
  prompt: string;
  system_prompt: string;
  variables: Record<string, string>;
  max_tokens: number;
  temperature: number;
  response_format?: 'json' | 'text';
  json_schema?: Record<string, unknown>;
  prompt_version_id?: string;
  experiment_id?: string;
}

export interface TextGenerationResult {
  text: string;
  provider_id: string;
  model: string;
  tokens_input: number;
  tokens_output: number;
  latency_ms: number;
  cost_usd: number;
  prompt_version_id: string | null;
}

// ─── Image Generation (ComfyUI / Flux Kontext / PuLID) ───

export interface ImageGenerationRequest {
  prompt: string;
  negative_prompt: string;
  style: string;
  character_sheet_ref: string | null;
  face_embedding_ref: string | null;
  width: number;
  height: number;
  seed?: number;
  control_net_pose?: string | null;
  gpu_tier?: 'tier_1' | 'tier_2' | 'tier_3';
  experiment_id?: string;
}

export interface ImageGenerationResult {
  image_url: string;
  thumbnail_url: string;
  print_url: string | null;
  provider_id: string;
  width: number;
  height: number;
  seed: number;
  latency_ms: number;
  cost_usd: number;
}

// ─── Voice Generation (ElevenLabs / Cartesia / Fish Audio) ───

export interface VoiceGenerationRequest {
  text: string;
  voice_id: string;
  language: string;
  performance_markup: {
    speaker: string;
    emotion: string;
    pace: string;
    pause_before: number;
    pause_after: number;
    emphasized_words: number[];
    sound_effect: string | null;
  };
  experiment_id?: string;
}

export interface VoiceGenerationResult {
  audio_url: string;
  duration_seconds: number;
  provider_id: string;
  latency_ms: number;
  cost_usd: number;
}

// ─── Face Processing (InsightFace / ArcFace / BlazeFace) ───

export interface FaceProcessingRequest {
  photo_urls: string[];
  operation: 'create_embedding' | 'compare' | 'quality_check';
  existing_embedding_ref?: string;
}

export interface FaceProcessingResult {
  embedding_ref: string | null;
  cosine_similarity: number | null;
  quality_score: number | null;
  face_detected: boolean;
  face_count: number;
  provider_id: string;
  latency_ms: number;
}

// ─── Provider Management ───

export type ProviderStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface ProviderHealth {
  provider_id: string;
  capability: ProviderCapability;
  status: ProviderStatus;
  latency_p50_ms: number;
  latency_p95_ms: number;
  error_rate: number;
  last_check_at: string;
  circuit_breaker_open: boolean;
  consecutive_failures: number;
}

export interface ProviderConfig {
  provider_id: string;
  capability: ProviderCapability;
  priority: number;
  enabled: boolean;
  cost_per_unit: number;
  rate_limit: number;
  timeout_ms: number;
  retry_count: number;
  ab_test_traffic_percent: number;
  config: Record<string, unknown>;
}
