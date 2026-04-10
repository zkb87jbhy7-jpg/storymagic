'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
} as const

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
} as const

export function LoadingSpinner({ size = 'md', text, className }: LoadingSpinnerProps) {
  const t = useTranslations('common')
  const displayText = text ?? t('loading')

  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3', className)}
      role="status"
      aria-label={displayText}
    >
      <div
        className={cn(
          'animate-spin rounded-full',
          'border-slate-200 border-t-primary-600',
          'dark:border-slate-700 dark:border-t-primary-400',
          sizeClasses[size]
        )}
      />
      {displayText && (
        <p
          className={cn(
            'font-medium text-slate-500 dark:text-slate-400',
            textSizeClasses[size]
          )}
        >
          {displayText}
        </p>
      )}
    </div>
  )
}
