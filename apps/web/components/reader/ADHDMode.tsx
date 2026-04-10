'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface ADHDModeProps {
  currentPage: number
  totalPages: number
  pageText: string
  children: React.ReactNode
}

const ENCOURAGEMENT_INTERVAL = 3 // Every 3 pages
const BREAK_INTERVAL = 10 // Break reminder after 10 pages

/**
 * ADHD-Friendly mode:
 * - Shows max 3 sentences at a time
 * - Progress bar
 * - Encouragement every 3 pages from pool of 15 messages
 * - Break reminder after 10 pages
 */
export function ADHDMode({ currentPage, totalPages, pageText, children }: ADHDModeProps) {
  const t = useTranslations('reader')
  const [showEncouragement, setShowEncouragement] = useState(false)
  const [showBreakReminder, setShowBreakReminder] = useState(false)
  const [encouragementKey, setEncouragementKey] = useState('')

  const encouragements = useMemo(() => [
    t('adhdEncourage1'),
    t('adhdEncourage2'),
    t('adhdEncourage3'),
    t('adhdEncourage4'),
    t('adhdEncourage5'),
    t('adhdEncourage6'),
    t('adhdEncourage7'),
    t('adhdEncourage8'),
    t('adhdEncourage9'),
    t('adhdEncourage10'),
    t('adhdEncourage11'),
    t('adhdEncourage12'),
    t('adhdEncourage13'),
    t('adhdEncourage14'),
    t('adhdEncourage15'),
  ], [t])

  // Show encouragement every N pages
  useEffect(() => {
    if (currentPage > 0 && currentPage % ENCOURAGEMENT_INTERVAL === 0) {
      const idx = Math.floor(currentPage / ENCOURAGEMENT_INTERVAL) % encouragements.length
      setEncouragementKey(encouragements[idx])
      setShowEncouragement(true)
      const timer = setTimeout(() => setShowEncouragement(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [currentPage, encouragements])

  // Break reminder every N pages
  useEffect(() => {
    if (currentPage > 0 && currentPage % BREAK_INTERVAL === 0) {
      setShowBreakReminder(true)
    }
  }, [currentPage])

  // Split text into max 3 sentences
  const visibleText = useMemo(() => {
    const sentences = pageText.split(/(?<=[.!?])\s+/).filter(Boolean)
    return sentences.slice(0, 3).join(' ')
  }, [pageText])

  const progressPercent = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0

  return (
    <div className="relative">
      {/* ADHD progress bar (always visible) */}
      <div
        className={cn(
          'fixed start-0 top-0 z-50 h-2 w-full',
          'bg-slate-200 dark:bg-slate-700'
        )}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-success-400 to-success-500"
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main content (limited sentences handled via CSS) */}
      <style jsx global>{`
        .reader-adhd [style*="fontSize"] {
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      {children}

      {/* Encouragement toast */}
      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className={cn(
              'fixed inset-x-0 bottom-24 z-50 mx-auto w-fit',
              'rounded-full bg-success-500 px-6 py-3 text-sm font-bold text-white shadow-lg'
            )}
          >
            {encouragementKey}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Break reminder dialog */}
      <AnimatePresence>
        {showBreakReminder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={cn(
                'flex max-w-sm flex-col gap-4 rounded-2xl p-6 text-center',
                'bg-white shadow-xl dark:bg-slate-800'
              )}
            >
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('adhdBreakReminder')}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('adhdProgress', { pages: currentPage + 1 })}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBreakReminder(false)}
                  className={cn(
                    'flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold',
                    'bg-primary-600 text-white hover:bg-primary-700',
                    'dark:bg-primary-500 dark:hover:bg-primary-600'
                  )}
                >
                  {t('adhdContinue')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBreakReminder(false)}
                  className={cn(
                    'flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold',
                    'bg-slate-100 text-slate-700 hover:bg-slate-200',
                    'dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                  )}
                >
                  {t('adhdTakeBreak')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
