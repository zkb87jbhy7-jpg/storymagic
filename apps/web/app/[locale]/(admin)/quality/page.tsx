'use client'

import { useTranslations } from 'next-intl'
import { QualityDashboard } from '@/components/admin/QualityDashboard'

export default function QualityPage() {
  const t = useTranslations('admin.quality')

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

      <QualityDashboard />
    </div>
  )
}
