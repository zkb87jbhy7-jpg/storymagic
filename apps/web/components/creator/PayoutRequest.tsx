'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Wallet, ArrowDownToLine, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface PayoutHistory {
  id: string
  date: string
  amount: number
  status: 'completed' | 'processing' | 'failed'
}

interface PayoutRequestProps {
  pendingBalance: number
  minimumPayout: number
  currency?: string
  payoutHistory: PayoutHistory[]
  onRequestPayout: () => void | Promise<void>
  className?: string
}

const payoutStatusIcons = {
  completed: CheckCircle2,
  processing: Clock,
  failed: XCircle,
} as const

const payoutStatusStyles = {
  completed: 'text-green-600 dark:text-green-400',
  processing: 'text-amber-600 dark:text-amber-400',
  failed: 'text-red-600 dark:text-red-400',
} as const

export function PayoutRequest({
  pendingBalance,
  minimumPayout,
  currency = 'USD',
  payoutHistory,
  onRequestPayout,
  className,
}: PayoutRequestProps) {
  const t = useTranslations('creator')
  const [isRequesting, setIsRequesting] = useState(false)
  const canRequest = pendingBalance >= minimumPayout

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)

  const handleRequest = useCallback(async () => {
    setIsRequesting(true)
    try {
      await onRequestPayout()
    } finally {
      setIsRequesting(false)
    }
  }, [onRequestPayout])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Pending balance card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <Wallet className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t('pendingBalance')}
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(pendingBalance)}
            </p>
            {!canRequest && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {t('minimumPayout', { amount: formatCurrency(minimumPayout) })}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleRequest}
          disabled={!canRequest || isRequesting}
          className={cn(
            'mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold',
            'bg-green-600 text-white transition-colors hover:bg-green-700',
            'dark:bg-green-500 dark:hover:bg-green-600',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-800',
          )}
        >
          <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
          {isRequesting ? t('requesting') : t('requestPayout')}
        </button>
      </div>

      {/* Payout history */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t('payoutHistory')}
          </h3>
        </div>
        {payoutHistory.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('noPayouts')}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {payoutHistory.map((payout) => {
              const StatusIcon = payoutStatusIcons[payout.status]
              return (
                <li key={payout.id} className="flex items-center gap-3 px-6 py-4">
                  <StatusIcon
                    className={cn('h-5 w-5 shrink-0', payoutStatusStyles[payout.status])}
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatCurrency(payout.amount)}
                    </p>
                    <time
                      dateTime={payout.date}
                      className="text-xs text-slate-500 dark:text-slate-400"
                    >
                      {new Date(payout.date).toLocaleDateString()}
                    </time>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium capitalize',
                      payoutStatusStyles[payout.status],
                    )}
                  >
                    {t(`payoutStatus.${payout.status}`)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
