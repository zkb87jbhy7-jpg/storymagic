'use client'

import { useTranslations } from 'next-intl'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FeatureRow {
  featureKey: string
  free: boolean | string
  pro: boolean | string
  premium: boolean | string
}

interface FeatureComparisonProps {
  features: FeatureRow[]
  className?: string
}

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return (
      <span className="text-sm font-medium text-slate-900 dark:text-white">
        {value}
      </span>
    )
  }
  return value ? (
    <Check
      className="mx-auto h-5 w-5 text-green-500 dark:text-green-400"
      aria-label="Included"
    />
  ) : (
    <X
      className="mx-auto h-5 w-5 text-slate-300 dark:text-slate-600"
      aria-label="Not included"
    />
  )
}

const defaultFeatures: FeatureRow[] = [
  { featureKey: 'featureBooksPerMonth', free: '2', pro: '15', premium: 'Unlimited' },
  { featureKey: 'featureAiStoryGeneration', free: true, pro: true, premium: true },
  { featureKey: 'featureCharacterCustomization', free: true, pro: true, premium: true },
  { featureKey: 'featureVoiceNarration', free: false, pro: true, premium: true },
  { featureKey: 'featurePrintOrdering', free: false, pro: true, premium: true },
  { featureKey: 'featureMultipleChildren', free: false, pro: true, premium: true },
  { featureKey: 'featureClassroomEdition', free: false, pro: false, premium: true },
  { featureKey: 'featureMarketplaceAccess', free: false, pro: true, premium: true },
  { featureKey: 'featurePrioritySupport', free: false, pro: false, premium: true },
  { featureKey: 'featureApiAccess', free: false, pro: false, premium: true },
]

export function FeatureComparison({
  features = defaultFeatures,
  className,
}: FeatureComparisonProps) {
  const t = useTranslations('pricing')

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
        className,
      )}
    >
      <table className="w-full min-w-[500px] text-start">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="px-6 py-4 text-start text-sm font-semibold text-slate-900 dark:text-white">
              {t('features')}
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
              {t('planFree')}
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-primary-600 dark:text-primary-400">
              {t('planPro')}
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
              {t('planPremium')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {features.map((row) => (
            <tr
              key={row.featureKey}
              className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-300">
                {t(row.featureKey)}
              </td>
              <td className="px-6 py-3 text-center">
                <CellValue value={row.free} />
              </td>
              <td className="px-6 py-3 text-center">
                <CellValue value={row.pro} />
              </td>
              <td className="px-6 py-3 text-center">
                <CellValue value={row.premium} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
