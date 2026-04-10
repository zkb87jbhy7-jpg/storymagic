'use client'

import { useTranslations } from 'next-intl'
import { Camera, PenTool, BookOpen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Step {
  icon: LucideIcon
  titleKey: string
  descKey: string
  color: string
}

const steps: Step[] = [
  {
    icon: Camera,
    titleKey: 'step1Title',
    descKey: 'step1Desc',
    color: 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300',
  },
  {
    icon: PenTool,
    titleKey: 'step2Title',
    descKey: 'step2Desc',
    color: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900 dark:text-secondary-300',
  },
  {
    icon: BookOpen,
    titleKey: 'step3Title',
    descKey: 'step3Desc',
    color: 'bg-accent-100 text-accent-600 dark:bg-accent-900 dark:text-accent-300',
  },
]

export default function HowItWorks() {
  const t = useTranslations('landing')

  return (
    <section className="bg-white py-20 dark:bg-gray-900 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {t('howItWorksTitle')}
        </h2>

        <div className="mt-16 flex flex-col items-center gap-12 md:flex-row md:items-start md:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.titleKey}
                className="flex flex-1 flex-col items-center text-center"
              >
                {/* Step number and connector */}
                <div className="relative">
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-2xl ${step.color} shadow-md`}
                  >
                    <Icon className="h-10 w-10" aria-hidden="true" />
                  </div>
                  <span className="absolute -top-2 -end-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white shadow">
                    {index + 1}
                  </span>
                </div>

                {/* Connector line (hidden on mobile, visible on md+) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:absolute md:top-10 md:start-full md:block md:h-0.5 md:w-full md:bg-gray-200 md:dark:bg-gray-700" />
                )}

                <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                  {t(step.titleKey)}
                </h3>
                <p className="mt-3 max-w-xs text-base text-gray-600 dark:text-gray-400">
                  {t(step.descKey)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
