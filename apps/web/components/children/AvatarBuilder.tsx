'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import {
  User,
  Glasses,
  Ear,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Option data                                                        */
/* ------------------------------------------------------------------ */

const SKIN_TONES = [
  { id: 'fair', color: '#FDEBD0' },
  { id: 'light', color: '#F5CBA7' },
  { id: 'medium', color: '#D4A574' },
  { id: 'olive', color: '#C19A6B' },
  { id: 'brown', color: '#8D5524' },
  { id: 'dark', color: '#5C3317' },
] as const

const HAIR_COLORS = [
  { id: 'black', color: '#1C1C1C' },
  { id: 'dark_brown', color: '#4A2912' },
  { id: 'brown', color: '#8B4513' },
  { id: 'auburn', color: '#A0522D' },
  { id: 'red', color: '#C04000' },
  { id: 'blonde', color: '#F0D58C' },
  { id: 'platinum', color: '#E8E0D0' },
  { id: 'gray', color: '#A9A9A9' },
] as const

type HairStyleId = 'short' | 'long' | 'curly' | 'straight' | 'ponytail' | 'braids'

const HAIR_STYLES: { id: HairStyleId; label: string }[] = [
  { id: 'short', label: 'Short' },
  { id: 'long', label: 'Long' },
  { id: 'curly', label: 'Curly' },
  { id: 'straight', label: 'Straight' },
  { id: 'ponytail', label: 'Ponytail' },
  { id: 'braids', label: 'Braids' },
]

const EYE_COLORS = [
  { id: 'brown', color: '#5D3A1A' },
  { id: 'hazel', color: '#8E7618' },
  { id: 'green', color: '#2E8B57' },
  { id: 'blue', color: '#4169E1' },
  { id: 'gray', color: '#778899' },
] as const

/* Hair style icons — simple SVG paths wrapped in small components */
const hairStyleIcons: Record<HairStyleId, React.ReactNode> = {
  short: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="13" r="6" opacity="0.2" />
      <path d="M6 11c0-3.3 2.7-6 6-6s6 2.7 6 6c0 .5-.4 1-.9 1H6.9c-.5 0-.9-.5-.9-1z" />
    </svg>
  ),
  long: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="6" opacity="0.2" />
      <path d="M6 10c0-3.3 2.7-6 6-6s6 2.7 6 6v8c0 .6-.4 1-1 1h-1V12h-8v7h-1c-.6 0-1-.4-1-1v-8z" />
    </svg>
  ),
  curly: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="13" r="6" opacity="0.2" />
      <path d="M7 12c-1-3 1-7 5-8s6 3 6 5c0 1-.5 2-1.5 2S15 10 15 9c0-1-1.5-2-3-1.5S10 10 11 11c1.5 1.5 3 2 2 4s-3 2-4 1-1-2 0-3 2-1 2-1" />
    </svg>
  ),
  straight: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="13" r="6" opacity="0.2" />
      <path d="M7 8c0-2 2-4 5-4s5 2 5 4v10h-2V10H9v8H7V8z" />
    </svg>
  ),
  ponytail: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="6" opacity="0.2" />
      <path d="M6 10c0-3.3 2.7-6 6-6s6 2.7 6 6H6z" />
      <rect x="11" y="10" width="2" height="8" rx="1" />
    </svg>
  ),
  braids: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="6" opacity="0.2" />
      <path d="M6 10c0-3.3 2.7-6 6-6s6 2.7 6 6H6z" />
      <path d="M8 12l1 2-1 2 1 2M16 12l-1 2 1 2-1 2" strokeWidth="1.5" stroke="currentColor" fill="none" />
    </svg>
  ),
}

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface AvatarValues {
  skinTone: string
  hairColor: string
  hairStyle: HairStyleId
  eyeColor: string
  glasses: boolean
  hearingAid: boolean
}

interface AvatarBuilderProps {
  value: AvatarValues
  onChange: (value: AvatarValues) => void
  className?: string
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function AvatarBuilder({ value, onChange, className }: AvatarBuilderProps) {
  const t = useTranslations('children')

  const set = <K extends keyof AvatarValues>(key: K, v: AvatarValues[K]) =>
    onChange({ ...value, [key]: v })

  return (
    <div className={cn('space-y-6', className)}>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
        {t('avatarBuilder')}
      </h3>

      {/* Preview */}
      <div className="flex justify-center">
        <div
          className={cn(
            'relative flex h-32 w-32 items-center justify-center rounded-full border-4',
            'border-slate-200 dark:border-slate-700',
          )}
          style={{ backgroundColor: SKIN_TONES.find((s) => s.id === value.skinTone)?.color ?? '#F5CBA7' }}
          aria-label="Avatar preview"
        >
          <User className="h-16 w-16 text-slate-600/50" aria-hidden="true" />

          {/* Hair swatch on top */}
          <div
            className="absolute -top-1 start-1/2 h-8 w-16 -translate-x-1/2 rounded-t-full"
            style={{ backgroundColor: HAIR_COLORS.find((h) => h.id === value.hairColor)?.color ?? '#4A2912' }}
          />

          {/* Eye dots */}
          <div className="absolute top-12 flex gap-5">
            <span
              className="block h-3 w-3 rounded-full"
              style={{ backgroundColor: EYE_COLORS.find((e) => e.id === value.eyeColor)?.color ?? '#5D3A1A' }}
            />
            <span
              className="block h-3 w-3 rounded-full"
              style={{ backgroundColor: EYE_COLORS.find((e) => e.id === value.eyeColor)?.color ?? '#5D3A1A' }}
            />
          </div>

          {/* Glasses overlay */}
          {value.glasses && (
            <Glasses className="absolute top-10 h-8 w-8 text-slate-700 dark:text-slate-300" aria-hidden="true" />
          )}

          {/* Hearing aid indicator */}
          {value.hearingAid && (
            <Ear className="absolute -end-2 top-10 h-5 w-5 text-primary-500" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Skin tone */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Skin Tone
        </legend>
        <div className="flex flex-wrap gap-3">
          {SKIN_TONES.map((tone) => (
            <button
              key={tone.id}
              type="button"
              onClick={() => set('skinTone', tone.id)}
              aria-label={tone.id}
              className={cn(
                'h-9 w-9 rounded-full border-2 transition-transform hover:scale-110',
                value.skinTone === tone.id
                  ? 'border-primary-500 ring-2 ring-primary-300 dark:ring-primary-700'
                  : 'border-slate-300 dark:border-slate-600',
              )}
              style={{ backgroundColor: tone.color }}
            />
          ))}
        </div>
      </fieldset>

      {/* Hair color */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Hair Color
        </legend>
        <div className="flex flex-wrap gap-3">
          {HAIR_COLORS.map((hc) => (
            <button
              key={hc.id}
              type="button"
              onClick={() => set('hairColor', hc.id)}
              aria-label={hc.id}
              className={cn(
                'h-9 w-9 rounded-full border-2 transition-transform hover:scale-110',
                value.hairColor === hc.id
                  ? 'border-primary-500 ring-2 ring-primary-300 dark:ring-primary-700'
                  : 'border-slate-300 dark:border-slate-600',
              )}
              style={{ backgroundColor: hc.color }}
            />
          ))}
        </div>
      </fieldset>

      {/* Hair style */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Hair Style
        </legend>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {HAIR_STYLES.map((hs) => (
            <button
              key={hs.id}
              type="button"
              onClick={() => set('hairStyle', hs.id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-colors',
                value.hairStyle === hs.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
              )}
            >
              {hairStyleIcons[hs.id]}
              <span className="text-xs font-medium">{hs.label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Eye color */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Eye Color
        </legend>
        <div className="flex flex-wrap gap-3">
          {EYE_COLORS.map((ec) => (
            <button
              key={ec.id}
              type="button"
              onClick={() => set('eyeColor', ec.id)}
              aria-label={ec.id}
              className={cn(
                'h-9 w-9 rounded-full border-2 transition-transform hover:scale-110',
                value.eyeColor === ec.id
                  ? 'border-primary-500 ring-2 ring-primary-300 dark:ring-primary-700'
                  : 'border-slate-300 dark:border-slate-600',
              )}
              style={{ backgroundColor: ec.color }}
            />
          ))}
        </div>
      </fieldset>

      {/* Accessories */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          Accessories
        </legend>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={value.glasses}
              onChange={(e) => set('glasses', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700"
            />
            <Glasses className="h-4 w-4" aria-hidden="true" />
            Glasses
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={value.hearingAid}
              onChange={(e) => set('hearingAid', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700"
            />
            <Ear className="h-4 w-4" aria-hidden="true" />
            Hearing Aid
          </label>
        </div>
      </fieldset>
    </div>
  )
}
