'use client'

import { useTranslations } from 'next-intl'
import { BookOpen, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'printing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

interface OrderCardProps {
  id: string
  bookTitle: string
  coverType: 'hardcover' | 'softcover'
  status: OrderStatus
  date: string
  amount: number
  currency?: string
  coverImageUrl?: string
  className?: string
}

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  printing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export function OrderCard({
  id,
  bookTitle,
  coverType,
  status,
  date,
  amount,
  currency = 'USD',
  coverImageUrl,
  className,
}: OrderCardProps) {
  const t = useTranslations('orders')

  const formattedAmount = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(amount)

  return (
    <a
      href={`/orders/${id}`}
      className={cn(
        'flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        'dark:border-slate-700 dark:bg-slate-800',
        className,
      )}
    >
      {/* Cover thumbnail */}
      <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={bookTitle}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-5 w-5 text-slate-300 dark:text-slate-500" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
          {bookTitle}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
              statusStyles[status],
            )}
          >
            {t(`status.${status}`)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t(`cover.${coverType}`)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <time dateTime={date}>{new Date(date).toLocaleDateString()}</time>
          <span className="font-medium text-slate-900 dark:text-white">
            {formattedAmount}
          </span>
        </div>
      </div>

      <ChevronRight
        className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500"
        aria-hidden="true"
      />
    </a>
  )
}
