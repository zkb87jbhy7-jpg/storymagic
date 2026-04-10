'use client'

import { useTranslations } from 'next-intl'
import * as Switch from '@radix-ui/react-switch'
import * as Slider from '@radix-ui/react-slider'
import * as Select from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface OptionsPanelProps {
  language: 'he' | 'en'
  pageCount: number
  rhyming: boolean
  bilingual: boolean
  onLanguageChange: (lang: 'he' | 'en') => void
  onPageCountChange: (count: number) => void
  onRhymingChange: (rhyming: boolean) => void
  onBilingualChange: (bilingual: boolean) => void
}

export function OptionsPanel({
  language,
  pageCount,
  rhyming,
  bilingual,
  onLanguageChange,
  onPageCountChange,
  onRhymingChange,
  onBilingualChange,
}: OptionsPanelProps) {
  const t = useTranslations('bookCreation')

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {t('options')}
      </h3>

      {/* Language Select */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('language')}
        </label>
        <Select.Root value={language} onValueChange={(val) => onLanguageChange(val as 'he' | 'en')}>
          <Select.Trigger
            className={cn(
              'inline-flex h-10 items-center justify-between rounded-lg border px-3 text-sm',
              'border-slate-300 bg-white text-slate-900',
              'dark:border-slate-600 dark:bg-slate-800 dark:text-white',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30',
              'dark:focus:border-primary-400 dark:focus:ring-primary-400/30'
            )}
          >
            <Select.Value />
            <Select.Icon>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              className={cn(
                'overflow-hidden rounded-lg border shadow-lg',
                'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
              )}
              position="popper"
              sideOffset={4}
            >
              <Select.Viewport className="p-1">
                <Select.Item
                  value="he"
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none',
                    'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
                  )}
                >
                  <Select.ItemIndicator>
                    <Check className="h-4 w-4 text-primary-500" />
                  </Select.ItemIndicator>
                  <Select.ItemText>Hebrew</Select.ItemText>
                </Select.Item>
                <Select.Item
                  value="en"
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none',
                    'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
                  )}
                >
                  <Select.ItemIndicator>
                    <Check className="h-4 w-4 text-primary-500" />
                  </Select.ItemIndicator>
                  <Select.ItemText>English</Select.ItemText>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* Page Count Slider */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('pageCount')}
          </label>
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
            {pageCount}
          </span>
        </div>
        <Slider.Root
          value={[pageCount]}
          min={8}
          max={24}
          step={2}
          onValueChange={([val]) => onPageCountChange(val)}
          className="relative flex h-5 w-full touch-none select-none items-center"
        >
          <Slider.Track className="relative h-1.5 w-full grow rounded-full bg-slate-200 dark:bg-slate-700">
            <Slider.Range className="absolute h-full rounded-full bg-primary-500 dark:bg-primary-400" />
          </Slider.Track>
          <Slider.Thumb
            className={cn(
              'block h-5 w-5 rounded-full border-2 bg-white shadow-md transition-colors',
              'border-primary-500 dark:border-primary-400 dark:bg-slate-800',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50'
            )}
          />
        </Slider.Root>
        <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>8</span>
          <span>24</span>
        </div>
      </div>

      {/* Rhyming Toggle */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="rhyming-toggle"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {t('rhyming')}
        </label>
        <Switch.Root
          id="rhyming-toggle"
          checked={rhyming}
          onCheckedChange={onRhymingChange}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-900',
            rhyming
              ? 'bg-primary-500 dark:bg-primary-400'
              : 'bg-slate-200 dark:bg-slate-700'
          )}
        >
          <Switch.Thumb
            className={cn(
              'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md transition-transform',
              rhyming ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </Switch.Root>
      </div>

      {/* Bilingual Toggle */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="bilingual-toggle"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Bilingual
        </label>
        <Switch.Root
          id="bilingual-toggle"
          checked={bilingual}
          onCheckedChange={onBilingualChange}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-900',
            bilingual
              ? 'bg-primary-500 dark:bg-primary-400'
              : 'bg-slate-200 dark:bg-slate-700'
          )}
        >
          <Switch.Thumb
            className={cn(
              'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md transition-transform',
              bilingual ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </Switch.Root>
      </div>
    </div>
  )
}
