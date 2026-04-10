import { Platform } from 'react-native';
import {
  ILLUSTRATION_STYLES,
  LOCALES,
  DEFAULT_LOCALE,
  RTL_LOCALES,
  MIN_CHILD_AGE,
  MAX_CHILD_AGE,
  MIN_PAGES,
  MAX_PAGES,
  MAX_CHILDREN_PER_BOOK,
  MAX_PHOTOS_PER_CHILD,
} from 'shared-utils';

// Re-export shared constants for convenience
export {
  ILLUSTRATION_STYLES,
  LOCALES,
  DEFAULT_LOCALE,
  RTL_LOCALES,
  MIN_CHILD_AGE,
  MAX_CHILD_AGE,
  MIN_PAGES,
  MAX_PAGES,
  MAX_CHILDREN_PER_BOOK,
  MAX_PHOTOS_PER_CHILD,
};

// ─── API Configuration ───

const DEV_API_URL = Platform.select({
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});

export const API_URL = process.env.EXPO_PUBLIC_API_URL || DEV_API_URL || 'http://localhost:3000';

// ─── AsyncStorage Keys ───

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@storymagic/access_token',
  REFRESH_TOKEN: '@storymagic/refresh_token',
  USER_DATA: '@storymagic/user_data',
  LANGUAGE: '@storymagic/language',
  OFFLINE_BOOKS: '@storymagic/offline_books',
  PUSH_TOKEN: '@storymagic/push_token',
  ONBOARDING_COMPLETE: '@storymagic/onboarding_complete',
} as const;

// ─── Illustration Style Labels ───

export const ILLUSTRATION_STYLE_LABELS: Record<string, string> = {
  watercolor: 'Watercolor',
  comic_book: 'Comic Book',
  pixar_3d: '3D Pixar',
  '3d_pixar': '3D Pixar',
  retro_vintage: 'Retro Vintage',
  minimalist: 'Minimalist',
  oil_painting: 'Oil Painting',
  fantasy: 'Fantasy',
  manga: 'Manga',
  classic_storybook: 'Classic Storybook',
  whimsical: 'Whimsical',
};

// ─── Mood Labels ───

export const MOOD_LABELS: Record<string, string> = {
  adventurous: 'Adventurous',
  calm: 'Calm',
  funny: 'Funny',
  scary: 'A Little Scary',
  educational: 'Educational',
  bedtime: 'Bedtime',
  empowering: 'Empowering',
  emotional: 'Emotional',
};

// ─── Language Labels ───

export const LANGUAGE_LABELS: Record<string, string> = {
  he: 'Hebrew',
  en: 'English',
  ar: 'Arabic',
  ru: 'Russian',
  fr: 'French',
  es: 'Spanish',
};

// ─── Gender Labels ───

export const GENDER_LABELS: Record<string, string> = {
  boy: 'Boy',
  girl: 'Girl',
  prefer_not_to_say: 'Prefer not to say',
};
