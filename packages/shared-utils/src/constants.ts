// Supported locales
export const LOCALES = ['he', 'en', 'ar', 'ru', 'fr', 'es'] as const
export const DEFAULT_LOCALE = 'he' as const
export const RTL_LOCALES = ['he', 'ar'] as const

// Currency mapping per locale
export const LOCALE_CURRENCY: Record<string, string> = {
  he: 'ILS',
  en: 'USD',
  ar: 'ILS',
  ru: 'USD',
  fr: 'EUR',
  es: 'EUR',
}

// Age ranges
export const MIN_CHILD_AGE = 2
export const MAX_CHILD_AGE = 10

// Book constraints
export const MIN_PAGES = 8
export const MAX_PAGES = 24
export const MAX_CHILDREN_PER_BOOK = 4
export const MAX_PHOTOS_PER_CHILD = 5

// Subscription limits
export const MONTHLY_BOOK_CAP = 2
export const YEARLY_BOOK_CAP = 24
export const FREE_PRINTS_YEARLY = 3

// Pricing (USD)
export const PRICE_DIGITAL = 9.99
export const PRICE_SOFTCOVER = 24.99
export const PRICE_HARDCOVER = 34.99
export const PRICE_HARDCOVER_GIFT = 44.99
export const PRICE_MONTHLY_SUB = 14.99
export const PRICE_YEARLY_SUB = 119.99

// Quality thresholds
export const QUALITY_SCORE_THRESHOLD = 75
export const LIKENESS_SIMILARITY_THRESHOLD = 0.75
export const FEAR_INTENSITY_MAX_YOUNG = 4 // ages 2-5
export const FEAR_INTENSITY_MAX_OLD = 6 // ages 6-10

// Timing
export const AUTOSAVE_INTERVAL_MS = 30_000
export const FACT_TICKER_INTERVAL_MS = 8_000
export const NIGHT_MODE_START_HOUR = 19 // 7 PM
export const NIGHT_MODE_END_HOUR = 7 // 7 AM

// Face detection
export const MIN_FACE_AREA_RATIO = 0.2
export const FACE_CENTER_TOLERANCE = 0.6
export const MIN_IMAGE_DIMENSION = 512

// Illustration styles
export const ILLUSTRATION_STYLES = [
  'watercolor',
  'comic_book',
  'pixar_3d',
  'retro_vintage',
  'minimalist',
  'oil_painting',
  'fantasy',
  'manga',
  'classic_storybook',
  'whimsical',
] as const

// Animation presets
export const ANIMATION_PRESETS = [
  'falling_leaves',
  'twinkling_stars',
  'floating_bubbles',
  'gentle_rain',
  'snowfall',
  'fireflies',
] as const

// Mood settings
export const MOODS = [
  'happy',
  'exciting',
  'sad',
  'scared',
  'angry',
  'calm',
] as const
