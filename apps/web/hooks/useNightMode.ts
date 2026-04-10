'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { isNightTime, getNightModeStyles, type NightModeStyles } from '@/lib/reader/night-mode-controller'

interface UseNightModeReturn {
  isNight: boolean
  isManual: boolean
  toggle: () => void
  styles: NightModeStyles | null
}

export function useNightMode(): UseNightModeReturn {
  const [isManual, setIsManual] = useState(false)
  const [manualOn, setManualOn] = useState(false)
  const [autoNight, setAutoNight] = useState(false)

  // Check time-based night mode
  useEffect(() => {
    setAutoNight(isNightTime())

    const interval = setInterval(() => {
      setAutoNight(isNightTime())
    }, 60_000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const isNight = isManual ? manualOn : autoNight

  const toggle = useCallback(() => {
    setIsManual(true)
    setManualOn((prev) => !prev)
  }, [])

  const styles = useMemo<NightModeStyles | null>(() => {
    if (!isNight) return null
    return getNightModeStyles()
  }, [isNight])

  return { isNight, isManual, toggle, styles }
}
