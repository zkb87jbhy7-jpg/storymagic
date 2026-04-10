'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { ReadingBuddyQuestion } from './ReadingBuddyQuestion'

interface ReadingBuddyProps {
  currentPage: number
  totalPages: number
  childAge: number
  pageText: string
}

type BuddyState = 'idle' | 'greeting' | 'encouraging' | 'questioning'

const QUESTION_INTERVAL = 4 // Ask question every 4 pages

/**
 * Owl with glasses in bottom-end corner (RTL-aware).
 * Animates in/out. Tappable for encouragement. Shows question periodically.
 */
export function ReadingBuddy({
  currentPage,
  totalPages,
  childAge,
  pageText,
}: ReadingBuddyProps) {
  const t = useTranslations('reader')
  const [buddyState, setBuddyState] = useState<BuddyState>('greeting')
  const [showBubble, setShowBubble] = useState(false)
  const [bubbleText, setBubbleText] = useState('')
  const [showQuestion, setShowQuestion] = useState(false)

  const encouragements = useMemo(() => [
    t('buddyEncourage1'),
    t('buddyEncourage2'),
    t('buddyEncourage3'),
    t('buddyEncourage4'),
    t('buddyEncourage5'),
    t('buddyEncourage6'),
    t('buddyEncourage7'),
    t('buddyEncourage8'),
  ], [t])

  // Show greeting on first mount
  useEffect(() => {
    setBubbleText(t('buddyGreeting'))
    setShowBubble(true)
    const timer = setTimeout(() => {
      setShowBubble(false)
      setBuddyState('idle')
    }, 3000)
    return () => clearTimeout(timer)
  }, [t])

  // Periodically show questions
  useEffect(() => {
    if (currentPage > 0 && currentPage % QUESTION_INTERVAL === 0) {
      setBuddyState('questioning')
      setShowQuestion(true)
    }
  }, [currentPage])

  const handleBuddyTap = useCallback(() => {
    if (showQuestion) return

    setBuddyState('encouraging')
    const idx = Math.floor(Math.random() * encouragements.length)
    setBubbleText(encouragements[idx])
    setShowBubble(true)

    setTimeout(() => {
      setShowBubble(false)
      setBuddyState('idle')
    }, 2500)
  }, [encouragements, showQuestion])

  const handleQuestionDismiss = useCallback(() => {
    setShowQuestion(false)
    setBuddyState('idle')
  }, [])

  return (
    <div
      className="fixed bottom-20 end-4 z-40 flex flex-col items-end gap-2"
      aria-label="Reading Buddy"
    >
      {/* Speech bubble */}
      <AnimatePresence>
        {showBubble && !showQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={cn(
              'mb-2 max-w-[200px] rounded-xl rounded-ee-sm p-3',
              'bg-white text-sm text-slate-700 shadow-lg',
              'dark:bg-slate-800 dark:text-slate-300'
            )}
          >
            {bubbleText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question card */}
      <AnimatePresence>
        {showQuestion && (
          <ReadingBuddyQuestion
            childAge={childAge}
            pageText={pageText}
            onDismiss={handleQuestionDismiss}
          />
        )}
      </AnimatePresence>

      {/* Owl character */}
      <motion.button
        type="button"
        onClick={handleBuddyTap}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={
          buddyState === 'idle'
            ? { y: [0, -3, 0] }
            : undefined
        }
        transition={
          buddyState === 'idle'
            ? { repeat: Infinity, duration: 2, ease: 'easeInOut' }
            : undefined
        }
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full',
          'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
        )}
        aria-label="Owlbert the reading buddy"
      >
        {/* Owl face */}
        <div className="relative flex flex-col items-center">
          {/* Eyes with glasses */}
          <div className="flex gap-0.5">
            <div className="flex h-4 w-4 items-center justify-center rounded-full border border-amber-800 bg-white">
              <motion.div
                animate={buddyState === 'encouraging' ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="h-2 w-2 rounded-full bg-amber-900"
              />
            </div>
            <div className="flex h-4 w-4 items-center justify-center rounded-full border border-amber-800 bg-white">
              <motion.div
                animate={buddyState === 'encouraging' ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="h-2 w-2 rounded-full bg-amber-900"
              />
            </div>
          </div>
          {/* Beak */}
          <div className="mt-0.5 h-0 w-0 border-x-[3px] border-t-[5px] border-x-transparent border-t-orange-600" />
        </div>
      </motion.button>
    </div>
  )
}
