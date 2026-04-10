'use client'

import { useTranslations } from 'next-intl'
import { CreditCard } from 'lucide-react'
import { SubscriptionManager } from '@/components/settings/SubscriptionManager'
import { PricingTable } from '@/components/pricing/PricingTable'

export default function SubscriptionPage() {
  const t = useTranslations('settings')

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          <CreditCard className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('subscriptionTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('subscriptionSubtitle')}
          </p>
        </div>
      </div>

      {/* Current subscription */}
      <SubscriptionManager
        subscription={null}
        onUpgrade={() => {
          document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })
        }}
      />

      {/* Pricing table */}
      <div id="pricing-section">
        <PricingTable
          onSelectPlan={async (planId) => {
            const res = await fetch('/api/stripe/checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ planId }),
            })
            if (res.ok) {
              const { url } = await res.json()
              window.location.href = url
            }
          }}
        />
      </div>
    </div>
  )
}
