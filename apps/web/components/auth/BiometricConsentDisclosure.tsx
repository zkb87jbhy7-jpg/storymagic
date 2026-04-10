'use client'

import { useTranslations } from 'next-intl'
import { ShieldCheck, Database, Clock, Trash2, Eye } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * COPPA 2025 compliant biometric data disclosure component.
 *
 * This component renders the legally required disclosure text informing parents
 * about the collection, purpose, storage, retention, and deletion of biometric
 * identifiers (face templates / faceprints) used in character illustration.
 */
export default function BiometricConsentDisclosure() {
  const t = useTranslations('biometric')

  const sections = [
    {
      icon: Eye,
      titleKey: 'collectionTitle' as const,
      bodyKey: 'collectionBody' as const,
    },
    {
      icon: ShieldCheck,
      titleKey: 'purposeTitle' as const,
      bodyKey: 'purposeBody' as const,
    },
    {
      icon: Database,
      titleKey: 'storageTitle' as const,
      bodyKey: 'storageBody' as const,
    },
    {
      icon: Clock,
      titleKey: 'retentionTitle' as const,
      bodyKey: 'retentionBody' as const,
    },
    {
      icon: Trash2,
      titleKey: 'deletionTitle' as const,
      bodyKey: 'deletionBody' as const,
    },
  ] as const

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-amber-300/50 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-950/30">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          {t('legalNotice')}
        </p>
      </div>

      <ul className="flex flex-col gap-3" role="list">
        {sections.map(({ icon: Icon, titleKey, bodyKey }) => (
          <li key={titleKey} className="flex gap-3">
            <span
              className={cn(
                'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                'bg-primary-100 text-primary-700',
                'dark:bg-primary-900/40 dark:text-primary-400'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t(titleKey)}
              </h4>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {t(bodyKey)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
