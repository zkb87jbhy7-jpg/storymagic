'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import type { ReadingMode } from './InteractiveBookReader'

interface ReaderModeSelectorProps {
  activeMode: ReadingMode
  onModeChange: (mode: ReadingMode) => void
  isNightMode: boolean
}

interface ModeButton {
  mode: ReadingMode
  labelKey: string
  icon: React.ReactNode
}

function BookIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function SpeakerIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}

const MODES: ModeButton[] = [
  { mode: 'i_read', labelKey: 'iRead', icon: <BookIcon /> },
  { mode: 'read_to_me', labelKey: 'readToMe', icon: <SpeakerIcon /> },
  { mode: 'parent_voice', labelKey: 'parentVoice', icon: <MicIcon /> },
  { mode: 'night_mode', labelKey: 'nightMode', icon: <MoonIcon /> },
]

export function ReaderModeSelector({ activeMode, onModeChange, isNightMode }: ReaderModeSelectorProps) {
  const t = useTranslations('reader')

  return (
    <nav className="flex items-center gap-1" role="tablist" aria-label={t('settings')}>
      {MODES.map(({ mode, labelKey, icon }) => {
        const isActive = mode === activeMode || (mode === 'night_mode' && isNightMode)

        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onModeChange(mode)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5',
              'text-xs font-medium transition-all sm:text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              isActive
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            )}
          >
            {icon}
            <span className="hidden sm:inline">{t(labelKey)}</span>
          </button>
        )
      })}
    </nav>
  )
}
