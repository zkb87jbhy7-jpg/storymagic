'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface ReadingBuddyQuestionProps {
  childAge: number
  pageText: string
  onDismiss: () => void
}

type AgeGroup = '2-4' | '5-7' | '8-10'

function getAgeGroup(age: number): AgeGroup {
  if (age <= 4) return '2-4'
  if (age <= 7) return '5-7'
  return '8-10'
}

/**
 * Question card from the owl.
 * Age-appropriate questions:
 * - Ages 2-4: Pointing questions ("Can you find the red ball?")
 * - Ages 5-7: Prediction questions ("What do you think happens next?")
 * - Ages 8-10: Analytical questions ("Why did the character choose...?")
 */
export function ReadingBuddyQuestion({
  childAge,
  pageText,
  onDismiss,
}: ReadingBuddyQuestionProps) {
  const t = useTranslations('reader')
  const [answered, setAnswered] = useState(false)

  const ageGroup = getAgeGroup(childAge)

  const question = useMemo(() => {
    // Extract key words from page text for context
    const words = pageText.split(/\s+/).filter((w) => w.length > 3)
    const contextWord = words[Math.floor(Math.random() * words.length)] ?? 'something'

    switch (ageGroup) {
      case '2-4':
        return t('buddyPointFind', { object: contextWord })
      case '5-7':
        return t('buddyPredict')
      case '8-10':
        return t('buddyAnalyze', {
          character: 'the character',
          action: 'do that',
        })
      default:
        return t('buddyPredict')
    }
  }, [ageGroup, pageText, t])

  const feedbackMessages = useMemo(() => [
    t('buddyAnswerGreat'),
    t('buddyAnswerNice'),
    t('buddyAnswerWow'),
  ], [t])

  const handleAnswer = useCallback(() => {
    setAnswered(true)
    setTimeout(onDismiss, 2000)
  }, [onDismiss])

  const feedback = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={cn(
        'mb-2 w-64 rounded-xl p-4 shadow-xl',
        'bg-white dark:bg-slate-800',
        'border border-amber-200 dark:border-amber-800'
      )}
    >
      {/* Owl icon */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">&#129417;</span>
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
          Owlbert
        </span>
      </div>

      {/* Question */}
      <p className="mb-3 text-sm font-medium text-slate-800 dark:text-slate-200">
        {question}
      </p>

      {answered ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg bg-success-500/10 p-2 text-center text-sm font-medium text-success-600 dark:text-success-400"
        >
          {feedback}
        </motion.div>
      ) : (
        <div className="flex gap-2">
          {ageGroup === '2-4' ? (
            // For youngest: single "I found it!" button
            <button
              type="button"
              onClick={handleAnswer}
              className={cn(
                'flex-1 rounded-lg px-3 py-2 text-xs font-semibold',
                'bg-amber-500 text-white hover:bg-amber-600'
              )}
            >
              I found it!
            </button>
          ) : (
            // For older kids: response buttons
            <>
              <button
                type="button"
                onClick={handleAnswer}
                className={cn(
                  'flex-1 rounded-lg px-3 py-2 text-xs font-semibold',
                  'bg-primary-600 text-white hover:bg-primary-700',
                  'dark:bg-primary-500 dark:hover:bg-primary-600'
                )}
              >
                {ageGroup === '5-7' ? 'I think...' : 'Because...'}
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className={cn(
                  'rounded-lg px-3 py-2 text-xs font-medium',
                  'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  'dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
                )}
              >
                Skip
              </button>
            </>
          )}
        </div>
      )}
    </motion.div>
  )
}
