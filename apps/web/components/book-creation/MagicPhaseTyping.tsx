'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface MagicPhaseTypingProps {
  progress: number
}

const SAMPLE_LINES = [
  'Once upon a time...',
  'In a land far away...',
  'There lived a brave child...',
  'Who dreamed of adventure...',
]

export function MagicPhaseTyping({ progress }: MagicPhaseTypingProps) {
  const t = useTranslations('magicMoment')

  const visibleLines = Math.max(1, Math.ceil((progress / 5) * SAMPLE_LINES.length))

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
        {t('phase1')}
      </h2>

      <div
        className={cn(
          'relative w-full max-w-md rounded-xl border p-6',
          'border-slate-200 bg-white/80 backdrop-blur-sm',
          'dark:border-slate-700 dark:bg-slate-800/80'
        )}
      >
        {/* Text lines appearing */}
        <div className="flex flex-col gap-2">
          {SAMPLE_LINES.slice(0, visibleLines).map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="text-sm text-slate-700 dark:text-slate-300"
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* Quill cursor */}
        <motion.div
          className="absolute"
          animate={{
            x: [0, 200, 0, 150, 0],
            y: [0, 0, 20, 20, 40],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ top: `${40 + visibleLines * 24}px`, insetInlineStart: '24px' }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-primary-500 dark:text-primary-400"
          >
            <path
              d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5l6.74-6.76z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 8L2 22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  )
}
