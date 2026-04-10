'use client'

import { cn } from '@/lib/utils/cn'
import type { AccessibilityMode } from './InteractiveBookReader'
import { DyslexiaMode } from './DyslexiaMode'
import { ADHDMode } from './ADHDMode'
import { AutismMode } from './AutismMode'

interface NeuroInclusiveModesProps {
  mode: AccessibilityMode
  currentPage: number
  totalPages: number
  childAge: number
  pageText: string
  children: React.ReactNode
}

/**
 * Mode switcher component.
 * Applies correct CSS class to reader container and wraps with mode-specific behavior.
 */
export function NeuroInclusiveModes({
  mode,
  currentPage,
  totalPages,
  childAge,
  pageText,
  children,
}: NeuroInclusiveModesProps) {
  const modeClasses: Record<AccessibilityMode, string> = {
    none: '',
    dyslexia: 'reader-dyslexia',
    adhd: 'reader-adhd',
    autism: 'reader-autism',
  }

  return (
    <div className={cn(modeClasses[mode])}>
      {mode === 'dyslexia' && (
        <DyslexiaMode>{children}</DyslexiaMode>
      )}
      {mode === 'adhd' && (
        <ADHDMode
          currentPage={currentPage}
          totalPages={totalPages}
          pageText={pageText}
        >
          {children}
        </ADHDMode>
      )}
      {mode === 'autism' && (
        <AutismMode
          currentPage={currentPage}
          totalPages={totalPages}
          pageText={pageText}
          childAge={childAge}
        >
          {children}
        </AutismMode>
      )}
      {mode === 'none' && children}
    </div>
  )
}
