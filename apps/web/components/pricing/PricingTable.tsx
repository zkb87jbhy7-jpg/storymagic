'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { PlanCard, type Plan } from './PlanCard'
import { CurrencyToggle, type Currency } from './CurrencyToggle'
import { FeatureComparison } from './FeatureComparison'

interface PricingTableProps {
  currentPlanId?: string
  onSelectPlan?: (planId: string) => void
  className?: string
}

const plans: Plan[] = [
  {
    id: 'free',
    nameKey: 'planFree',
    prices: { USD: 0, ILS: 0, EUR: 0 },
    interval: 'month',
    features: [
      'featureFree1',
      'featureFree2',
      'featureFree3',
      'featureFree4',
    ],
  },
  {
    id: 'pro',
    nameKey: 'planPro',
    prices: { USD: 9.99, ILS: 36.99, EUR: 8.99 },
    interval: 'month',
    highlighted: true,
    badge: 'mostPopular',
    features: [
      'featurePro1',
      'featurePro2',
      'featurePro3',
      'featurePro4',
      'featurePro5',
      'featurePro6',
    ],
  },
  {
    id: 'premium',
    nameKey: 'planPremium',
    prices: { USD: 19.99, ILS: 73.99, EUR: 17.99 },
    interval: 'month',
    features: [
      'featurePremium1',
      'featurePremium2',
      'featurePremium3',
      'featurePremium4',
      'featurePremium5',
      'featurePremium6',
      'featurePremium7',
    ],
  },
]

export function PricingTable({
  currentPlanId,
  onSelectPlan,
  className,
}: PricingTableProps) {
  const t = useTranslations('pricing')
  const [currency, setCurrency] = useState<Currency>('USD')

  const handleSelect = useCallback(
    (planId: string) => {
      onSelectPlan?.(planId)
    },
    [onSelectPlan],
  )

  return (
    <div className={cn('space-y-10', className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t('pricingTitle')}
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
          {t('pricingSubtitle')}
        </p>
        <div className="mt-6 flex justify-center">
          <CurrencyToggle value={currency} onChange={setCurrency} />
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currency={currency}
            onSelect={handleSelect}
            isCurrentPlan={currentPlanId === plan.id}
          />
        ))}
      </div>

      {/* Feature comparison */}
      <section>
        <h3 className="mb-6 text-center text-xl font-semibold text-slate-900 dark:text-white">
          {t('compareFeatures')}
        </h3>
        <FeatureComparison />
      </section>
    </div>
  )
}
