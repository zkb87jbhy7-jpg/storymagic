'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

interface StylePreviewCardProps {
  styleKey: string
  selected: boolean
  onSelect: () => void
  swatch: string
  description: string
}

export function StylePreviewCard({
  styleKey,
  selected,
  onSelect,
  swatch,
  description,
}: StylePreviewCardProps) {
  const t = useTranslations('bookCreation.styles')

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border-2 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'dark:focus-visible:ring-offset-slate-900',
        selected
          ? 'border-primary-500 ring-2 ring-primary-500/30 dark:border-primary-400 dark:ring-primary-400/30'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
      )}
    >
      <div
        className={cn(
          'aspect-square transition-transform duration-200 group-hover:scale-105',
          swatch
        )}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-0.5 px-2 py-2 text-start">
        <span
          className={cn(
            'text-sm font-semibold',
            selected
              ? 'text-primary-700 dark:text-primary-300'
              : 'text-slate-900 dark:text-white'
          )}
        >
          {t(styleKey)}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {description}
        </span>
      </div>
    </button>
  )
}
