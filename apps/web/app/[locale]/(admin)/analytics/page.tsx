'use client'

import { useTranslations } from 'next-intl'
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'

export default function AnalyticsPage() {
  const t = useTranslations('admin.analytics')

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('pageTitle')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {t('pageDescription')}
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  )
}
