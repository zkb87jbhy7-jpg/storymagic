'use client'

import { useLocale as useNextIntlLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { localeDirection, type Locale } from '@/i18n/config'

interface UseLocaleReturn {
  /** Current locale string, e.g. "he" or "en". */
  locale: Locale
  /** Text direction: "rtl" | "ltr". */
  direction: 'rtl' | 'ltr'
  /** Shorthand boolean for RTL. */
  isRTL: boolean
  /** Navigate to the same page in a different locale. */
  switchLocale: (newLocale: Locale) => void
}

/**
 * Convenience hook that wraps next-intl's locale and exposes direction info
 * alongside a locale-switching helper.
 */
export function useLocale(): UseLocaleReturn {
  const locale = useNextIntlLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const direction = localeDirection[locale] ?? 'ltr'

  function switchLocale(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale })
  }

  return {
    locale,
    direction,
    isRTL: direction === 'rtl',
    switchLocale,
  }
}
