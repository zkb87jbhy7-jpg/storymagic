'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

interface MonthlyEarning {
  month: string
  amount: number
}

interface EarningsChartProps {
  data: MonthlyEarning[]
  currency?: string
  className?: string
}

export function EarningsChart({
  data,
  currency = 'USD',
  className,
}: EarningsChartProps) {
  const t = useTranslations('creator')

  const maxAmount = useMemo(
    () => Math.max(...data.map((d) => d.amount), 1),
    [data],
  )

  const totalEarnings = useMemo(
    () => data.reduce((sum, d) => sum + d.amount, 0),
    [data],
  )

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(
      amount,
    )

  if (data.length === 0) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800',
          className,
        )}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t('noEarningsData')}
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800',
        className,
      )}
    >
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t('earningsOverview')}
        </h3>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {t('total')}: {formatCurrency(totalEarnings)}
        </span>
      </div>

      {/* SVG bar chart */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${data.length * 60 + 40} 220`}
          className="min-w-full"
          role="img"
          aria-label={t('earningsChart')}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const y = 180 - fraction * 160
            return (
              <g key={fraction}>
                <line
                  x1="40"
                  y1={y}
                  x2={data.length * 60 + 20}
                  y2={y}
                  className="stroke-slate-100 dark:stroke-slate-700"
                  strokeWidth="1"
                />
                <text
                  x="36"
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] dark:fill-slate-500"
                >
                  {formatCurrency(maxAmount * fraction)}
                </text>
              </g>
            )
          })}

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.amount / maxAmount) * 160
            const x = 40 + index * 60
            const y = 180 - barHeight
            return (
              <g key={item.month}>
                {/* Bar */}
                <rect
                  x={x + 10}
                  y={y}
                  width="32"
                  height={barHeight}
                  rx="4"
                  className="fill-primary-500 transition-all hover:fill-primary-600 dark:fill-primary-400 dark:hover:fill-primary-300"
                />
                {/* Month label */}
                <text
                  x={x + 26}
                  y="200"
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px] dark:fill-slate-400"
                >
                  {item.month}
                </text>
                {/* Value on hover (tooltip) */}
                <title>{`${item.month}: ${formatCurrency(item.amount)}`}</title>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
