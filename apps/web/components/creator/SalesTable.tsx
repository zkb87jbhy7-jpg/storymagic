'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

export interface Sale {
  id: string
  date: string
  templateName: string
  buyerName: string
  amount: number
  status: 'completed' | 'pending' | 'refunded'
}

interface SalesTableProps {
  sales: Sale[]
  currency?: string
  className?: string
}

const statusStyles: Record<Sale['status'], string> = {
  completed:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  refunded:
    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export function SalesTable({
  sales,
  currency = 'USD',
  className,
}: SalesTableProps) {
  const t = useTranslations('creator')

  if (sales.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('noSales')}
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
        className,
      )}
    >
      <table className="w-full min-w-[600px] text-start">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('date')}
            </th>
            <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('template')}
            </th>
            <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('buyer')}
            </th>
            <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('amount')}
            </th>
            <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('status')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {sales.map((sale) => (
            <tr
              key={sale.id}
              className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600 dark:text-slate-300">
                <time dateTime={sale.date}>
                  {new Date(sale.date).toLocaleDateString()}
                </time>
              </td>
              <td className="px-5 py-3 text-sm font-medium text-slate-900 dark:text-white">
                {sale.templateName}
              </td>
              <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">
                {sale.buyerName}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-slate-900 dark:text-white">
                {new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency,
                }).format(sale.amount)}
              </td>
              <td className="px-5 py-3">
                <span
                  className={cn(
                    'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                    statusStyles[sale.status],
                  )}
                >
                  {t(`saleStatus.${sale.status}`)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
