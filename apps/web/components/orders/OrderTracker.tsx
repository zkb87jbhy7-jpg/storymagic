'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { TrackingTimeline } from './TrackingTimeline'
import type { OrderStatus } from './OrderCard'

interface OrderTrackerProps {
  status: OrderStatus
  dates: {
    ordered?: string
    processing?: string
    printing?: string
    shipped?: string
    delivered?: string
  }
  trackingNumber?: string
  carrier?: string
  className?: string
}

const statusOrder: OrderStatus[] = [
  'pending',
  'processing',
  'printing',
  'shipped',
  'delivered',
]

export function OrderTracker({
  status,
  dates,
  trackingNumber,
  carrier,
  className,
}: OrderTrackerProps) {
  const t = useTranslations('orders')

  const currentIndex = statusOrder.indexOf(status)

  const steps = [
    { id: 'ordered', labelKey: 'timeline.ordered', date: dates.ordered },
    { id: 'processing', labelKey: 'timeline.processing', date: dates.processing },
    { id: 'printing', labelKey: 'timeline.printing', date: dates.printing },
    { id: 'shipped', labelKey: 'timeline.shipped', date: dates.shipped },
    { id: 'delivered', labelKey: 'timeline.delivered', date: dates.delivered },
  ].map((step, index) => ({
    ...step,
    completed: index <= currentIndex && status !== 'cancelled',
    current: index === currentIndex && status !== 'cancelled',
  }))

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800',
        className,
      )}
    >
      <h3 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
        {t('orderTracking')}
      </h3>

      {status === 'cancelled' ? (
        <div className="rounded-xl bg-red-50 p-4 text-center dark:bg-red-900/10">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {t('orderCancelled')}
          </p>
        </div>
      ) : (
        <TrackingTimeline steps={steps} />
      )}

      {/* Tracking info */}
      {trackingNumber && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('trackingNumber')}
          </p>
          <p className="mt-1 text-sm font-mono font-semibold text-slate-900 dark:text-white">
            {trackingNumber}
          </p>
          {carrier && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('carrier')}: {carrier}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
