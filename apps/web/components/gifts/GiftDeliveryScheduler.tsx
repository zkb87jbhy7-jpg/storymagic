'use client'

import { useTranslations } from 'next-intl'
import { CalendarDays, Clock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface GiftDeliverySchedulerProps {
  date: string
  onDateChange: (date: string) => void
  time?: string
  onTimeChange?: (time: string) => void
  className?: string
}

export function GiftDeliveryScheduler({
  date,
  onDateChange,
  time = '09:00',
  onTimeChange,
  className,
}: GiftDeliverySchedulerProps) {
  const t = useTranslations('gifts')

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
        <CalendarDays className="h-4 w-4 text-primary-500" aria-hidden="true" />
        {t('scheduleDelivery')}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Date picker */}
        <div>
          <label
            htmlFor="delivery-date"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {t('deliveryDate')}
          </label>
          <div className="relative mt-1.5">
            <CalendarDays
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="delivery-date"
              type="date"
              value={date}
              min={today}
              onChange={(e) => onDateChange(e.target.value)}
              className={cn(
                'w-full rounded-xl border border-slate-200 bg-white py-2.5 ps-10 pe-4 text-sm',
                'text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
              )}
            />
          </div>
        </div>

        {/* Time picker */}
        <div>
          <label
            htmlFor="delivery-time"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {t('deliveryTime')}
          </label>
          <div className="relative mt-1.5">
            <Clock
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="delivery-time"
              type="time"
              value={time}
              onChange={(e) => onTimeChange?.(e.target.value)}
              className={cn(
                'w-full rounded-xl border border-slate-200 bg-white py-2.5 ps-10 pe-4 text-sm',
                'text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
              )}
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t('deliveryNote')}
      </p>
    </div>
  )
}
