'use client'

import type { LucideIcon } from 'lucide-react'
import { PackageOpen } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: LucideIcon
  className?: string
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = PackageOpen,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-4 py-12 text-center',
        className
      )}
    >
      <div
        className={cn(
          'mb-4 flex h-16 w-16 items-center justify-center rounded-full',
          'bg-slate-100 dark:bg-slate-800'
        )}
      >
        <Icon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
      </div>

      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={cn(
            'mt-6 inline-flex items-center justify-center rounded-lg px-4 py-2.5',
            'text-sm font-medium text-white transition-colors',
            'bg-primary-600 hover:bg-primary-700',
            'dark:bg-primary-500 dark:hover:bg-primary-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-900'
          )}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
