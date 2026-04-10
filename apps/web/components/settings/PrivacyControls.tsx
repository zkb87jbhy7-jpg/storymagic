'use client'

import { useTranslations } from 'next-intl'
import { ShieldCheck, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { DataExportButton } from './DataExportButton'
import { DeleteAccountButton } from './DeleteAccountButton'

export function PrivacyControls() {
  const t = useTranslations('settings.privacy')

  return (
    <div className="space-y-8">
      {/* Data Retention Info */}
      <section>
        <div className="flex items-center gap-2">
          <ShieldCheck
            className="h-5 w-5 text-primary-600 dark:text-primary-400"
            aria-hidden="true"
          />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {t('dataRetentionTitle')}
          </h3>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t('dataRetentionInfo')}
        </p>
      </section>

      {/* COPPA Compliance Info */}
      <section
        className={cn(
          'flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4',
          'dark:border-blue-900/50 dark:bg-blue-900/20',
        )}
      >
        <Info
          className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
          aria-hidden="true"
        />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <p className="font-medium">{t('coppaTitle')}</p>
          <p className="mt-1">{t('coppaInfo')}</p>
        </div>
      </section>

      {/* Data Export */}
      <section>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          {t('exportDataTitle')}
        </h3>
        <p className="mt-1 mb-3 text-sm text-slate-600 dark:text-slate-400">
          {t('exportDataDescription')}
        </p>
        <DataExportButton />
      </section>

      {/* Delete Account */}
      <section>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          {t('dangerZone')}
        </h3>
        <p className="mt-1 mb-3 text-sm text-slate-600 dark:text-slate-400">
          {t('dangerZoneDescription')}
        </p>
        <DeleteAccountButton />
      </section>
    </div>
  )
}
