// ─── AI Agent Types ─── matches Chapter 5 Multi-Agent AI System

export type NarrativeRole =
  | 'introduction'
  | 'rising_action'
  | 'climax'
  | 'falling_action'
  | 'resolution';

export type EmotionType =
  | 'joy'
  | 'curiosity'
  | 'tension'
  | 'mild_fear'
  | 'courage'
  | 'triumph'
  | 'warmth';

/** Emotional arc maps page ranges to emotions */
export interface EmotionalArc {
  page_range_start: number;
  page_range_end: number;
  emotion: EmotionType;
  intensity: number;
}

export interface SceneDialogue {
  speaker: string;
  text: string;
}

/**
 * A single scene in the StoryBlueprint.
 * Output of the Story Architect Agent (A-01).
 */
export interface Scene {
  page_number: number;
  environment_description: string;
  action_description: string;
  dialogues: SceneDialogue[];
  dominant_emotion: EmotionType;
  narrative_role: NarrativeRole;
  illustration_hint: string;
}

/**
 * StoryBlueprint: structured output of the Story Architect Agent (A-01).
 * Contains the full structural skeleton of the story.
 */
export interface StoryBlueprint {
  title: string;
  subtitle: string;
  central_theme: string;
  moral_message: string;
  emotional_arc: EmotionalArc[];
  scenes: Scene[];
}

/**
 * Detailed illustration prompt created by the Art Director Agent (A-04).
 * Each page gets one IllustrationPrompt.
 */
export interface IllustrationPrompt {
  page_number: number;
  prompt: string;
  negative_prompt: string;
  composition_notes: string;
  color_palette: string[];
  camera_angle: string;
  style_directives: string;
  character_sheet_ref: string | null;
}

/** Activity in the parental guide */
export interface ParentalGuideActivity {
  activity: string;
  materials: string[];
}

/**
 * Output of the Parental Guidance Agent (A-09).
 */
export interface ParentalGuide {
  summary: string;
  educational_value: string;
  discussion_questions: string[];
  activities: ParentalGuideActivity[];
  emotional_notes: string[];
}

/**
 * Generic result wrapper for any agent execution.
 * Used to track per-agent performance and quality in the pipeline.
 */
export interface AgentResult<T = unknown> {
  agent_name: string;
  success: boolean;
  data: T | null;
  quality_score: number | null;
  latency_ms: number;
  provider_id: string | null;
  error_details: Record<string, unknown> | null;
  prompt_version_id: string | null;
}

/** Emotional analysis per page from the Emotional Tone Agent (A-05) */
export interface EmotionalAnalysis {
  page_number: number;
  detected_emotion: EmotionType;
  intensity: number;
  target_emotion: EmotionType;
  alignment_score: number;
  recommendation: string | null;
}

/** Output of the Consistency Guardian Agent (A-08) */
export interface ConsistencyReport {
  score: number;
  issues: Array<{
    involved_pages: number[];
    description: string;
    suggested_fix: string;
  }>;
}

/** Output of the Cultural Sensitivity Agent (A-10) */
export interface CulturalSensitivityResult {
  approved: boolean;
  warnings: string[];
  suggestions: string[];
}

/** Output of the Bilingual Adaptation Agent (A-11) */
export interface BilingualAdaptation {
  page_number: number;
  adapted_text: string;
  adaptation_notes: string[];
}
