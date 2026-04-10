// ─── Book Page Types ─── matches DB table: book_pages (Chapter 7.2)

export type LayoutType =
  | 'full_illustration_text_overlay'
  | 'top_illustration_bottom_text'
  | 'side_by_side'
  | 'full_spread'
  | 'text_only_decorative_border';

export type AnimationPreset =
  | 'falling_leaves'
  | 'twinkling_stars'
  | 'floating_bubbles'
  | 'gentle_rain'
  | 'snowfall'
  | 'fireflies';

export type InteractiveElementType = 'tappable' | 'search_and_find' | 'quiz';

export interface InteractiveElementPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface InteractiveElement {
  type: InteractiveElementType;
  position: InteractiveElementPosition;
  content: string;
  sound_effect: string | null;
}

export type SpeakerEmotion =
  | 'happy'
  | 'scared'
  | 'whispering'
  | 'shouting'
  | 'singing'
  | 'brave'
  | 'gentle';

export type Pace = 'slow' | 'normal' | 'fast';

export interface PerformanceMarkup {
  speaker: string;
  emotion: SpeakerEmotion;
  pace: Pace;
  pause_before: number;
  pause_after: number;
  emphasized_words: number[];
  sound_effect: string | null;
}

export type ReadingBuddyQuestionType = 'pointing' | 'prediction' | 'analytical';

export interface ReadingBuddyQuestion {
  question: string;
  type: ReadingBuddyQuestionType;
  answer_hint: string;
}

export interface BookPage {
  id: string;
  book_id: string;
  page_number: number;
  text_primary: string;
  text_secondary: string | null;
  illustration_url: string | null;
  illustration_thumbnail_url: string | null;
  illustration_print_url: string | null;
  illustration_prompt: string | null;
  illustration_negative_prompt: string | null;
  layout_type: LayoutType | null;
  animation_preset: AnimationPreset | null;
  interactive_elements: InteractiveElement[] | null;
  performance_markup: PerformanceMarkup | null;
  alt_text: string | null;
  alt_text_secondary: string | null;
  fun_facts: string[] | null;
  reading_buddy_question: ReadingBuddyQuestion | null;
  created_at: string;
}
