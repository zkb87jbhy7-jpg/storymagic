'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { BookOpen, Map } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type LibraryView = 'shelf' | 'map'

interface LibraryViewToggleProps {
  view: LibraryView
  onChange: (view: LibraryView) => void
  className?: string
}

export function LibraryViewToggle({ view, onChange, className }: LibraryViewToggleProps) {
  const t = useTranslations('library')

  const options: { key: LibraryView; icon: React.ComponentType<{ className?: string }>; labelKey: string }[] = [
    { key: 'shelf', icon: BookOpen, labelKey: 'viewShelf' },
    { key: 'map', icon: Map, labelKey: 'viewMap' },
  ]

  return (
    <div
      className={cn(
        'relative flex gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5',
        'dark:border-slate-700 dark:bg-slate-800',
        className
      )}
      role="radiogroup"
      aria-label={t('viewToggle')}
    >
      {options.map(({ key, icon: Icon, labelKey }) => {
        const isActive = view === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            role="radio"
            aria-checked={isActive}
            className={cn(
              'relative z-10 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'text-primary-700 dark:text-primary-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="library-view-toggle"
                className="absolute inset-0 rounded-md bg-white shadow-sm dark:bg-slate-700"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10">{t(labelKey)}</span>
          </button>
        )
      })}
    </div>
  )
}
