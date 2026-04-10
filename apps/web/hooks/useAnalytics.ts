'use client'

import { useCallback } from 'react'
import { eventTracker } from '@/lib/analytics/event-tracker'

interface UseAnalyticsReturn {
  /** Track a named event with optional properties. */
  trackEvent: (name: string, properties?: Record<string, unknown>) => void
}

/**
 * Lightweight analytics hook. Delegates to the singleton EventTracker.
 */
export function useAnalytics(): UseAnalyticsReturn {
  const trackEvent = useCallback(
    (name: string, properties: Record<string, unknown> = {}) => {
      eventTracker.track(name, properties)
    },
    [],
  )

  return { trackEvent }
}
