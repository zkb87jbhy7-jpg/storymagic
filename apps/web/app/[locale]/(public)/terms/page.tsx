'use client'

import { useTranslations } from 'next-intl'

interface TermsSection {
  titleKey: string
  textKey: string
}

const sections: TermsSection[] = [
  { titleKey: 'acceptanceTitle', textKey: 'acceptanceText' },
  { titleKey: 'accountTitle', textKey: 'accountText' },
  { titleKey: 'contentTitle', textKey: 'contentText' },
  { titleKey: 'prohibitedTitle', textKey: 'prohibitedText' },
  { titleKey: 'limitationTitle', textKey: 'limitationText' },
  { titleKey: 'changesTitle', textKey: 'changesText' },
  { titleKey: 'contactTitle', textKey: 'contactText' },
]

export default function TermsPage() {
  const t = useTranslations('terms')

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {t('lastUpdated', { date: '2026-04-01' })}
        </p>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.titleKey}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t(section.titleKey)}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">
                {t(section.textKey)}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
