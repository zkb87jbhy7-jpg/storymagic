'use client'

import { useState, useEffect, useCallback } from 'react'

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'school'

interface SubscriptionState {
  tier: SubscriptionTier
  booksRemaining: number
  isSubscribed: boolean
  canCreate: boolean
  isLoading: boolean
  error: string | null
}

interface ApiSubscriptionResponse {
  tier: SubscriptionTier
  booksRemaining: number
}

/**
 * Fetches and returns the current user's subscription status from the API.
 */
export function useSubscription(): SubscriptionState & { refresh: () => void } {
  const [state, setState] = useState<SubscriptionState>({
    tier: 'free',
    booksRemaining: 0,
    isSubscribed: false,
    canCreate: false,
    isLoading: true,
    error: null,
  })

  const fetchSubscription = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const res = await fetch('/api/subscription')
      if (!res.ok) throw new Error('Failed to fetch subscription')

      const data = (await res.json()) as ApiSubscriptionResponse
      setState({
        tier: data.tier,
        booksRemaining: data.booksRemaining,
        isSubscribed: data.tier !== 'free',
        canCreate: data.booksRemaining > 0,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }))
    }
  }, [])

  useEffect(() => {
    void fetchSubscription()
  }, [fetchSubscription])

  return { ...state, refresh: fetchSubscription }
}
