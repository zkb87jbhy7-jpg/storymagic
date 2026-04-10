'use client'

import { useTranslations } from 'next-intl'
import { Sparkles } from 'lucide-react'

export default function CTASection() {
  const t = useTranslations('landing')

  return (
    <section className="bg-primary-600 dark:bg-primary-800">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t('ctaTitle')}
        </h2>
        <p className="mt-4 text-lg text-primary-100">
          {t('ctaSubtitle')}
        </p>
        <div className="mt-10">
          <a
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-primary-700 shadow-lg transition-all duration-200 hover:bg-primary-50 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50 active:scale-95"
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            {t('ctaButton')}
          </a>
        </div>
      </div>
    </section>
  )
}
