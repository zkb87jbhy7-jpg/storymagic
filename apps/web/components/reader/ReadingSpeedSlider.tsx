'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

interface ReadingSpeedSliderProps {
  value: number
  onChange: (speed: number) => void
}

const SPEED_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]

export function ReadingSpeedSlider({ value, onChange }: ReadingSpeedSliderProps) {
  const t = useTranslations('reader')

  const currentIndex = SPEED_STEPS.findIndex((s) => s === value)
  const sliderIndex = currentIndex >= 0 ? currentIndex : 2 // Default to 1.0x

  return (
    <div className="flex flex-col gap-2">
      <input
        type="range"
        min={0}
        max={SPEED_STEPS.length - 1}
        step={1}
        value={sliderIndex}
        onChange={(e) => {
          const idx = Number(e.target.value)
          onChange(SPEED_STEPS[idx])
        }}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-primary-600 dark:bg-slate-700"
        aria-label={t('readingSpeed')}
      />
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{t('slow')}</span>
        <span
          className={cn(
            'rounded-md px-2 py-0.5 font-semibold',
            'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
          )}
        >
          {t('speedLabel', { speed: value.toFixed(1) })}
        </span>
        <span>{t('fast')}</span>
      </div>
    </div>
  )
}
