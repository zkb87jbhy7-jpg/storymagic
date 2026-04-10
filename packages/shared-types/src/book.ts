// ─── Generated Book Types ─── matches DB table: generated_books (Chapter 7.2)

export type BookStatus =
  | 'draft'
  | 'generating'
  | 'preview'
  | 'approved'
  | 'ordered'
  | 'printing'
  | 'shipped';

export type CreationMethod =
  | 'free_prompt'
  | 'template'
  | 'co_creation'
  | 'dream'
  | 'remix';

export type MoodSetting =
  | 'adventurous'
  | 'calm'
  | 'funny'
  | 'scary'
  | 'educational'
  | 'bedtime'
  | 'empowering'
  | 'emotional';

export type IllustrationStyle =
  | 'watercolor'
  | 'comic_book'
  | '3d_pixar'
  | 'retro_vintage'
  | 'minimalist'
  | 'oil_painting'
  | 'fantasy'
  | 'manga'
  | 'classic_storybook'
  | 'whimsical';

/** Per-page quality breakdown stored in generated_books.quality_scores JSONB */
export interface PageQualityScore {
  page: number;
  text_score: number;
  illustration_score: number;
  likeness_score: number;
}

/** JSONB quality_scores on generated_books */
export interface QualityScores {
  overall: number;
  per_page: PageQualityScore[];
  consistency_score: number;
}

/** JSONB illustrations map on generated_books: keyed by page number */
export interface BookIllustrationEntry {
  url: string;
  thumbnail_url: string;
  print_url: string;
}

/** JSONB parental_guide on generated_books */
export interface ParentalGuideData {
  summary: string;
  educational_value: string;
  discussion_questions: string[];
  activities: Array<{ activity: string; materials: string[] }>;
  emotional_notes: string[];
}

/** JSONB co_creation_journey on generated_books */
export interface CoCreationStep {
  step: number;
  question: string;
  child_response: string;
  timestamp: string;
}

export interface GeneratedBook {
  id: string;
  user_id: string;
  child_profile_ids: string[];
  story_template_id: string | null;
  free_prompt: string | null;
  title: string | null;
  generated_story: Record<string, unknown> | null;
  illustration_style: IllustrationStyle | null;
  character_sheet_ref: string | null;
  illustrations: Record<number, BookIllustrationEntry> | null;
  voice_narration_url: string | null;
  voice_profile_id: string | null;
  interactive_book_data: Record<string, unknown> | null;
  print_ready_pdf_url: string | null;
  digital_pdf_url: string | null;
  parental_guide: ParentalGuideData | null;
  quality_scores: QualityScores | null;
  status: BookStatus;
  generation_workflow_id: string | null;
  is_living_book: boolean;
  is_bilingual: boolean;
  secondary_language: string | null;
  mood_setting: MoodSetting | null;
  creation_method: CreationMethod | null;
  co_creation_journey: CoCreationStep[] | null;
  book_dna_pattern: string | null;
  created_at: string;
  updated_at: string;
}

/** Fields for starting a new book creation */
export interface BookCreate {
  child_profile_ids: string[];
  story_template_id?: string;
  free_prompt?: string;
  illustration_style?: IllustrationStyle;
  mood_setting?: MoodSetting;
  creation_method: CreationMethod;
  is_bilingual?: boolean;
  secondary_language?: string;
  voice_profile_id?: string;
  page_count?: number;
  is_rhyming?: boolean;
  language?: string;
}
