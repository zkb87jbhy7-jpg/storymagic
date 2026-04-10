'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import {
  FamilyStructureSelector,
  type FamilyStructure,
} from './FamilyStructureSelector'
import {
  CulturalPreferencesForm,
  type CulturalPreferencesValues,
} from './CulturalPreferencesForm'

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface PreferencesValues {
  familyStructure: FamilyStructure
  cultural: CulturalPreferencesValues
  modestyConcerns: boolean
}

interface PreferencesFormProps {
  value: PreferencesValues
  onChange: (value: PreferencesValues) => void
  className?: string
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function PreferencesForm({
  value,
  onChange,
  className,
}: PreferencesFormProps) {
  const t = useTranslations('children')

  return (
    <div className={cn('space-y-8', className)}>
      {/* Family structure */}
      <FamilyStructureSelector
        value={value.familyStructure}
        onChange={(fs) => onChange({ ...value, familyStructure: fs })}
      />

      {/* Cultural preferences (dietary + holidays) */}
      <CulturalPreferencesForm
        value={value.cultural}
        onChange={(c) => onChange({ ...value, cultural: c })}
      />

      {/* Modesty toggle */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Modesty Concerns
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ensure illustrations follow modest dress guidelines.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={value.modestyConcerns}
          onClick={() =>
            onChange({ ...value, modestyConcerns: !value.modestyConcerns })
          }
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-900',
            value.modestyConcerns
              ? 'bg-primary-600'
              : 'bg-slate-200 dark:bg-slate-700',
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
              value.modestyConcerns
                ? 'translate-x-6'
                : 'translate-x-1',
            )}
          />
        </button>
      </div>
    </div>
  )
}
