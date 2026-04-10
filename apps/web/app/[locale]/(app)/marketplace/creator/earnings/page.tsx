'use client'

import { useTranslations } from 'next-intl'
import { DollarSign } from 'lucide-react'
import { EarningsChart } from '@/components/creator/EarningsChart'
import { PayoutRequest } from '@/components/creator/PayoutRequest'

export default function EarningsPage() {
  const t = useTranslations('creator')

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <DollarSign className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('earningsTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('earningsSubtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Chart */}
        <div className="lg:col-span-3">
          <EarningsChart data={[]} currency="USD" />
        </div>

        {/* Payout */}
        <div className="lg:col-span-2">
          <PayoutRequest
            pendingBalance={0}
            minimumPayout={25}
            currency="USD"
            payoutHistory={[]}
            onRequestPayout={async () => {
              await fetch('/api/creator/payout', { method: 'POST' })
            }}
          />
        </div>
      </div>
    </div>
  )
}
