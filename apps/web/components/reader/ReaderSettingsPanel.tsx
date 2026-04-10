'use client'

import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { ReadingSpeedSlider } from './ReadingSpeedSlider'
import type { AccessibilityMode } from './InteractiveBookReader'

interface ReaderSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  readingSpeed: number
  onReadingSpeedChange: (speed: number) => void
  accessibilityMode: AccessibilityMode
  onAccessibilityModeChange: (mode: AccessibilityMode) => void
  buddyEnabled: boolean
  onBuddyToggle: () => void
  animationsEnabled: boolean
  onAnimationsToggle: () => void
}

export function ReaderSettingsPanel({
  isOpen,
  onClose,
  fontSize,
  onFontSizeChange,
  readingSpeed,
  onReadingSpeedChange,
  accessibilityMode,
  onAccessibilityModeChange,
  buddyEnabled,
  onBuddyToggle,
  animationsEnabled,
  onAnimationsToggle,
}: ReaderSettingsPanelProps) {
  const t = useTranslations('reader')

  const accessibilityModes: { mode: AccessibilityMode; labelKey: string }[] = [
    { mode: 'dyslexia', labelKey: 'dyslexiaMode' },
    { mode: 'adhd', labelKey: 'adhdMode' },
    { mode: 'autism', labelKey: 'autismMode' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed end-0 top-0 z-50 flex h-full w-80 max-w-[85vw] flex-col',
              'overflow-y-auto bg-white shadow-xl dark:bg-slate-900',
              'border-s border-slate-200 dark:border-slate-700'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('settings')}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Close settings"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-6 p-4">
              {/* Font Size */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('fontSize')}
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">A</span>
                  <input
                    type="range"
                    min={12}
                    max={28}
                    value={fontSize}
                    onChange={(e) => onFontSizeChange(Number(e.target.value))}
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-primary-600 dark:bg-slate-700"
                  />
                  <span className="text-lg font-bold text-slate-500">A</span>
                </div>
                <p className="mt-1 text-end text-xs text-slate-400">{fontSize}px</p>
              </div>

              {/* Reading Speed */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('readingSpeed')}
                </label>
                <ReadingSpeedSlider
                  value={readingSpeed}
                  onChange={onReadingSpeedChange}
                />
              </div>

              {/* Accessibility Modes */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('accessibilityModes')}
                </h3>
                <div className="flex flex-col gap-2">
                  {accessibilityModes.map(({ mode, labelKey }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() =>
                        onAccessibilityModeChange(
                          accessibilityMode === mode ? 'none' : mode
                        )
                      }
                      className={cn(
                        'rounded-lg px-3 py-2 text-start text-sm font-medium transition-colors',
                        accessibilityMode === mode
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                      )}
                    >
                      {t(labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-3">
                <ToggleRow
                  label={t('buddyToggle')}
                  checked={buddyEnabled}
                  onChange={onBuddyToggle}
                />
                <ToggleRow
                  label={t('animationToggle')}
                  checked={animationsEnabled}
                  onChange={onAnimationsToggle}
                />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  )
}
