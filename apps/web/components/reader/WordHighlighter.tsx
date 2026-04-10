'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface WordHighlighterProps {
  word: string
  isActive: boolean
  isPast: boolean
}

/**
 * Single word span that transitions from dim to highlighted.
 * Shows a bouncing pointer arrow above the active word.
 */
export function WordHighlighter({ word, isActive, isPast }: WordHighlighterProps) {
  return (
    <span className="relative inline-block">
      {/* Bouncing pointer arrow */}
      {isActive && (
        <motion.span
          initial={{ y: -2, opacity: 0 }}
          animate={{ y: [0, -6, 0], opacity: 1 }}
          transition={{
            y: { repeat: Infinity, duration: 0.6, ease: 'easeInOut' },
            opacity: { duration: 0.15 },
          }}
          className="absolute -top-5 start-1/2 -translate-x-1/2 text-xs text-accent-400"
          aria-hidden="true"
        >
          &#9660;
        </motion.span>
      )}

      <motion.span
        animate={{
          color: isActive ? '#FBBF24' : isPast ? '#E2E8F0' : 'rgba(255,255,255,0.5)',
          scale: isActive ? 1.1 : 1,
        }}
        transition={{ duration: 0.15 }}
        className={cn(
          'inline-block text-lg font-medium transition-colors sm:text-xl',
          isActive && 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
        )}
      >
        {word}
      </motion.span>
    </span>
  )
}
