/**
 * ESLint rules to enforce logical CSS properties for RTL/LTR support.
 *
 * Physical direction properties (margin-left, padding-right, text-align: left, etc.)
 * are banned in favor of logical properties (margin-inline-start, padding-inline-end, etc.)
 *
 * This ensures the app renders correctly in both RTL (Hebrew, Arabic) and LTR (English) directions
 * without any direction-specific overrides.
 *
 * Spec ref: Ch10.1 "All CSS uses Logical Properties exclusively"
 */

// Physical -> Logical property mapping for suggestions
const PHYSICAL_TO_LOGICAL = {
  'margin-left': 'margin-inline-start',
  'margin-right': 'margin-inline-end',
  'padding-left': 'padding-inline-start',
  'padding-right': 'padding-inline-end',
  'border-left': 'border-inline-start',
  'border-right': 'border-inline-end',
  'border-top-left-radius': 'border-start-start-radius',
  'border-top-right-radius': 'border-start-end-radius',
  'border-bottom-left-radius': 'border-end-start-radius',
  'border-bottom-right-radius': 'border-end-end-radius',
  'text-align: left': 'text-align: start',
  'text-align: right': 'text-align: end',
  'float: left': 'float: inline-start',
  'float: right': 'float: inline-end',
  left: 'inset-inline-start',
  right: 'inset-inline-end',
}

// Tailwind class patterns that use physical directions
const BANNED_TAILWIND_PATTERNS = [
  /\bml-/, /\bmr-/, /\bpl-/, /\bpr-/,
  /\bborder-l-/, /\bborder-r-/,
  /\brounded-tl-/, /\brounded-tr-/, /\brounded-bl-/, /\brounded-br-/,
  /\bleft-/, /\bright-/,
  /\btext-left\b/, /\btext-right\b/,
  /\bfloat-left\b/, /\bfloat-right\b/,
]

// Corresponding Tailwind logical replacements
const TAILWIND_REPLACEMENTS = {
  'ml-': 'ms-',
  'mr-': 'me-',
  'pl-': 'ps-',
  'pr-': 'pe-',
  'border-l-': 'border-s-',
  'border-r-': 'border-e-',
  'rounded-tl-': 'rounded-ss-',
  'rounded-tr-': 'rounded-se-',
  'rounded-bl-': 'rounded-es-',
  'rounded-br-': 'rounded-ee-',
  'left-': 'start-',
  'right-': 'end-',
  'text-left': 'text-start',
  'text-right': 'text-end',
  'float-left': 'float-start',
  'float-right': 'float-end',
}

module.exports = {
  PHYSICAL_TO_LOGICAL,
  BANNED_TAILWIND_PATTERNS,
  TAILWIND_REPLACEMENTS,
  rules: {},
}
