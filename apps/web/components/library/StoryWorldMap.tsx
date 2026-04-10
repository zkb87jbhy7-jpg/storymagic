'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { MapLocation } from './MapLocation'
import type { BookSpineData } from './BookSpine'

// Map setting keywords to location themes
function getTheme(style: string): 'space' | 'ocean' | 'forest' | 'castle' | 'island' | 'mountain' {
  const map: Record<string, 'space' | 'ocean' | 'forest' | 'castle' | 'island' | 'mountain'> = {
    pixar_3d: 'space',
    watercolor: 'ocean',
    oil_painting: 'forest',
    fantasy: 'castle',
    retro_vintage: 'island',
    comic_book: 'mountain',
    minimalist: 'space',
    manga: 'castle',
    classic_storybook: 'forest',
    whimsical: 'island',
    dreamscape: 'ocean',
  }
  return map[style] ?? 'forest'
}

// Distribute books in a semi-random but deterministic layout
function hashPosition(id: string, index: number): { x: number; y: number } {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  const x = 10 + (Math.abs(hash + index * 137) % 80)
  const y = 10 + (Math.abs(hash * 3 + index * 91) % 75)
  return { x, y }
}

interface StoryWorldMapProps {
  books: BookSpineData[]
  onBookClick?: (bookId: string) => void
  className?: string
}

export function StoryWorldMap({ books, onBookClick, className }: StoryWorldMapProps) {
  const t = useTranslations('library')

  const locations = useMemo(
    () =>
      books.map((book, index) => ({
        book,
        ...hashPosition(book.id, index),
        theme: getTheme(book.style),
      })),
    [books]
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('relative mx-auto max-w-4xl', className)}
    >
      {/* Map background */}
      <div
        className={cn(
          'relative aspect-[4/3] overflow-hidden rounded-2xl border-2',
          'border-amber-300 bg-gradient-to-b from-sky-100 via-green-50 to-amber-100',
          'dark:border-amber-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900',
          'shadow-xl'
        )}
      >
        {/* Map decoration: water areas */}
        <div className="absolute end-0 top-0 h-1/3 w-1/3 rounded-bl-[60%] bg-sky-200/50 dark:bg-sky-900/20" />
        <div className="absolute bottom-0 start-0 h-1/4 w-2/5 rounded-tr-[40%] bg-sky-200/50 dark:bg-sky-900/20" />

        {/* Map decoration: hills */}
        <div className="absolute bottom-1/4 start-1/4 h-20 w-32 rounded-full bg-green-200/40 blur-md dark:bg-green-900/20" />
        <div className="absolute end-1/4 top-1/3 h-16 w-24 rounded-full bg-green-200/40 blur-md dark:bg-green-900/20" />

        {/* Map decoration: path lines */}
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path
            d="M 10% 50% Q 30% 30% 50% 50% T 90% 40%"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            className="text-amber-400/40 dark:text-amber-600/30"
          />
          <path
            d="M 20% 80% Q 40% 60% 60% 70% T 85% 60%"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            className="text-amber-400/40 dark:text-amber-600/30"
          />
        </svg>

        {/* Compass rose */}
        <div className="absolute end-4 top-4 text-amber-600/30 dark:text-amber-400/20">
          <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none">
            <path d="M24 2L28 20H20L24 2Z" fill="currentColor" />
            <path d="M24 46L20 28H28L24 46Z" fill="currentColor" opacity="0.5" />
            <path d="M2 24L20 20V28L2 24Z" fill="currentColor" opacity="0.5" />
            <path d="M46 24L28 28V20L46 24Z" fill="currentColor" />
            <circle cx="24" cy="24" r="3" fill="currentColor" />
          </svg>
        </div>

        {/* Title banner */}
        <div className="absolute start-4 top-4 rounded-lg bg-amber-100/80 px-3 py-1 backdrop-blur-sm dark:bg-amber-900/50">
          <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
            {t('storyWorldMap')}
          </p>
        </div>

        {/* Book locations */}
        {locations.map((loc) => (
          <MapLocation
            key={loc.book.id}
            book={loc.book}
            x={loc.x}
            y={loc.y}
            theme={loc.theme}
            onClick={onBookClick}
          />
        ))}

        {/* Empty state */}
        {books.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-amber-700/50 dark:text-amber-300/40">
              {t('noBooks')}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
