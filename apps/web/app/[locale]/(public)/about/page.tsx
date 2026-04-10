'use client'

import { useTranslations } from 'next-intl'
import { Shield, Heart, Accessibility } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ValueCard {
  titleKey: string
  descKey: string
  icon: LucideIcon
  color: string
}

const values: ValueCard[] = [
  {
    titleKey: 'valueSafety',
    descKey: 'valueSafetyDesc',
    icon: Shield,
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
  },
  {
    titleKey: 'valueDiversity',
    descKey: 'valueDiversityDesc',
    icon: Heart,
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300',
  },
  {
    titleKey: 'valueAccessibility',
    descKey: 'valueAccessibilityDesc',
    icon: Accessibility,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
  },
]

export default function AboutPage() {
  const t = useTranslations('about')

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Page title */}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          {t('title')}
        </h1>

        {/* Mission */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t('missionTitle')}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            {t('missionText')}
          </p>
        </section>

        {/* How we do it */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t('howTitle')}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            {t('howText')}
          </p>
        </section>

        {/* Values */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t('valuesTitle')}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div
                  key={value.titleKey}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${value.color}`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                    {t(value.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {t(value.descKey)}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
