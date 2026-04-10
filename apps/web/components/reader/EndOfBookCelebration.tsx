'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { QuizQuestion } from './QuizQuestion'
import type { QuizData } from './InteractiveBookReader'

interface EndOfBookCelebrationProps {
  bookId: string
  quiz: QuizData
  onReadAgain: () => void
}

// Confetti particle data
interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  rotation: number
  size: number
}

function generateConfetti(count: number): ConfettiPiece[] {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8ED4', '#6C5CE7', '#FBBF24']
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[i % colors.length],
    delay: Math.random() * 0.8,
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 8,
  }))
}

export function EndOfBookCelebration({ bookId, quiz, onReadAgain }: EndOfBookCelebrationProps) {
  const t = useTranslations('reader')
  const [confetti] = useState(() => generateConfetti(40))
  const [showQuiz, setShowQuiz] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowQuiz(true), 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        'relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden',
        'bg-gradient-to-b from-primary-50 via-white to-primary-50',
        'dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'
      )}
    >
      {/* Confetti */}
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: ['0vh', '110vh'],
            rotate: [0, piece.rotation + 720],
            opacity: [1, 1, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: piece.delay,
            ease: 'easeIn',
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="pointer-events-none absolute top-0"
          style={{
            left: `${piece.x}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
          aria-hidden="true"
        />
      ))}

      {/* Celebration message */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.3 }}
        className="z-10 flex flex-col items-center gap-6 px-4 text-center"
      >
        {/* Star icon */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-6xl"
          aria-hidden="true"
        >
          &#11088;
        </motion.div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          {t('celebration')}
        </h1>

        {/* Quiz section */}
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <h2 className="mb-4 text-xl font-semibold text-slate-700 dark:text-slate-300">
              {t('quiz')}
            </h2>
            <QuizQuestion quiz={quiz} />
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onReadAgain}
            className={cn(
              'rounded-xl px-6 py-3 text-sm font-semibold transition-colors',
              'bg-primary-600 text-white hover:bg-primary-700',
              'dark:bg-primary-500 dark:hover:bg-primary-600'
            )}
          >
            {t('readAgain')}
          </button>
          <a
            href="/"
            className={cn(
              'rounded-xl px-6 py-3 text-sm font-semibold transition-colors',
              'bg-slate-100 text-slate-700 hover:bg-slate-200',
              'dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )}
          >
            {t('backToLibrary')}
          </a>
        </div>
      </motion.div>
    </div>
  )
}
