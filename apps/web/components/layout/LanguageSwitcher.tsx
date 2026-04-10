'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { localeNames, type Locale } from '@/i18n/config'
import { Languages } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const nextLocale: Locale = locale === 'he' ? 'en' : 'he'

  function handleSwitch() {
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <button
      onClick={handleSwitch}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium',
        'text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900',
        'dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        className
      )}
      aria-label={`Switch to ${localeNames[nextLocale]}`}
    >
      <Languages className="h-4 w-4" />
      <span>{localeNames[nextLocale]}</span>
    </button>
  )
}
