'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Search, Globe } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { VoicePreviewPlayer } from './VoicePreviewPlayer'

export interface PresetVoice {
  id: string
  name: string
  description: string
  language: string
  gender: 'male' | 'female' | 'neutral'
  ageRange: 'child' | 'young' | 'adult' | 'elder'
  previewUrl: string
  tags: string[]
}

const PRESET_VOICES: PresetVoice[] = [
  { id: 'en-narrator-warm', name: 'Warm Narrator', description: 'Soothing bedtime storyteller', language: 'en', gender: 'female', ageRange: 'adult', previewUrl: '/audio/voices/warm-narrator.mp3', tags: ['bedtime', 'calm'] },
  { id: 'en-narrator-bright', name: 'Bright Narrator', description: 'Cheerful and energetic', language: 'en', gender: 'female', ageRange: 'young', previewUrl: '/audio/voices/bright-narrator.mp3', tags: ['adventure', 'fun'] },
  { id: 'en-narrator-deep', name: 'Deep Storyteller', description: 'Rich baritone narration', language: 'en', gender: 'male', ageRange: 'adult', previewUrl: '/audio/voices/deep-storyteller.mp3', tags: ['epic', 'fantasy'] },
  { id: 'en-narrator-gentle', name: 'Gentle Giant', description: 'Soft and reassuring', language: 'en', gender: 'male', ageRange: 'adult', previewUrl: '/audio/voices/gentle-giant.mp3', tags: ['calm', 'bedtime'] },
  { id: 'en-narrator-fairy', name: 'Fairy Godmother', description: 'Magical and whimsical', language: 'en', gender: 'female', ageRange: 'elder', previewUrl: '/audio/voices/fairy-godmother.mp3', tags: ['fantasy', 'magical'] },
  { id: 'en-narrator-pirate', name: 'Captain Salty', description: 'Adventurous pirate voice', language: 'en', gender: 'male', ageRange: 'adult', previewUrl: '/audio/voices/captain-salty.mp3', tags: ['adventure', 'fun'] },
  { id: 'en-narrator-robot', name: 'Bleep Bloop', description: 'Friendly robot voice', language: 'en', gender: 'neutral', ageRange: 'child', previewUrl: '/audio/voices/bleep-bloop.mp3', tags: ['sci-fi', 'fun'] },
  { id: 'en-narrator-grandpa', name: 'Grandpa Joe', description: 'Wise and comforting', language: 'en', gender: 'male', ageRange: 'elder', previewUrl: '/audio/voices/grandpa-joe.mp3', tags: ['bedtime', 'wisdom'] },
  { id: 'en-narrator-child', name: 'Little Star', description: 'Young and enthusiastic', language: 'en', gender: 'neutral', ageRange: 'child', previewUrl: '/audio/voices/little-star.mp3', tags: ['fun', 'playful'] },
  { id: 'en-narrator-dramatic', name: 'Dramatic Dan', description: 'Theatrical and expressive', language: 'en', gender: 'male', ageRange: 'adult', previewUrl: '/audio/voices/dramatic-dan.mp3', tags: ['epic', 'adventure'] },
  { id: 'he-narrator-warm', name: 'Shira', description: 'Warm Hebrew storyteller', language: 'he', gender: 'female', ageRange: 'adult', previewUrl: '/audio/voices/shira.mp3', tags: ['bedtime', 'calm'] },
  { id: 'he-narrator-bright', name: 'Yael', description: 'Bright and cheerful', language: 'he', gender: 'female', ageRange: 'young', previewUrl: '/audio/voices/yael.mp3', tags: ['fun', 'adventure'] },
  { id: 'he-narrator-deep', name: 'Amir', description: 'Deep and engaging', language: 'he', gender: 'male', ageRange: 'adult', previewUrl: '/audio/voices/amir.mp3', tags: ['epic', 'fantasy'] },
  { id: 'he-narrator-gentle', name: 'Noam', description: 'Gentle storyteller', language: 'he', gender: 'male', ageRange: 'adult', previewUrl: '/audio/voices/noam.mp3', tags: ['calm', 'bedtime'] },
  { id: 'he-narrator-fairy', name: 'Savta Miriam', description: 'Magical grandmother', language: 'he', gender: 'female', ageRange: 'elder', previewUrl: '/audio/voices/savta-miriam.mp3', tags: ['fantasy', 'magical'] },
  { id: 'he-narrator-child', name: 'Ori', description: 'Youthful and playful', language: 'he', gender: 'neutral', ageRange: 'child', previewUrl: '/audio/voices/ori.mp3', tags: ['fun', 'playful'] },
  { id: 'en-narrator-lullaby', name: 'Luna Lullaby', description: 'Soft dreamy whisper', language: 'en', gender: 'female', ageRange: 'adult', previewUrl: '/audio/voices/luna-lullaby.mp3', tags: ['bedtime', 'dream'] },
  { id: 'en-narrator-explorer', name: 'Explorer Max', description: 'Curious and adventurous', language: 'en', gender: 'male', ageRange: 'young', previewUrl: '/audio/voices/explorer-max.mp3', tags: ['adventure', 'nature'] },
  { id: 'en-narrator-teacher', name: 'Teacher Rose', description: 'Patient and educational', language: 'en', gender: 'female', ageRange: 'adult', previewUrl: '/audio/voices/teacher-rose.mp3', tags: ['educational', 'calm'] },
  { id: 'en-narrator-silly', name: 'Silly Sam', description: 'Goofy and laugh-inducing', language: 'en', gender: 'male', ageRange: 'young', previewUrl: '/audio/voices/silly-sam.mp3', tags: ['fun', 'playful'] },
  { id: 'he-narrator-dramatic', name: 'Dror', description: 'Dramatic expression', language: 'he', gender: 'male', ageRange: 'adult', previewUrl: '/audio/voices/dror.mp3', tags: ['epic', 'dramatic'] },
  { id: 'he-narrator-lullaby', name: 'Liora', description: 'Dreamy lullaby voice', language: 'he', gender: 'female', ageRange: 'young', previewUrl: '/audio/voices/liora.mp3', tags: ['bedtime', 'dream'] },
]

const LANGUAGES = ['all', 'en', 'he'] as const

interface VoiceSelectorProps {
  selectedVoiceId: string | null
  onSelect: (voice: PresetVoice) => void
  className?: string
}

export function VoiceSelector({ selectedVoiceId, onSelect, className }: VoiceSelectorProps) {
  const t = useTranslations('voice')
  const [searchQuery, setSearchQuery] = useState('')
  const [languageFilter, setLanguageFilter] = useState<(typeof LANGUAGES)[number]>('all')

  const filteredVoices = useMemo(() => {
    return PRESET_VOICES.filter((voice) => {
      const matchesLanguage = languageFilter === 'all' || voice.language === languageFilter
      const matchesSearch =
        !searchQuery ||
        voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voice.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesLanguage && matchesSearch
    })
  }, [searchQuery, languageFilter])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchVoices')}
            className={cn(
              'w-full rounded-lg border border-slate-200 bg-white py-2 ps-9 pe-3',
              'text-sm text-slate-900 placeholder:text-slate-400',
              'focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200',
              'dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500',
              'dark:focus:border-primary-500 dark:focus:ring-primary-800'
            )}
          />
        </div>

        {/* Language filter */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-700">
          <Globe className="ms-1 h-4 w-4 text-slate-400" />
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguageFilter(lang)}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                languageFilter === lang
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              {t(`lang_${lang}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Voice grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filteredVoices.map((voice) => {
            const isSelected = selectedVoiceId === voice.id

            return (
              <motion.button
                key={voice.id}
                type="button"
                onClick={() => onSelect(voice)}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'relative flex flex-col gap-2 rounded-xl border-2 p-4 text-start transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
                  'dark:focus:ring-offset-slate-900',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 shadow-md dark:border-primary-400 dark:bg-primary-950/30'
                    : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-600'
                )}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white"
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                )}

                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg',
                      voice.gender === 'female'
                        ? 'bg-pink-100 dark:bg-pink-900/30'
                        : voice.gender === 'male'
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'bg-purple-100 dark:bg-purple-900/30'
                    )}
                    aria-hidden="true"
                  >
                    {voice.ageRange === 'child'
                      ? '\u2B50'
                      : voice.ageRange === 'elder'
                        ? '\u{1F451}'
                        : '\u{1F3A4}'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-slate-900 dark:text-white">
                      {voice.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {voice.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {voice.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {voice.language.toUpperCase()}
                  </span>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <VoicePreviewPlayer src={voice.previewUrl} compact label={voice.name} />
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredVoices.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">{t('noVoicesFound')}</p>
        </div>
      )}
    </div>
  )
}
