'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Zap, Palette, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type OnboardingMode = 'quick' | 'creative' | 'guided'

interface OnboardingSelectorProps {
  defaultValue?: OnboardingMode
  onSelect: (mode: OnboardingMode) => void
}

const modes = [
  { key: 'quick' as const, icon: Zap },
  { key: 'creative' as const, icon: Palette },
  { key: 'guided' as const, icon: BookOpen },
]

/**
 * Three selectable cards for onboarding mode:
 * - Quick: "3 questions, book ready"
 * - Creative: "full access to all tools"
 * - Guided: "step-by-step with explanations"
 */
export default function OnboardingSelector({
  defaultValue,
  onSelect,
}: OnboardingSelectorProps) {
  const t = useTranslations('onboarding')
  const [selected, setSelected] = useState<OnboardingMode | null>(
    defaultValue ?? null
  )

  function handleSelect(mode: OnboardingMode) {
    setSelected(mode)
    onSelect(mode)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t('title')}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-3" role="radiogroup" aria-label={t('subtitle')}>
        {modes.map(({ key, icon: Icon }) => {
          const isSelected = selected === key
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(key)}
              className={cn(
                'group flex flex-col items-center gap-3 rounded-xl border-2 p-6',
                'text-center transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                'dark:focus-visible:ring-offset-slate-900',
                isSelected
                  ? cn(
                      'border-primary-500 bg-primary-50 shadow-md shadow-primary-500/10',
                      'dark:border-primary-400 dark:bg-primary-950/30 dark:shadow-primary-400/10'
                    )
                  : cn(
                      'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
                      'dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600'
                    )
              )}
            >
              {/* Icon circle */}
              <span
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                  isSelected
                    ? 'bg-primary-600 text-white dark:bg-primary-500'
                    : cn(
                        'bg-slate-100 text-slate-500',
                        'group-hover:bg-primary-100 group-hover:text-primary-600',
                        'dark:bg-slate-700 dark:text-slate-400',
                        'dark:group-hover:bg-primary-900/40 dark:group-hover:text-primary-400'
                      )
                )}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>

              {/* Title */}
              <h3
                className={cn(
                  'text-base font-semibold transition-colors',
                  isSelected
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-slate-900 dark:text-slate-100'
                )}
              >
                {t(key)}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {t(`${key}Desc`)}
              </p>

              {/* Selected indicator */}
              {isSelected && (
                <span
                  className={cn(
                    'mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full',
                    'bg-primary-600 text-white dark:bg-primary-500'
                  )}
                  aria-hidden="true"
                >
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M3 6l2.5 2.5L9.5 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
