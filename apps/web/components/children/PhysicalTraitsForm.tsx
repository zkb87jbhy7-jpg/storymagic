'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { Accessibility, Glasses, Ear } from 'lucide-react'

export interface PhysicalTraitsValues {
  wheelchair: boolean
  glasses: boolean
  hearingAid: boolean
  customNotes: string
}

interface PhysicalTraitsFormProps {
  value: PhysicalTraitsValues
  onChange: (value: PhysicalTraitsValues) => void
  className?: string
}

const traits = [
  { key: 'wheelchair' as const, icon: Accessibility, label: 'Wheelchair' },
  { key: 'glasses' as const, icon: Glasses, label: 'Glasses' },
  { key: 'hearingAid' as const, icon: Ear, label: 'Hearing Aid' },
] as const

export function PhysicalTraitsForm({
  value,
  onChange,
  className,
}: PhysicalTraitsFormProps) {
  const t = useTranslations('children')

  const toggle = (key: 'wheelchair' | 'glasses' | 'hearingAid') =>
    onChange({ ...value, [key]: !value[key] })

  return (
    <fieldset className={cn('space-y-4', className)}>
      <legend className="text-base font-semibold text-slate-900 dark:text-white">
        {t('physicalTraits')}
      </legend>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        These traits help us represent your child naturally in illustrations.
      </p>

      <div className="flex flex-wrap gap-4">
        {traits.map(({ key, icon: Icon, label }) => (
          <label
            key={key}
            className={cn(
              'inline-flex cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
              value[key]
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
            )}
          >
            <input
              type="checkbox"
              checked={value[key]}
              onChange={() => toggle(key)}
              className="sr-only"
            />
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </label>
        ))}
      </div>

      <div>
        <label
          htmlFor="custom-notes"
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Additional Notes
        </label>
        <textarea
          id="custom-notes"
          rows={3}
          value={value.customNotes}
          onChange={(e) => onChange({ ...value, customNotes: e.target.value })}
          placeholder="Any other details we should know..."
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm transition-colors',
            'border-slate-300 bg-white placeholder:text-slate-400',
            'dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500',
            'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            'dark:focus:border-primary-400 dark:focus:ring-primary-400/20',
          )}
        />
      </div>
    </fieldset>
  )
}
