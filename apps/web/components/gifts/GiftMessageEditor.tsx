'use client'

import { useTranslations } from 'next-intl'
import { MessageSquareHeart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface GiftMessageEditorProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
  className?: string
}

export function GiftMessageEditor({
  value,
  onChange,
  maxLength = 250,
  className,
}: GiftMessageEditorProps) {
  const t = useTranslations('gifts')

  const remaining = maxLength - value.length
  const isNearLimit = remaining <= 20

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor="gift-message"
        className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"
      >
        <MessageSquareHeart className="h-4 w-4 text-pink-500" aria-hidden="true" />
        {t('personalMessage')}
      </label>
      <textarea
        id="gift-message"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        rows={4}
        placeholder={t('messagePlaceholder')}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm',
          'text-slate-900 placeholder:text-slate-400',
          'transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
          'dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500',
        )}
      />
      <p
        className={cn(
          'text-end text-xs',
          isNearLimit
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-slate-500 dark:text-slate-400',
        )}
      >
        {t('charactersRemaining', { count: remaining })}
      </p>
    </div>
  )
}
