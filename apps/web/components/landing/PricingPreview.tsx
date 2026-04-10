'use client'

import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'

interface PlanConfig {
  nameKey: string
  priceKey: string
  frequencyKey: string
  featureKeys: string[]
  highlighted: boolean
  ctaKey: string
  badgeKey?: string
}

const plans: PlanConfig[] = [
  {
    nameKey: 'free',
    priceKey: 'freePrice',
    frequencyKey: 'freeFrequency',
    featureKeys: ['freeFeat1', 'freeFeat2', 'freeFeat3', 'freeFeat4'],
    highlighted: false,
    ctaKey: 'getStarted',
  },
  {
    nameKey: 'monthly',
    priceKey: 'monthlyPrice',
    frequencyKey: 'monthlyFrequency',
    featureKeys: [
      'monthlyFeat1',
      'monthlyFeat2',
      'monthlyFeat3',
      'monthlyFeat4',
      'monthlyFeat5',
    ],
    highlighted: true,
    ctaKey: 'subscribe',
    badgeKey: 'mostPopular',
  },
  {
    nameKey: 'yearly',
    priceKey: 'yearlyPrice',
    frequencyKey: 'yearlyFrequency',
    featureKeys: [
      'yearlyFeat1',
      'yearlyFeat2',
      'yearlyFeat3',
      'yearlyFeat4',
      'yearlyFeat5',
    ],
    highlighted: false,
    ctaKey: 'subscribe',
    badgeKey: 'yearlySavings',
  },
]

export default function PricingPreview() {
  const t = useTranslations('pricing')

  return (
    <section className="bg-white py-20 dark:bg-gray-900 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.nameKey}
              className={`relative flex flex-col overflow-hidden rounded-2xl border ${
                plan.highlighted
                  ? 'border-primary-500 shadow-xl ring-2 ring-primary-500 dark:border-primary-400 dark:ring-primary-400'
                  : 'border-gray-200 shadow-sm dark:border-gray-700'
              } bg-white dark:bg-gray-800`}
            >
              {/* Badge */}
              {plan.badgeKey && (
                <div className="absolute top-0 end-0 rounded-es-xl bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white">
                  {t(plan.badgeKey)}
                </div>
              )}

              <div className="flex flex-1 flex-col p-8">
                {/* Plan name */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t(plan.nameKey)}
                </h3>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {t(plan.priceKey)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t(plan.frequencyKey)}
                  </span>
                </div>

                {/* Features */}
                <ul className="mt-8 flex-1 space-y-4">
                  {plan.featureKeys.map((fk) => (
                    <li key={fk} className="flex items-start gap-3">
                      <Check
                        className="mt-0.5 h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t(fk)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-8">
                  <a
                    href="/register"
                    className={`block w-full rounded-lg px-6 py-3 text-center text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-4 ${
                      plan.highlighted
                        ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-300 dark:focus:ring-primary-800'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600'
                    }`}
                  >
                    {t(plan.ctaKey)}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
