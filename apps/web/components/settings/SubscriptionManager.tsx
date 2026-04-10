'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
  XCircle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface CurrentSubscription {
  planId: string
  planName: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  currentPeriodEnd: string
  price: number
  currency: string
  interval: 'month' | 'year'
}

interface SubscriptionManagerProps {
  subscription: CurrentSubscription | null
  stripePortalUrl?: string
  onUpgrade?: () => void
  onDowngrade?: () => void
  onCancel?: () => void
  className?: string
}

const statusConfig = {
  active: {
    label: 'statusActive',
    style: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle2,
  },
  trialing: {
    label: 'statusTrialing',
    style: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'statusCancelled',
    style: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
    icon: XCircle,
  },
  past_due: {
    label: 'statusPastDue',
    style: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
  },
} as const

export function SubscriptionManager({
  subscription,
  stripePortalUrl,
  onUpgrade,
  onDowngrade,
  onCancel,
  className,
}: SubscriptionManagerProps) {
  const t = useTranslations('settings')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const handleCancel = useCallback(() => {
    setShowCancelConfirm(false)
    onCancel?.()
  }, [onCancel])

  if (!subscription) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800',
          className,
        )}
      >
        <div className="text-center">
          <CreditCard
            className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600"
            aria-hidden="true"
          />
          <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
            {t('noSubscription')}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('noSubscriptionDescription')}
          </p>
          <a
            href="/pricing"
            className={cn(
              'mt-4 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold',
              'bg-primary-600 text-white transition-colors hover:bg-primary-700',
              'dark:bg-primary-500 dark:hover:bg-primary-600',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            )}
          >
            {t('viewPlans')}
          </a>
        </div>
      </div>
    )
  }

  const config = statusConfig[subscription.status]
  const StatusIcon = config.icon

  const formattedPrice = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: subscription.currency,
  }).format(subscription.price)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Current plan card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {subscription.planName}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  config.style,
                )}
              >
                <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {t(config.label)}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {formattedPrice}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                /{t(subscription.interval)}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {t('renewsOn', {
                date: new Date(subscription.currentPeriodEnd).toLocaleDateString(),
              })}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          {onUpgrade && (
            <button
              type="button"
              onClick={onUpgrade}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold',
                'bg-primary-600 text-white transition-colors hover:bg-primary-700',
                'dark:bg-primary-500 dark:hover:bg-primary-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                'dark:focus-visible:ring-offset-slate-800',
              )}
            >
              <ArrowUpCircle className="h-4 w-4" aria-hidden="true" />
              {t('upgrade')}
            </button>
          )}
          {onDowngrade && (
            <button
              type="button"
              onClick={onDowngrade}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium',
                'border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50',
                'dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              )}
            >
              <ArrowDownCircle className="h-4 w-4" aria-hidden="true" />
              {t('downgrade')}
            </button>
          )}
          {stripePortalUrl && (
            <a
              href={stripePortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium',
                'border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50',
                'dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              )}
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              {t('manageInStripe')}
            </a>
          )}
        </div>
      </div>

      {/* Cancel subscription */}
      {subscription.status === 'active' && onCancel && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800/50 dark:bg-red-900/10">
          {showCancelConfirm ? (
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {t('cancelConfirmMessage')}
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className={cn(
                    'rounded-xl px-5 py-2.5 text-sm font-semibold',
                    'bg-red-600 text-white transition-colors hover:bg-red-700',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
                  )}
                >
                  {t('confirmCancel')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  className={cn(
                    'rounded-xl px-5 py-2.5 text-sm font-medium',
                    'border border-red-300 text-red-700 transition-colors hover:bg-red-100',
                    'dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
                  )}
                >
                  {t('keepSubscription')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className={cn(
                'inline-flex items-center gap-2 text-sm font-medium',
                'text-red-600 transition-colors hover:text-red-700',
                'dark:text-red-400 dark:hover:text-red-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:rounded',
              )}
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
              {t('cancelSubscription')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
