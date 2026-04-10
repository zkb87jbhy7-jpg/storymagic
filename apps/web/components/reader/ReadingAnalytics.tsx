'use client'

import { useEffect, useRef, useCallback } from 'react'

interface ReadingAnalyticsProps {
  bookId: string
  currentPage: number
  totalPages: number
}

interface PageAnalytics {
  pageNumber: number
  timeSpentMs: number
  visitCount: number
  taps: number
}

interface BookAnalytics {
  bookId: string
  startedAt: number
  pagesAnalytics: Record<number, PageAnalytics>
  totalTimeMs: number
  completed: boolean
}

const STORAGE_KEY_PREFIX = 'storymagic_analytics_'

function getStorageKey(bookId: string): string {
  return `${STORAGE_KEY_PREFIX}${bookId}`
}

function loadAnalytics(bookId: string): BookAnalytics {
  if (typeof window === 'undefined') {
    return createFreshAnalytics(bookId)
  }
  try {
    const raw = localStorage.getItem(getStorageKey(bookId))
    if (raw) return JSON.parse(raw)
  } catch {
    // Fall through to fresh
  }
  return createFreshAnalytics(bookId)
}

function createFreshAnalytics(bookId: string): BookAnalytics {
  return {
    bookId,
    startedAt: Date.now(),
    pagesAnalytics: {},
    totalTimeMs: 0,
    completed: false,
  }
}

function saveAnalytics(analytics: BookAnalytics): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getStorageKey(analytics.bookId), JSON.stringify(analytics))
  } catch {
    // Non-critical
  }
}

/**
 * Tracks reading analytics:
 * - Time per page
 * - Pages reread (visit count)
 * - Taps/interactions
 * - Completion status
 *
 * This component renders nothing visible.
 */
export function ReadingAnalytics({ bookId, currentPage, totalPages }: ReadingAnalyticsProps) {
  const analyticsRef = useRef<BookAnalytics>(loadAnalytics(bookId))
  const pageStartRef = useRef(Date.now())
  const prevPageRef = useRef(currentPage)

  // Record time on previous page when page changes
  useEffect(() => {
    const now = Date.now()
    const prevPage = prevPageRef.current
    const timeSpent = now - pageStartRef.current

    // Update previous page analytics
    const prev = analyticsRef.current.pagesAnalytics[prevPage] ?? {
      pageNumber: prevPage,
      timeSpentMs: 0,
      visitCount: 0,
      taps: 0,
    }
    prev.timeSpentMs += timeSpent
    prev.visitCount += 1
    analyticsRef.current.pagesAnalytics[prevPage] = prev

    // Update total time
    analyticsRef.current.totalTimeMs += timeSpent

    // Check completion
    if (currentPage >= totalPages - 1) {
      analyticsRef.current.completed = true
    }

    // Save
    saveAnalytics(analyticsRef.current)

    // Reset for new page
    pageStartRef.current = now
    prevPageRef.current = currentPage
  }, [currentPage, totalPages])

  // Track taps
  const handleTap = useCallback(() => {
    const page = analyticsRef.current.pagesAnalytics[currentPage]
    if (page) {
      page.taps += 1
      saveAnalytics(analyticsRef.current)
    }
  }, [currentPage])

  // Listen for tap events on the reader
  useEffect(() => {
    document.addEventListener('click', handleTap)
    return () => document.removeEventListener('click', handleTap)
  }, [handleTap])

  // Save on unmount
  useEffect(() => {
    return () => {
      const timeSpent = Date.now() - pageStartRef.current
      const page = analyticsRef.current.pagesAnalytics[prevPageRef.current] ?? {
        pageNumber: prevPageRef.current,
        timeSpentMs: 0,
        visitCount: 0,
        taps: 0,
      }
      page.timeSpentMs += timeSpent
      analyticsRef.current.pagesAnalytics[prevPageRef.current] = page
      analyticsRef.current.totalTimeMs += timeSpent
      saveAnalytics(analyticsRef.current)
    }
  }, [])

  // Invisible component
  return null
}
