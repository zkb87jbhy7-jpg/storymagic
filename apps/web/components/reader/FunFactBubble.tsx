'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface FunFactBubbleProps {
  fact: string
  x: number
  y: number
  onDismiss: () => void
}

/**
 * Tooltip-like bubble showing a fun fact.
 * Animated enter/exit. Dismiss on tap outside.
 */
export function FunFactBubble({ fact, x, y, onDismiss }: FunFactBubbleProps) {
  const t = useTranslations('reader')
  const bubbleRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback((e: MouseEvent | TouchEvent) => {
    if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) {
      onDismiss()
    }
  }, [onDismiss])

  useEffect(() => {
    // Delay to avoid immediate dismissal from the same click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [handleClickOutside])

  return (
    <motion.div
      ref={bubbleRef}
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={cn(
        'pointer-events-auto absolute z-20 max-w-[200px] rounded-xl p-3',
        'bg-white shadow-lg ring-1 ring-black/5',
        'dark:bg-slate-800 dark:ring-white/10'
      )}
      style={{
        left: `${Math.min(Math.max(x, 15), 65)}%`,
        top: `${Math.max(y - 5, 5)}%`,
        transform: 'translateX(-50%)',
      }}
      role="tooltip"
    >
      {/* Arrow */}
      <div
        className={cn(
          'absolute -bottom-2 start-1/2 -translate-x-1/2',
          'h-0 w-0 border-x-8 border-t-8 border-x-transparent',
          'border-t-white dark:border-t-slate-800'
        )}
      />

      <p className="mb-1 text-xs font-bold text-accent-500">
        {t('didYouKnow')}
      </p>
      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
        {fact}
      </p>
      <p className="mt-1.5 text-[10px] text-slate-400">
        {t('tapToDismiss')}
      </p>
    </motion.div>
  )
}
