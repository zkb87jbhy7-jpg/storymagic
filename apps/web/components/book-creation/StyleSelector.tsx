'use client'

import { useTranslations } from 'next-intl'
import { StylePreviewCard } from './StylePreviewCard'
import type { IllustrationStyle } from '@/hooks/useBookGeneration'

interface StyleInfo {
  key: IllustrationStyle
  swatch: string
  description: string
}

const illustrationStyles: StyleInfo[] = [
  { key: 'watercolor', swatch: 'bg-gradient-to-br from-blue-200 to-cyan-300 dark:from-blue-700 dark:to-cyan-800', description: 'Soft washes & gentle textures' },
  { key: 'comic_book', swatch: 'bg-gradient-to-br from-yellow-300 to-red-400 dark:from-yellow-600 dark:to-red-700', description: 'Bold lines & vibrant panels' },
  { key: 'pixar_3d', swatch: 'bg-gradient-to-br from-sky-300 to-indigo-400 dark:from-sky-600 dark:to-indigo-700', description: 'Smooth 3D rendered characters' },
  { key: 'retro_vintage', swatch: 'bg-gradient-to-br from-amber-200 to-orange-300 dark:from-amber-700 dark:to-orange-800', description: 'Warm nostalgic tones' },
  { key: 'minimalist', swatch: 'bg-gradient-to-br from-gray-100 to-slate-200 dark:from-gray-600 dark:to-slate-700', description: 'Clean shapes & white space' },
  { key: 'oil_painting', swatch: 'bg-gradient-to-br from-emerald-300 to-teal-400 dark:from-emerald-700 dark:to-teal-800', description: 'Rich textured brushstrokes' },
  { key: 'fantasy', swatch: 'bg-gradient-to-br from-purple-300 to-violet-400 dark:from-purple-700 dark:to-violet-800', description: 'Magical & ethereal scenes' },
  { key: 'manga', swatch: 'bg-gradient-to-br from-pink-200 to-rose-300 dark:from-pink-700 dark:to-rose-800', description: 'Expressive anime-inspired art' },
  { key: 'classic_storybook', swatch: 'bg-gradient-to-br from-orange-200 to-amber-300 dark:from-orange-700 dark:to-amber-800', description: 'Timeless hand-drawn charm' },
  { key: 'whimsical', swatch: 'bg-gradient-to-br from-teal-200 to-green-300 dark:from-teal-700 dark:to-green-800', description: 'Playful & imaginative' },
]

interface StyleSelectorProps {
  selected: IllustrationStyle | null
  onSelect: (style: IllustrationStyle) => void
}

export function StyleSelector({ selected, onSelect }: StyleSelectorProps) {
  const t = useTranslations('bookCreation')

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {t('chooseStyle')}
      </h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {illustrationStyles.map((style) => (
          <StylePreviewCard
            key={style.key}
            styleKey={style.key}
            selected={selected === style.key}
            onSelect={() => onSelect(style.key)}
            swatch={style.swatch}
            description={style.description}
          />
        ))}
      </div>
    </div>
  )
}
