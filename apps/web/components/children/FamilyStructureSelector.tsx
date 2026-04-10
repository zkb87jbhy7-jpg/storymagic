'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import {
  Users,
  User,
  Heart,
  Home,
  HandHeart,
  Blend,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type FamilyStructure =
  | 'two_parents'
  | 'single_parent'
  | 'same_sex_parents'
  | 'grandparent_caregivers'
  | 'foster'
  | 'blended'

interface FamilyOption {
  id: FamilyStructure
  label: string
  icon: LucideIcon
}

const options: FamilyOption[] = [
  { id: 'two_parents', label: 'Two Parents', icon: Users },
  { id: 'single_parent', label: 'Single Parent', icon: User },
  { id: 'same_sex_parents', label: 'Same-Sex Parents', icon: Heart },
  { id: 'grandparent_caregivers', label: 'Grandparent Caregivers', icon: Home },
  { id: 'foster', label: 'Foster Family', icon: HandHeart },
  { id: 'blended', label: 'Blended Family', icon: Blend },
]

interface FamilyStructureSelectorProps {
  value: FamilyStructure
  onChange: (value: FamilyStructure) => void
  className?: string
}

export function FamilyStructureSelector({
  value,
  onChange,
  className,
}: FamilyStructureSelectorProps) {
  const t = useTranslations('children')

  return (
    <fieldset className={cn('space-y-3', className)}>
      <legend className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Family Structure
      </legend>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map(({ id, label, icon: Icon }) => {
          const selected = value === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-colors',
                selected
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600',
              )}
              aria-pressed={selected}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
              <span className="text-xs font-medium leading-tight">{label}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
