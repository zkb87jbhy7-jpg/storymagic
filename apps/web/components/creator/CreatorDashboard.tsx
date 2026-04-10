'use client'

import { useTranslations } from 'next-intl'
import {
  DollarSign,
  ShoppingBag,
  LayoutTemplate,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SalesTable, type Sale } from './SalesTable'

interface DashboardStats {
  totalSales: number
  totalEarnings: number
  totalTemplates: number
  monthlyGrowth: number
  currency?: string
}

interface CreatorDashboardProps {
  stats: DashboardStats
  recentSales: Sale[]
  className?: string
}

interface StatCardProps {
  label: string
  value: string
  icon: React.ElementType
  trend?: number
  color: string
}

function StatCard({ label, value, icon: Icon, trend, color }: StatCardProps) {
  const t = useTranslations('creator')

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            color,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        {trend !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
              trend >= 0
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            )}
          >
            <TrendingUp
              className={cn('h-3 w-3', trend < 0 && 'rotate-180')}
              aria-hidden="true"
            />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

export function CreatorDashboard({
  stats,
  recentSales,
  className,
}: CreatorDashboardProps) {
  const t = useTranslations('creator')
  const currency = stats.currency ?? 'USD'

  const formattedEarnings = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(stats.totalEarnings)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('totalSales')}
          value={stats.totalSales.toLocaleString()}
          icon={ShoppingBag}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          label={t('totalEarnings')}
          value={formattedEarnings}
          icon={DollarSign}
          trend={stats.monthlyGrowth}
          color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatCard
          label={t('totalTemplates')}
          value={stats.totalTemplates.toString()}
          icon={LayoutTemplate}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
        <StatCard
          label={t('monthlyGrowth')}
          value={`${stats.monthlyGrowth >= 0 ? '+' : ''}${stats.monthlyGrowth}%`}
          icon={TrendingUp}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
      </div>

      {/* Recent sales */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          {t('recentSales')}
        </h2>
        <SalesTable sales={recentSales} currency={currency} />
      </section>
    </div>
  )
}
