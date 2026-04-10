'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface TimelineStep {
  id: string
  labelKey: string
  date?: string
  completed: boolean
  current?: boolean
}

interface TrackingTimelineProps {
  steps: TimelineStep[]
  className?: string
}

export function TrackingTimeline({ steps, className }: TrackingTimelineProps) {
  const t = useTranslations('orders')

  return (
    <div className={cn('relative', className)}>
      <ol className="space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          return (
            <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Vertical line */}
              {!isLast && (
                <div
                  className={cn(
                    'absolute start-[15px] top-8 h-full w-0.5',
                    step.completed
                      ? 'bg-green-400 dark:bg-green-500'
                      : 'bg-slate-200 dark:bg-slate-700',
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Status dot */}
              <div className="relative z-10 shrink-0">
                {step.completed ? (
                  <CheckCircle2
                    className="h-8 w-8 text-green-500 dark:text-green-400"
                    aria-hidden="true"
                  />
                ) : step.current ? (
                  <div className="flex h-8 w-8 items-center justify-center">
                    <div className="h-4 w-4 animate-pulse rounded-full bg-primary-500 ring-4 ring-primary-100 dark:ring-primary-900/50" />
                  </div>
                ) : (
                  <Circle
                    className="h-8 w-8 text-slate-300 dark:text-slate-600"
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 pt-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    step.completed || step.current
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-400 dark:text-slate-500',
                  )}
                >
                  {t(step.labelKey)}
                </p>
                {step.date && (
                  <time
                    dateTime={step.date}
                    className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400"
                  >
                    {new Date(step.date).toLocaleString()}
                  </time>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
