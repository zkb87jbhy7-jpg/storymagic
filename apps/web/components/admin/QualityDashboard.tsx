'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { BarChart3, ShieldCheck, UserCheck, Repeat2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface MetricCard {
  labelKey: string
  value: string
  icon: LucideIcon
  trend: 'up' | 'down' | 'flat'
  trendValue: string
  color: string
}

const MOCK_METRICS: MetricCard[] = [
  {
    labelKey: 'avgQualityScore',
    value: '4.2 / 5',
    icon: BarChart3,
    trend: 'up',
    trendValue: '+0.3',
    color: 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/30',
  },
  {
    labelKey: 'safetyBlockRate',
    value: '0.8%',
    icon: ShieldCheck,
    trend: 'down',
    trendValue: '-0.2%',
    color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30',
  },
  {
    labelKey: 'likenessPassRate',
    value: '94.5%',
    icon: UserCheck,
    trend: 'up',
    trendValue: '+1.2%',
    color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30',
  },
  {
    labelKey: 'consistencyPassRate',
    value: '91.3%',
    icon: Repeat2,
    trend: 'flat',
    trendValue: '0%',
    color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30',
  },
]

function TrendBadge({ trend, value }: { trend: string; value: string }) {
  const colors =
    trend === 'up'
      ? 'text-green-600 dark:text-green-400'
      : trend === 'down'
        ? 'text-red-600 dark:text-red-400'
        : 'text-slate-500 dark:text-slate-400'

  return <span className={cn('text-xs font-medium', colors)}>{value}</span>
}

export function QualityDashboard() {
  const t = useTranslations('admin.quality')

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_METRICS.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.labelKey}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    metric.color,
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t(metric.labelKey)}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {metric.value}
                    </p>
                    <TrendBadge trend={metric.trend} value={metric.trendValue} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart placeholder */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          {t('qualityOverTime')}
        </h3>
        <div className="mt-4 flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {t('chartPlaceholder')}
          </p>
        </div>
      </div>
    </div>
  )
}
