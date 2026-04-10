'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { User, Accessibility, ShieldCheck, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface SettingsLink {
  href: string
  titleKey: string
  descriptionKey: string
  icon: LucideIcon
}

const settingsLinks: SettingsLink[] = [
  {
    href: '/settings/profile',
    titleKey: 'profileTitle',
    descriptionKey: 'profileDescription',
    icon: User,
  },
  {
    href: '/settings/accessibility',
    titleKey: 'accessibilityTitle',
    descriptionKey: 'accessibilityDescription',
    icon: Accessibility,
  },
  {
    href: '/settings/privacy',
    titleKey: 'privacyTitle',
    descriptionKey: 'privacyDescription',
    icon: ShieldCheck,
  },
]

export default function SettingsPage() {
  const t = useTranslations('settings')

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        {t('title')}
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {t('subtitle')}
      </p>

      <nav className="space-y-3" aria-label={t('title')}>
        {settingsLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5',
                'shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                'dark:border-slate-700 dark:bg-slate-800',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                  'bg-primary-50 text-primary-600',
                  'dark:bg-primary-900/30 dark:text-primary-400',
                )}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t(link.titleKey)}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {t(link.descriptionKey)}
                </p>
              </div>
              <ChevronRight
                className="h-5 w-5 shrink-0 text-slate-400 rtl:rotate-180 dark:text-slate-500"
                aria-hidden="true"
              />
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
