'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

export type IllustrationStyleColor = {
  bg: string
  text: string
  accent: string
}

const STYLE_COLORS: Record<string, IllustrationStyleColor> = {
  watercolor: { bg: 'bg-sky-400', text: 'text-white', accent: 'bg-sky-300' },
  comic_book: { bg: 'bg-red-500', text: 'text-yellow-100', accent: 'bg-yellow-400' },
  pixar_3d: { bg: 'bg-blue-500', text: 'text-white', accent: 'bg-blue-300' },
  retro_vintage: { bg: 'bg-amber-600', text: 'text-amber-50', accent: 'bg-amber-400' },
  minimalist: { bg: 'bg-slate-700', text: 'text-white', accent: 'bg-slate-500' },
  oil_painting: { bg: 'bg-emerald-700', text: 'text-emerald-50', accent: 'bg-emerald-400' },
  fantasy: { bg: 'bg-purple-600', text: 'text-purple-50', accent: 'bg-purple-400' },
  manga: { bg: 'bg-pink-500', text: 'text-white', accent: 'bg-pink-300' },
  classic_storybook: { bg: 'bg-amber-800', text: 'text-amber-50', accent: 'bg-amber-500' },
  whimsical: { bg: 'bg-fuchsia-500', text: 'text-white', accent: 'bg-fuchsia-300' },
  dreamscape: { bg: 'bg-indigo-600', text: 'text-indigo-50', accent: 'bg-indigo-300' },
}

export interface BookSpineData {
  id: string
  title: string
  childName: string
  style: string
  isLiving?: boolean
  createdAt: string
}

interface BookSpineProps {
  book: BookSpineData
  onClick?: (bookId: string) => void
  className?: string
}

export function BookSpine({ book, onClick, className }: BookSpineProps) {
  const t = useTranslations('library')
  const [isHovered, setIsHovered] = useState(false)

  const colors = STYLE_COLORS[book.style] ?? STYLE_COLORS.classic_storybook

  return (
    <motion.button
      type="button"
      onClick={() => onClick?.(book.id)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'group relative flex flex-col items-center',
        'focus:outline-none focus:ring-2 focus:ring-primary-400',
        className
      )}
      style={{ perspective: '400px' }}
      aria-label={t('openBook', { title: book.title })}
    >
      {/* 3D spine */}
      <motion.div
        animate={{
          rotateY: isHovered ? -15 : 0,
          translateZ: isHovered ? 20 : 0,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className={cn(
          'relative flex h-44 w-10 flex-col items-center justify-between overflow-hidden rounded-sm shadow-md sm:h-52 sm:w-12',
          colors.bg
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Top accent stripe */}
        <div className={cn('h-1.5 w-full', colors.accent)} />

        {/* Title (vertical text) */}
        <div className="flex flex-1 items-center px-1">
          <p
            className={cn(
              'line-clamp-3 text-center text-[9px] font-bold leading-tight',
              colors.text
            )}
            style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
          >
            {book.title}
          </p>
        </div>

        {/* Bottom accent stripe */}
        <div className={cn('h-1.5 w-full', colors.accent)} />

        {/* Living book glow */}
        {book.isLiving && (
          <motion.div
            className="absolute inset-0 bg-accent-400/20"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Hover shadow effect */}
        <motion.div
          className="absolute inset-0 bg-black/0"
          animate={{ backgroundColor: isHovered ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0)' }}
        />
      </motion.div>

      {/* Title tooltip on hover */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 5 }}
        className="absolute -bottom-8 start-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-lg dark:bg-slate-600"
      >
        {book.title}
      </motion.div>
    </motion.button>
  )
}
