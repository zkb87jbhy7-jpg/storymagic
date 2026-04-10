'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

interface GenerationProgressTrackerProps {
  progress: number
  phase: string
  estimatedTimeRemaining?: number | null
}

export function GenerationProgressTracker({
  progress,
  phase,
  estimatedTimeRemaining,
}: GenerationProgressTrackerProps) {
  const t = useTranslations('bookCreation')

  const clampedProgress = Math.min(100, Math.max(0, progress))

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remaining = seconds % 60
    return `${minutes}m ${remaining}s`
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {phase || t('generating')}
        </span>
        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
          {Math.round(clampedProgress)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={cn(
            'absolute inset-y-0 start-0 rounded-full transition-all duration-500 ease-out',
            'bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500'
          )}
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Animated shimmer */}
          <div
            className={cn(
              'absolute inset-0',
              'bg-gradient-to-r from-transparent via-white/25 to-transparent',
              'animate-shimmer'
            )}
          />
        </div>
      </div>

      {estimatedTimeRemaining != null && estimatedTimeRemaining > 0 && (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          ~{formatTime(estimatedTimeRemaining)} remaining
        </span>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}
