'use client'

import { useMemo } from 'react'
import { getNightModeStyles } from '@/lib/reader/night-mode-controller'

interface NightModeProps {
  active: boolean
  children: React.ReactNode
}

/**
 * Wrapper applying dimmed color filter + warm tint.
 * Activates between 7 PM - 7 AM or via manual toggle.
 */
export function NightMode({ active, children }: NightModeProps) {
  const styles = useMemo(() => {
    if (!active) return undefined
    const nightStyles = getNightModeStyles()
    return {
      filter: nightStyles.filter,
      transition: nightStyles.transition,
    }
  }, [active])

  return (
    <div
      style={styles}
      data-night-mode={active || undefined}
      className="min-h-[100dvh]"
    >
      {children}
    </div>
  )
}
