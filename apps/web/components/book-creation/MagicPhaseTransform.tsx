'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface MagicPhaseTransformProps {
  progress: number
}

export function MagicPhaseTransform({ progress }: MagicPhaseTransformProps) {
  const t = useTranslations('magicMoment')

  // Normalized progress within this phase (5-20% mapped to 0-1)
  const normalizedProgress = Math.min(1, Math.max(0, (progress - 5) / 15))

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
        {t('phase2')}
      </h2>

      <div className="relative flex w-full max-w-lg items-center justify-center gap-8 py-8">
        {/* Child photo placeholder (left) */}
        <motion.div
          className={cn(
            'flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl',
            'border-2 border-dashed border-slate-300 bg-slate-100',
            'dark:border-slate-600 dark:bg-slate-800'
          )}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg
            className="h-12 w-12 text-slate-400 dark:text-slate-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" />
          </svg>
        </motion.div>

        {/* Sparkle particles between */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-yellow-400 dark:bg-yellow-300"
              animate={{
                x: [
                  Math.cos((i * Math.PI * 2) / 6) * 10,
                  Math.cos((i * Math.PI * 2) / 6) * 30,
                  Math.cos((i * Math.PI * 2) / 6) * 10,
                ],
                y: [
                  Math.sin((i * Math.PI * 2) / 6) * 10,
                  Math.sin((i * Math.PI * 2) / 6) * 30,
                  Math.sin((i * Math.PI * 2) / 6) * 10,
                ],
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            />
          ))}
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            &#10024;
          </motion.span>
        </div>

        {/* Illustration style placeholder (right) */}
        <motion.div
          className={cn(
            'flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl',
            'bg-gradient-to-br from-primary-200 to-primary-400',
            'dark:from-primary-700 dark:to-primary-900'
          )}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ opacity: 0.5 + normalizedProgress * 0.5 }}
        >
          <svg
            className="h-12 w-12 text-white/80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5-3 3-2-2-8 8" />
          </svg>
        </motion.div>
      </div>
    </div>
  )
}
