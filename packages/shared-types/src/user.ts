// ─── User Types ─── matches DB table: users (Chapter 7.2)

export type SubscriptionTier = 'free' | 'monthly' | 'yearly';

export type OnboardingType = 'quick' | 'creative' | 'guided';

export interface AccessibilityPrefs {
  dyslexia_mode: boolean;
  adhd_mode: boolean;
  autism_mode: boolean;
  font_size: 'normal' | 'large' | 'xl';
  high_contrast: boolean;
  reduced_motion: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  password_hash: string;
  language_preference: string;
  currency_preference: string;
  subscription_tier: SubscriptionTier;
  accessibility_prefs: AccessibilityPrefs;
  onboarding_type: OnboardingType;
  encryption_key_ref: string;
  referral_code: string;
  referred_by: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

/** Fields required when creating a new user via POST /api/v1/auth/register */
export interface UserCreate {
  email: string;
  name: string;
  password: string;
  phone?: string;
  language_preference?: string;
  currency_preference?: string;
  onboarding_type?: OnboardingType;
  timezone?: string;
}

/** Fields allowed when updating a user profile */
export interface UserUpdate {
  name?: string;
  phone?: string | null;
  language_preference?: string;
  currency_preference?: string;
  subscription_tier?: SubscriptionTier;
  accessibility_prefs?: Partial<AccessibilityPrefs>;
  onboarding_type?: OnboardingType;
  timezone?: string;
}
