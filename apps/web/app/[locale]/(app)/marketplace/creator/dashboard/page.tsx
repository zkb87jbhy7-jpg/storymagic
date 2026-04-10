'use client'

import { useTranslations } from 'next-intl'
import { BarChart3 } from 'lucide-react'
import { CreatorDashboard } from '@/components/creator/CreatorDashboard'

const mockStats = {
  totalSales: 0,
  totalEarnings: 0,
  totalTemplates: 0,
  monthlyGrowth: 0,
  currency: 'USD',
}

export default function CreatorDashboardPage() {
  const t = useTranslations('creator')

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('dashboardTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('dashboardSubtitle')}
          </p>
        </div>
      </div>

      <CreatorDashboard stats={mockStats} recentSales={[]} />
    </div>
  )
}
