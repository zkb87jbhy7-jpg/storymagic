// Night mode controller
// Auto-activates between 7 PM and 7 AM or via manual toggle

export interface NightModeStyles {
  filter: string
  transition: string
}

const NIGHT_START_HOUR = 19 // 7 PM
const NIGHT_END_HOUR = 7   // 7 AM

/**
 * Check if current time is within the night window (7 PM - 7 AM).
 */
export function isNightTime(): boolean {
  const hour = new Date().getHours()
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR
}

/**
 * Get CSS filter values for night mode.
 * Applies a warm, dimmed look to reduce blue light.
 */
export function getNightModeStyles(): NightModeStyles {
  return {
    filter: 'brightness(0.75) sepia(0.2) saturate(0.85)',
    transition: 'filter 0.5s ease-in-out',
  }
}

/**
 * Get the current brightness level based on time of day.
 * Returns 0.6-1.0 where lower = dimmer (deeper into night).
 */
export function getNightBrightness(): number {
  const hour = new Date().getHours()

  if (hour >= NIGHT_END_HOUR && hour < NIGHT_START_HOUR) {
    return 1.0 // Daytime
  }

  // Peak dim at midnight
  if (hour >= 22 || hour <= 4) {
    return 0.65
  }

  // Transitional hours
  return 0.75
}
