'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import type { MoodType } from '@/hooks/useBookGeneration'

interface MoodCard {
  key: MoodType
  icon: string
  color: string
}

const moods: MoodCard[] = [
  { key: 'happy', icon: '\u2600\uFE0F', color: 'from-yellow-300 to-orange-300 dark:from-yellow-600 dark:to-orange-600' },
  { key: 'exciting', icon: '\uD83D\uDE80', color: 'from-red-300 to-pink-400 dark:from-red-600 dark:to-pink-700' },
  { key: 'sad', icon: '\uD83C\uDF27\uFE0F', color: 'from-blue-300 to-indigo-400 dark:from-blue-600 dark:to-indigo-700' },
  { key: 'scared', icon: '\uD83D\uDC7B', color: 'from-purple-300 to-violet-400 dark:from-purple-600 dark:to-violet-700' },
  { key: 'angry', icon: '\uD83C\uDF0B', color: 'from-orange-400 to-red-500 dark:from-orange-600 dark:to-red-700' },
  { key: 'calm', icon: '\uD83C\uDF19', color: 'from-sky-200 to-blue-300 dark:from-sky-700 dark:to-blue-800' },
]

interface MoodSelectorProps {
  selected: MoodType | null
  onSelect: (mood: MoodType) => void
}

export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  const t = useTranslations('bookCreation')
  const tMoods = useTranslations('bookCreation.moods')

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {t('chooseMood')}
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {moods.map((mood) => (
          <button
            key={mood.key}
            type="button"
            onClick={() => onSelect(mood.key)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-slate-900',
              selected === mood.key
                ? 'border-primary-500 ring-2 ring-primary-500/30 dark:border-primary-400 dark:ring-primary-400/30'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
            )}
          >
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br',
                mood.color
              )}
            >
              <span className="text-2xl" role="img" aria-hidden="true">
                {mood.icon}
              </span>
            </div>
            <span
              className={cn(
                'text-sm font-medium',
                selected === mood.key
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-slate-700 dark:text-slate-200'
              )}
            >
              {tMoods(mood.key)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
