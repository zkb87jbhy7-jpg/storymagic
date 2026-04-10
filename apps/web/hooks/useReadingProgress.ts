'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface Bookmark {
  page: number
  createdAt: number
  label?: string
}

interface ReadingProgressState {
  currentPage: number
  totalPages: number
  bookmarks: Bookmark[]
  lastReadAt: number
}

interface UseReadingProgressReturn {
  currentPage: number
  setPage: (page: number) => void
  progress: number
  bookmarks: Bookmark[]
  addBookmark: (label?: string) => void
  removeBookmark: (page: number) => void
  isBookmarked: boolean
}

const STORAGE_PREFIX = 'storymagic_reading_'

function getStorageKey(bookId: string): string {
  return `${STORAGE_PREFIX}${bookId}`
}

function loadProgress(bookId: string): ReadingProgressState | null {
  if (typeof window === 'undefined') return null
  try {
    const data = localStorage.getItem(getStorageKey(bookId))
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function saveProgress(bookId: string, state: ReadingProgressState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getStorageKey(bookId), JSON.stringify(state))
  } catch {
    // Storage may be full - non-critical
  }
}

export function useReadingProgress(bookId: string, totalPages: number): UseReadingProgressReturn {
  const [state, setState] = useState<ReadingProgressState>(() => {
    const saved = loadProgress(bookId)
    return saved ?? {
      currentPage: 0,
      totalPages,
      bookmarks: [],
      lastReadAt: Date.now(),
    }
  })

  const stateRef = useRef(state)
  stateRef.current = state

  // Save on state change
  useEffect(() => {
    saveProgress(bookId, state)
  }, [bookId, state])

  // Save on unmount
  useEffect(() => {
    return () => {
      saveProgress(bookId, stateRef.current)
    }
  }, [bookId])

  const setPage = useCallback((page: number) => {
    setState((prev) => ({
      ...prev,
      currentPage: Math.max(0, Math.min(page, totalPages - 1)),
      lastReadAt: Date.now(),
    }))
  }, [totalPages])

  const addBookmark = useCallback((label?: string) => {
    setState((prev) => {
      const exists = prev.bookmarks.some((b) => b.page === prev.currentPage)
      if (exists) return prev
      return {
        ...prev,
        bookmarks: [
          ...prev.bookmarks,
          { page: prev.currentPage, createdAt: Date.now(), label },
        ],
      }
    })
  }, [])

  const removeBookmark = useCallback((page: number) => {
    setState((prev) => ({
      ...prev,
      bookmarks: prev.bookmarks.filter((b) => b.page !== page),
    }))
  }, [])

  const progress = totalPages > 0 ? ((state.currentPage + 1) / totalPages) * 100 : 0

  const isBookmarked = state.bookmarks.some((b) => b.page === state.currentPage)

  return {
    currentPage: state.currentPage,
    setPage,
    progress,
    bookmarks: state.bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
  }
}
