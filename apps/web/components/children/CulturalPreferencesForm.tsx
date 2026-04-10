'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

/* ------------------------------------------------------------------ */
/* Option data                                                        */
/* ------------------------------------------------------------------ */

export type DietaryRestriction =
  | 'kosher'
  | 'halal'
  | 'vegetarian'
  | 'vegan'
  | 'none'

export type HolidayPreference =
  | 'hanukkah'
  | 'purim'
  | 'rosh_hashana'
  | 'christmas'
  | 'easter'
  | 'eid'
  | 'diwali'
  | 'none'

const dietaryOptions: { id: DietaryRestriction; label: string }[] = [
  { id: 'kosher', label: 'Kosher' },
  { id: 'halal', label: 'Halal' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'none', label: 'None' },
]

const holidayOptions: { id: HolidayPreference; label: string }[] = [
  { id: 'hanukkah', label: 'Hanukkah' },
  { id: 'purim', label: 'Purim' },
  { id: 'rosh_hashana', label: 'Rosh Hashana' },
  { id: 'christmas', label: 'Christmas' },
  { id: 'easter', label: 'Easter' },
  { id: 'eid', label: 'Eid' },
  { id: 'diwali', label: 'Diwali' },
  { id: 'none', label: 'None' },
]

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface CulturalPreferencesValues {
  dietaryRestrictions: DietaryRestriction[]
  holidayPreferences: HolidayPreference[]
}

interface CulturalPreferencesFormProps {
  value: CulturalPreferencesValues
  onChange: (value: CulturalPreferencesValues) => void
  className?: string
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function toggleInArray<T extends string>(arr: T[], item: T): T[] {
  if (item === 'none') {
    return arr.includes('none') ? [] : ['none' as T]
  }
  const without = arr.filter((i) => i !== 'none')
  return without.includes(item)
    ? without.filter((i) => i !== item)
    : [...without, item]
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function CulturalPreferencesForm({
  value,
  onChange,
  className,
}: CulturalPreferencesFormProps) {
  const t = useTranslations('children')

  return (
    <div className={cn('space-y-6', className)}>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
        {t('culturalPrefs')}
      </h3>

      {/* Dietary restrictions */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Dietary Restrictions
        </legend>
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map((opt) => {
            const selected = value.dietaryRestrictions.includes(opt.id)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    dietaryRestrictions: toggleInArray(
                      value.dietaryRestrictions,
                      opt.id,
                    ),
                  })
                }
                className={cn(
                  'rounded-full border px-4 py-1.5 text-xs font-medium transition-colors',
                  selected
                    ? 'border-primary-500 bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
                )}
                aria-pressed={selected}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Holiday preferences */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Holiday Preferences
        </legend>
        <div className="flex flex-wrap gap-2">
          {holidayOptions.map((opt) => {
            const selected = value.holidayPreferences.includes(opt.id)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    holidayPreferences: toggleInArray(
                      value.holidayPreferences,
                      opt.id,
                    ),
                  })
                }
                className={cn(
                  'rounded-full border px-4 py-1.5 text-xs font-medium transition-colors',
                  selected
                    ? 'border-primary-500 bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
                )}
                aria-pressed={selected}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}
