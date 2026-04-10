import { I18nManager } from 'react-native';

// ─── StoryMagic Color Palette ───
// Matches the web app design system (Chapter 12)

export const colors = {
  // Primary - Indigo
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',
  primaryBg: '#EEF2FF',

  // Secondary - Violet
  secondary: '#7C3AED',
  secondaryLight: '#A78BFA',
  secondaryDark: '#5B21B6',

  // Accent - Amber
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  accentDark: '#D97706',

  // Success
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',

  // Warning
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',

  // Error
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#DC2626',

  // Info
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#2563EB',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  textLink: '#4F46E5',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

// ─── Typography ───

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

// ─── Spacing ───

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

// ─── Border Radius ───

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// ─── Shadows ───

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// ─── Touch Targets ───
// Minimum 44px per Apple HIG / Material Design guidelines

export const touchTargets = {
  minimum: 44,
  comfortable: 48,
  large: 56,
} as const;

// ─── RTL Support ───

export const isRTL = I18nManager.isRTL;

export function getFlexDirection(): 'row' | 'row-reverse' {
  return isRTL ? 'row-reverse' : 'row';
}

export function getTextAlign(): 'left' | 'right' {
  return isRTL ? 'right' : 'left';
}
