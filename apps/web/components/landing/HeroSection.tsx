'use client'

import { useTranslations } from 'next-intl'
import { BookOpen } from 'lucide-react'

export default function HeroSection() {
  const t = useTranslations('landing')

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-secondary-500">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="flex flex-col items-center text-center lg:flex-row lg:text-start lg:gap-12">
          {/* Text content */}
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t('heroTitle')}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
              {t('heroSubtitle')}
            </p>
            <div className="mt-10">
              <a
                href="/create"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-primary-700 shadow-lg transition-all duration-200 hover:bg-primary-50 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50 active:scale-95"
              >
                <BookOpen className="h-5 w-5" aria-hidden="true" />
                {t('heroCta')}
              </a>
            </div>
          </div>

          {/* Illustration placeholder */}
          <div className="mt-12 flex-1 lg:mt-0">
            <div className="mx-auto aspect-square w-full max-w-md rounded-3xl bg-white/10 p-8 backdrop-blur-sm">
              <div className="flex h-full w-full items-center justify-center rounded-2xl border-2 border-dashed border-white/30">
                <BookOpen className="h-24 w-24 text-white/50" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
