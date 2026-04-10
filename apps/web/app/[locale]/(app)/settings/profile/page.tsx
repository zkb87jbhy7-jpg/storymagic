'use client'

import { useTranslations } from 'next-intl'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { Link } from '@/i18n/navigation'
import { ArrowLeft } from 'lucide-react'

export default function ProfileSettingsPage() {
  const t = useTranslations('settings')
  const tProfile = useTranslations('settings.profile')

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label={t('backToSettings')}
        >
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('profileTitle')}
          </h1>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
            {tProfile('subtitle')}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <ProfileForm />
      </div>
    </div>
  )
}
