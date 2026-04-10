'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface SSEProgress {
  progress: number
  phase: string
  message: string
  isComplete: boolean
  error: string | null
  imageUrl?: string | null
}

interface UseBookGenerationSSEOptions {
  bookId: string | null
  enabled?: boolean
}

export function useBookGenerationSSE({
  bookId,
  enabled = true,
}: UseBookGenerationSSEOptions): SSEProgress {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('')
  const [message, setMessage] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!bookId || !enabled) return

    cleanup()

    const es = new EventSource(`/api/books/${bookId}/progress`)
    eventSourceRef.current = es

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.error) {
          setError(data.error)
          cleanup()
          return
        }

        if (typeof data.progress === 'number') {
          setProgress(data.progress)
        }
        if (data.phase) {
          setPhase(data.phase)
        }
        if (data.message) {
          setMessage(data.message)
        }
        if (data.image_url) {
          setImageUrl(data.image_url)
        }
        if (data.complete) {
          setIsComplete(true)
          cleanup()
        }
      } catch {
        // Skip malformed messages
      }
    }

    es.onerror = () => {
      setError('Connection to progress stream lost')
      cleanup()
    }

    return cleanup
  }, [bookId, enabled, cleanup])

  return { progress, phase, message, isComplete, error, imageUrl }
}
