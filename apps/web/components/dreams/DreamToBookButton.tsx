'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Wand2, BookOpen, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DreamToBookButtonProps {
  dreamId: string
  dreamExcerpt: string
  onConvert: (dreamId: string) => void
  className?: string
}

export function DreamToBookButton({
  dreamId,
  dreamExcerpt,
  onConvert,
  className,
}: DreamToBookButtonProps) {
  const t = useTranslations('dreams')
  const [isHovered, setIsHovered] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  const handleClick = useCallback(() => {
    setIsConverting(true)
    onConvert(dreamId)
    // In production, redirect after API call
    setTimeout(() => setIsConverting(false), 2000)
  }, [dreamId, onConvert])

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      disabled={isConverting}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group relative overflow-hidden rounded-xl px-4 py-3 text-start',
        'border-2 transition-all',
        isConverting
          ? 'border-primary-400 bg-primary-50 dark:border-primary-600 dark:bg-primary-950/30'
          : 'border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 hover:border-indigo-400 hover:shadow-md',
        'dark:border-indigo-800 dark:from-indigo-950/20 dark:to-purple-950/20',
        'dark:hover:border-indigo-600',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            'bg-indigo-100 dark:bg-indigo-900/40'
          )}
        >
          <AnimatePresence mode="wait">
            {isConverting ? (
              <motion.div
                key="converting"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="h-5 w-5 text-indigo-500" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Wand2 className="h-5 w-5 text-indigo-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            {isConverting ? t('convertingDream') : t('dreamToBook')}
          </p>
          {!isConverting && (
            <p className="mt-0.5 truncate text-xs text-indigo-500/80 dark:text-indigo-400/70">
              {t('dreamToBookHint')}
            </p>
          )}
        </div>

        {!isConverting && (
          <BookOpen className="h-5 w-5 shrink-0 text-indigo-400 transition-transform group-hover:translate-x-0.5" />
        )}
      </div>

      {/* Preview strip (Dreamscape style) */}
      {isHovered && !isConverting && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 overflow-hidden rounded-lg border border-indigo-100 bg-white/60 p-2 dark:border-indigo-800 dark:bg-slate-800/60"
        >
          <div className="flex items-center gap-2">
            <div className="h-10 w-8 rounded bg-gradient-to-b from-indigo-300 to-purple-400 dark:from-indigo-600 dark:to-purple-700" />
            <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
              {dreamExcerpt}
            </p>
          </div>
          <p className="mt-1 text-[10px] text-indigo-400">
            {t('dreamscapeStyle')}
          </p>
        </motion.div>
      )}

      {/* Shimmer effect on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={isHovered ? { x: '100%' } : { x: '-100%' }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  )
}
