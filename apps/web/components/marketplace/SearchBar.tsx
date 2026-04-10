'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  debounceMs?: number
  className?: string
}

export function SearchBar({
  value,
  onChange,
  debounceMs = 300,
  className,
}: SearchBarProps) {
  const t = useTranslations('marketplace')
  const [localValue, setLocalValue] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value
      setLocalValue(next)

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        onChange(next)
      }, debounceMs)
    },
    [onChange, debounceMs],
  )

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange('')
  }, [onChange])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        aria-hidden="true"
      />
      <input
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder={t('searchPlaceholder')}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white py-2.5 ps-10 pe-10 text-sm',
          'text-slate-900 placeholder:text-slate-400',
          'transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
          'dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500',
          'dark:focus:border-primary-400 dark:focus:ring-primary-400/20',
        )}
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            'absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-0.5',
            'text-slate-400 transition-colors hover:text-slate-600',
            'dark:text-slate-500 dark:hover:text-slate-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          )}
          aria-label={t('clearSearch')}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
