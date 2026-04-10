'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import * as Switch from '@radix-ui/react-switch'
import { cn } from '@/lib/utils/cn'

type FontSize = 'normal' | 'large' | 'xl'

interface AccessibilityState {
  dyslexiaMode: boolean
  adhdMode: boolean
  autismMode: boolean
  highContrast: boolean
  reducedMotion: boolean
  fontSize: FontSize
}

const FONT_SIZES: { value: FontSize; labelKey: string }[] = [
  { value: 'normal', labelKey: 'fontNormal' },
  { value: 'large', labelKey: 'fontLarge' },
  { value: 'xl', labelKey: 'fontXL' },
]

function ToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-900 dark:text-white"
        >
          {label}
        </label>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      <Switch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-slate-900',
          checked
            ? 'bg-primary-600 dark:bg-primary-500'
            : 'bg-slate-200 dark:bg-slate-700',
        )}
      >
        <Switch.Thumb
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg',
            'transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0.5',
            'mt-0.5',
          )}
        />
      </Switch.Root>
    </div>
  )
}

export function AccessibilitySettings() {
  const t = useTranslations('settings.accessibility')

  const [state, setState] = useState<AccessibilityState>({
    dyslexiaMode: false,
    adhdMode: false,
    autismMode: false,
    highContrast: false,
    reducedMotion: false,
    fontSize: 'normal',
  })

  function toggleField(field: keyof Omit<AccessibilityState, 'fontSize'>) {
    return (checked: boolean) => {
      setState((prev) => ({ ...prev, [field]: checked }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Toggle section */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        <ToggleRow
          id="dyslexia-mode"
          label={t('dyslexiaMode')}
          description={t('dyslexiaModeDesc')}
          checked={state.dyslexiaMode}
          onCheckedChange={toggleField('dyslexiaMode')}
        />
        <ToggleRow
          id="adhd-mode"
          label={t('adhdMode')}
          description={t('adhdModeDesc')}
          checked={state.adhdMode}
          onCheckedChange={toggleField('adhdMode')}
        />
        <ToggleRow
          id="autism-mode"
          label={t('autismMode')}
          description={t('autismModeDesc')}
          checked={state.autismMode}
          onCheckedChange={toggleField('autismMode')}
        />
        <ToggleRow
          id="high-contrast"
          label={t('highContrast')}
          description={t('highContrastDesc')}
          checked={state.highContrast}
          onCheckedChange={toggleField('highContrast')}
        />
        <ToggleRow
          id="reduced-motion"
          label={t('reducedMotion')}
          description={t('reducedMotionDesc')}
          checked={state.reducedMotion}
          onCheckedChange={toggleField('reducedMotion')}
        />
      </div>

      {/* Font size selector */}
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white">
          {t('fontSize')}
        </label>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {t('fontSizeDesc')}
        </p>
        <div className="mt-3 flex gap-3">
          {FONT_SIZES.map((fs) => (
            <button
              key={fs.value}
              type="button"
              onClick={() => setState((prev) => ({ ...prev, fontSize: fs.value }))}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                state.fontSize === fs.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
              )}
            >
              {t(fs.labelKey)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
