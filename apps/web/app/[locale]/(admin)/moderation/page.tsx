'use client'

import { useTranslations } from 'next-intl'
import { ModerationQueue } from '@/components/admin/ModerationQueue'
import { SystemHealth } from '@/components/admin/SystemHealth'

export default function ModerationPage() {
  const t = useTranslations('admin.moderation')

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('pageTitle')}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {t('pageDescription')}
        </p>
      </div>

      <ModerationQueue />

      <SystemHealth />
    </div>
  )
}
