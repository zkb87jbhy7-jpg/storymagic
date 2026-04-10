'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseAutoSaveOptions<T> {
  data: T
  endpoint: string
  interval?: number
  enabled?: boolean
}

interface UseAutoSaveReturn {
  lastSaved: Date | null
  isSaving: boolean
  saveNow: () => Promise<void>
}

export function useAutoSave<T>({
  data,
  endpoint,
  interval = 30_000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const dataRef = useRef(data)
  const endpointRef = useRef(endpoint)

  dataRef.current = data
  endpointRef.current = endpoint

  const save = useCallback(async () => {
    setIsSaving(true)
    try {
      const response = await fetch(endpointRef.current, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataRef.current),
      })

      if (response.ok) {
        setLastSaved(new Date())
      }
    } catch {
      // Silently fail; the user can manually retry
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Periodic auto-save
  useEffect(() => {
    if (!enabled) return

    const timer = setInterval(save, interval)
    return () => clearInterval(timer)
  }, [save, interval, enabled])

  // Save on visibility change (tab switch / minimize)
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        save()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [save, enabled])

  return { lastSaved, isSaving, saveNow: save }
}
