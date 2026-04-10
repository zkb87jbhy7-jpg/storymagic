'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import type { QuizData } from './InteractiveBookReader'

interface QuizQuestionProps {
  quiz: QuizData
}

/**
 * Single question with 3 answer options.
 * Shows correct/encouraging feedback.
 */
export function QuizQuestion({ quiz }: QuizQuestionProps) {
  const t = useTranslations('reader')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)

  const isCorrect = selectedIndex === quiz.correctIndex

  const handleSelect = useCallback((index: number) => {
    if (answered) return
    setSelectedIndex(index)
    setAnswered(true)
  }, [answered])

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {t('quizQuestion')}
      </p>
      <p className="text-base font-medium text-slate-900 dark:text-white">
        {quiz.question}
      </p>

      <div className="flex flex-col gap-2">
        {quiz.options.map((option, idx) => {
          let optionStyle = ''
          if (answered) {
            if (idx === quiz.correctIndex) {
              optionStyle = 'border-success-500 bg-success-500/10 text-success-600 dark:text-success-400'
            } else if (idx === selectedIndex) {
              optionStyle = 'border-warning-500 bg-warning-500/10 text-warning-500'
            }
          }

          return (
            <motion.button
              key={idx}
              type="button"
              onClick={() => handleSelect(idx)}
              whileHover={!answered ? { scale: 1.02 } : undefined}
              whileTap={!answered ? { scale: 0.98 } : undefined}
              disabled={answered}
              className={cn(
                'rounded-xl border-2 px-4 py-3 text-start text-sm font-medium transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                answered
                  ? optionStyle || 'border-slate-200 text-slate-400 dark:border-slate-700'
                  : 'border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-700 dark:hover:bg-primary-900/20'
              )}
            >
              {option}
            </motion.button>
          )
        })}
      </div>

      {/* Feedback */}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mt-2 rounded-lg p-3 text-center text-sm font-medium',
            isCorrect
              ? 'bg-success-500/10 text-success-600 dark:text-success-400'
              : 'bg-warning-500/10 text-warning-500'
          )}
        >
          {isCorrect
            ? t('quizCorrect')
            : t('quizEncourage', { answer: quiz.options[quiz.correctIndex] })}
        </motion.div>
      )}
    </div>
  )
}
