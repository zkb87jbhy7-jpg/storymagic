'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import { type VitalMetric, storeVital, getStoredVitals } from '@/lib/monitoring/web-vitals'
import { DEFAULT_BUDGET } from '@/lib/monitoring/performance-budget'

/**
 * Dev-only corner overlay showing current LCP, CLS, and INP values alongside
 * their performance budgets. Updates live via web-vitals.
 */

interface VitalDisplay {
  name: string
  value: number | null
  budget: number
  unit: string
  rating: VitalMetric['rating'] | null
}

const RATING_COLORS: Record<string, string> = {
  good: 'text-green-600 dark:text-green-400',
  'needs-improvement': 'text-amber-600 dark:text-amber-400',
  poor: 'text-red-600 dark:text-red-400',
}

export function PerformanceBudgetOverlay() {
  const [vitals, setVitals] = useState<VitalDisplay[]>([
    { name: 'LCP', value: null, budget: DEFAULT_BUDGET.maxLcpMs, unit: 'ms', rating: null },
    { name: 'CLS', value: null, budget: DEFAULT_BUDGET.maxCls, unit: '', rating: null },
    { name: 'INP', value: null, budget: DEFAULT_BUDGET.maxInpMs, unit: 'ms', rating: null },
  ])
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Read any previously stored vitals
    const stored = getStoredVitals()
    if (stored.length > 0) {
      setVitals((prev) =>
        prev.map((v) => {
          const match = stored.find((s) => s.name === v.name)
          return match ? { ...v, value: match.value, rating: match.rating } : v
        }),
      )
    }

    // Listen for new vitals via a custom event pattern
    async function initVitals() {
      try {
        const { onLCP, onCLS, onINP } = await import('web-vitals')

        const handle = (name: VitalMetric['name']) => {
          return (entry: { value: number; rating: string }) => {
            const metric: VitalMetric = {
              name,
              value: entry.value,
              rating: entry.rating as VitalMetric['rating'],
            }
            storeVital(metric)
            setVitals((prev) =>
              prev.map((v) =>
                v.name === name ? { ...v, value: metric.value, rating: metric.rating } : v,
              ),
            )
          }
        }

        onLCP(handle('LCP'))
        onCLS(handle('CLS'))
        onINP(handle('INP'))
      } catch {
        // web-vitals not available
      }
    }

    void initVitals()
  }, [])

  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null
  if (!visible) return null

  return (
    <div
      className={cn(
        'fixed end-4 top-4 z-[9999] rounded-lg px-3 py-2 shadow-lg',
        'border border-slate-200 bg-white/95 backdrop-blur-sm',
        'dark:border-slate-700 dark:bg-slate-800/95',
        'text-xs font-mono',
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-4">
        <span className="font-bold text-slate-700 dark:text-slate-300">
          Perf Budget
        </span>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          aria-label="Close performance overlay"
        >
          x
        </button>
      </div>

      <table className="w-full">
        <tbody>
          {vitals.map((v) => {
            const withinBudget = v.value !== null && v.value <= v.budget
            const displayValue =
              v.value !== null
                ? v.name === 'CLS'
                  ? v.value.toFixed(3)
                  : Math.round(v.value).toString()
                : '--'

            return (
              <tr key={v.name}>
                <td className="pe-3 py-0.5 text-slate-500 dark:text-slate-400">
                  {v.name}
                </td>
                <td
                  className={cn(
                    'pe-2 py-0.5 font-medium',
                    v.value !== null
                      ? RATING_COLORS[v.rating ?? 'good']
                      : 'text-slate-400 dark:text-slate-500',
                  )}
                >
                  {displayValue}{v.unit}
                </td>
                <td className="py-0.5 text-slate-400 dark:text-slate-500">
                  / {v.name === 'CLS' ? v.budget.toFixed(1) : v.budget}{v.unit}
                </td>
                <td className="ps-2 py-0.5">
                  {v.value !== null && (
                    <span
                      className={cn(
                        'inline-block h-2 w-2 rounded-full',
                        withinBudget ? 'bg-green-500' : 'bg-red-500',
                      )}
                      aria-label={withinBudget ? 'Within budget' : 'Over budget'}
                    />
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
