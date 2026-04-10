'use client'

import { useTranslations } from 'next-intl'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Currency } from './CurrencyToggle'

export interface Plan {
  id: string
  nameKey: string
  prices: Record<Currency, number>
  interval: 'month' | 'year'
  features: string[]
  highlighted?: boolean
  badge?: string
}

interface PlanCardProps {
  plan: Plan
  currency: Currency
  onSelect: (planId: string) => void
  isCurrentPlan?: boolean
  className?: string
}

export function PlanCard({
  plan,
  currency,
  onSelect,
  isCurrentPlan = false,
  className,
}: PlanCardProps) {
  const t = useTranslations('pricing')

  const formattedPrice = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(plan.prices[currency])

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border p-6 shadow-sm transition-all',
        plan.highlighted
          ? 'border-primary-500 bg-white ring-2 ring-primary-500/20 dark:bg-slate-800'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
        className,
      )}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3 start-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white dark:bg-primary-500">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {t(plan.badge)}
          </span>
        </div>
      )}

      {/* Plan name */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {t(plan.nameKey)}
      </h3>

      {/* Price */}
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-slate-900 dark:text-white">
          {formattedPrice}
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          /{t(plan.interval)}
        </span>
      </div>

      {/* Features */}
      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
          >
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-green-500 dark:text-green-400"
              aria-hidden="true"
            />
            {t(feature)}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        type="button"
        onClick={() => onSelect(plan.id)}
        disabled={isCurrentPlan}
        className={cn(
          'mt-6 w-full rounded-xl px-6 py-3 text-sm font-semibold transition-colors',
          plan.highlighted
            ? 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
            : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-slate-800',
        )}
      >
        {isCurrentPlan ? t('currentPlan') : t('selectPlan')}
      </button>
    </div>
  )
}
