'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Palmtree, TreePine, Castle, Rocket, Waves } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { BookSpineData } from './BookSpine'

type LocationTheme = 'space' | 'ocean' | 'forest' | 'castle' | 'island' | 'mountain'

interface MapLocationProps {
  book: BookSpineData
  /** Position as percentage (0-100) */
  x: number
  y: number
  /** Location theme determines the pin icon */
  theme: LocationTheme
  onClick?: (bookId: string) => void
  className?: string
}

const themeConfig: Record<
  LocationTheme,
  {
    icon: React.ComponentType<{ className?: string }>
    bgClass: string
    pinColor: string
  }
> = {
  space: {
    icon: Star,
    bgClass: 'bg-indigo-100 dark:bg-indigo-900/40',
    pinColor: 'text-indigo-500',
  },
  ocean: {
    icon: Waves,
    bgClass: 'bg-cyan-100 dark:bg-cyan-900/40',
    pinColor: 'text-cyan-500',
  },
  forest: {
    icon: TreePine,
    bgClass: 'bg-green-100 dark:bg-green-900/40',
    pinColor: 'text-green-600',
  },
  castle: {
    icon: Castle,
    bgClass: 'bg-purple-100 dark:bg-purple-900/40',
    pinColor: 'text-purple-500',
  },
  island: {
    icon: Palmtree,
    bgClass: 'bg-amber-100 dark:bg-amber-900/40',
    pinColor: 'text-amber-600',
  },
  mountain: {
    icon: Rocket,
    bgClass: 'bg-rose-100 dark:bg-rose-900/40',
    pinColor: 'text-rose-500',
  },
}

export function MapLocation({ book, x, y, theme, onClick, className }: MapLocationProps) {
  const [isHovered, setIsHovered] = useState(false)
  const config = themeConfig[theme]
  const Icon = config.icon

  return (
    <motion.button
      type="button"
      onClick={() => onClick?.(book.id)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn('absolute z-10', 'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2', className)}
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -100%)' }}
      aria-label={book.title}
    >
      {/* Pin body */}
      <motion.div
        animate={{
          y: isHovered ? -4 : 0,
          scale: isHovered ? 1.15 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="flex flex-col items-center"
      >
        {/* Icon circle */}
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-lg sm:h-12 sm:w-12',
            config.bgClass
          )}
        >
          <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', config.pinColor)} />
        </div>

        {/* Pin point */}
        <div
          className={cn(
            'h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent',
            theme === 'space'
              ? 'border-t-indigo-100 dark:border-t-indigo-900/40'
              : theme === 'ocean'
                ? 'border-t-cyan-100 dark:border-t-cyan-900/40'
                : theme === 'forest'
                  ? 'border-t-green-100 dark:border-t-green-900/40'
                  : theme === 'castle'
                    ? 'border-t-purple-100 dark:border-t-purple-900/40'
                    : theme === 'island'
                      ? 'border-t-amber-100 dark:border-t-amber-900/40'
                      : 'border-t-rose-100 dark:border-t-rose-900/40'
          )}
        />

        {/* Shadow dot */}
        <motion.div
          className="mt-1 h-1.5 w-4 rounded-full bg-black/10 blur-[1px] dark:bg-black/30"
          animate={{ scale: isHovered ? 0.8 : 1, opacity: isHovered ? 0.5 : 1 }}
        />
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            className="absolute bottom-full start-1/2 z-20 mb-2 -translate-x-1/2"
          >
            <div className="whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-xl dark:bg-slate-600">
              <p>{book.title}</p>
              <p className="text-slate-300 dark:text-slate-400">{book.childName}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Living book pulse */}
      {book.isLiving && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-full bg-accent-400/30"
          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      )}
    </motion.button>
  )
}
