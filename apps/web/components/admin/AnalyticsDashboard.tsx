'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { Users, BookOpen, DollarSign } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ---- Types ---------------------------------------------------------------

interface StatCard {
  labelKey: string
  value: string
  icon: LucideIcon
  color: string
}

interface FunnelStep {
  labelKey: string
  value: number
  percentage: number
}

// ---- Mock data -----------------------------------------------------------

const STATS: StatCard[] = [
  {
    labelKey: 'totalUsers',
    value: '12,847',
    icon: Users,
    color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30',
  },
  {
    labelKey: 'booksCreated',
    value: '34,219',
    icon: BookOpen,
    color: 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/30',
  },
  {
    labelKey: 'revenue',
    value: '$48,320',
    icon: DollarSign,
    color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30',
  },
]

const FUNNEL: FunnelStep[] = [
  { labelKey: 'signups', value: 12847, percentage: 100 },
  { labelKey: 'profileCreated', value: 10278, percentage: 80 },
  { labelKey: 'firstBookStarted', value: 7708, percentage: 60 },
  { labelKey: 'firstBookCompleted', value: 5139, percentage: 40 },
  { labelKey: 'subscribed', value: 2569, percentage: 20 },
]

const FUNNEL_COLORS = [
  'bg-primary-600 dark:bg-primary-500',
  'bg-primary-500 dark:bg-primary-400',
  'bg-primary-400 dark:bg-primary-300',
  'bg-primary-300 dark:bg-primary-200',
  'bg-primary-200 dark:bg-primary-100',
]

// ---- Component -----------------------------------------------------------

export function AnalyticsDashboard() {
  const t = useTranslations('admin.analytics')

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.labelKey}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    stat.color,
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t(stat.labelKey)}
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Conversion funnel */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          {t('conversionFunnel')}
        </h3>

        <div className="mt-6 space-y-3">
          {FUNNEL.map((step, idx) => (
            <div key={step.labelKey} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {t(step.labelKey)}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {step.value.toLocaleString()} ({step.percentage}%)
                </span>
              </div>
              {/* Stacked bar */}
              <div className="h-6 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    FUNNEL_COLORS[idx],
                  )}
                  style={{ width: `${step.percentage}%` }}
                  role="progressbar"
                  aria-valuenow={step.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t(step.labelKey)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
