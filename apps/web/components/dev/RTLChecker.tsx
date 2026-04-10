'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Dev-only tool that outlines elements using physical CSS properties
 * (margin-left, margin-right, padding-left, padding-right, text-align:left/right,
 *  float:left/right) with a red border so developers can spot RTL violations.
 *
 * Only renders in development mode.
 */

const PHYSICAL_PROPERTIES = [
  'margin-left',
  'margin-right',
  'padding-left',
  'padding-right',
  'border-left',
  'border-right',
  'left',
  'right',
] as const

const PHYSICAL_TEXT_ALIGN_VALUES = ['left', 'right'] as const
const PHYSICAL_FLOAT_VALUES = ['left', 'right'] as const

function hasPhysicalProperties(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el)
  const inlineStyle = el.getAttribute('style') ?? ''

  // Check if inline styles contain physical directional properties
  for (const prop of PHYSICAL_PROPERTIES) {
    if (inlineStyle.includes(prop)) return true
  }

  // Check computed text-align for physical values
  const textAlign = style.getPropertyValue('text-align')
  if (PHYSICAL_TEXT_ALIGN_VALUES.includes(textAlign as 'left' | 'right')) {
    // text-align: left/right is OK for default (no inline override)
    if (inlineStyle.includes('text-align')) return true
  }

  // Check float
  const float = style.getPropertyValue('float')
  if (PHYSICAL_FLOAT_VALUES.includes(float as 'left' | 'right')) {
    if (inlineStyle.includes('float')) return true
  }

  return false
}

export function RTLChecker() {
  const [enabled, setEnabled] = useState(false)
  const [violationCount, setViolationCount] = useState(0)

  const scan = useCallback(() => {
    if (!enabled) return

    // Remove previous outlines
    document
      .querySelectorAll('[data-rtl-violation]')
      .forEach((el) => {
        ;(el as HTMLElement).style.removeProperty('outline')
        ;(el as HTMLElement).style.removeProperty('outline-offset')
        el.removeAttribute('data-rtl-violation')
      })

    // Scan all elements
    let count = 0
    const all = document.querySelectorAll('*')
    all.forEach((el) => {
      if (hasPhysicalProperties(el as HTMLElement)) {
        ;(el as HTMLElement).style.outline = '2px solid red'
        ;(el as HTMLElement).style.outlineOffset = '-1px'
        el.setAttribute('data-rtl-violation', 'true')
        count++
      }
    })
    setViolationCount(count)
  }, [enabled])

  useEffect(() => {
    scan()

    if (!enabled) {
      // Clean up highlights when disabled
      document
        .querySelectorAll('[data-rtl-violation]')
        .forEach((el) => {
          ;(el as HTMLElement).style.removeProperty('outline')
          ;(el as HTMLElement).style.removeProperty('outline-offset')
          el.removeAttribute('data-rtl-violation')
        })
      setViolationCount(0)
    }
  }, [enabled, scan])

  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div
      className={cn(
        'fixed bottom-4 start-4 z-[9999] flex items-center gap-3 rounded-lg px-4 py-2 shadow-lg',
        'border border-slate-200 bg-white text-sm',
        'dark:border-slate-700 dark:bg-slate-800',
      )}
    >
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
        />
        <span className="font-medium text-slate-700 dark:text-slate-300">
          RTL Check
        </span>
      </label>

      {enabled && (
        <>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              violationCount > 0
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            )}
          >
            {violationCount}
          </span>
          <button
            type="button"
            onClick={scan}
            className="text-xs text-primary-600 hover:underline dark:text-primary-400"
          >
            Rescan
          </button>
        </>
      )}
    </div>
  )
}
