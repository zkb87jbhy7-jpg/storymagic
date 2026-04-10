'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface MagicPhasePaintingProps {
  progress: number
  totalPages?: number
}

const PAGE_COLORS = [
  'from-red-200 to-red-400 dark:from-red-700 dark:to-red-900',
  'from-orange-200 to-orange-400 dark:from-orange-700 dark:to-orange-900',
  'from-yellow-200 to-yellow-400 dark:from-yellow-700 dark:to-yellow-900',
  'from-green-200 to-green-400 dark:from-green-700 dark:to-green-900',
  'from-teal-200 to-teal-400 dark:from-teal-700 dark:to-teal-900',
  'from-blue-200 to-blue-400 dark:from-blue-700 dark:to-blue-900',
  'from-indigo-200 to-indigo-400 dark:from-indigo-700 dark:to-indigo-900',
  'from-purple-200 to-purple-400 dark:from-purple-700 dark:to-purple-900',
  'from-pink-200 to-pink-400 dark:from-pink-700 dark:to-pink-900',
  'from-rose-200 to-rose-400 dark:from-rose-700 dark:to-rose-900',
  'from-sky-200 to-sky-400 dark:from-sky-700 dark:to-sky-900',
  'from-emerald-200 to-emerald-400 dark:from-emerald-700 dark:to-emerald-900',
]

export function MagicPhasePainting({
  progress,
  totalPages = 12,
}: MagicPhasePaintingProps) {
  const t = useTranslations('magicMoment')

  // Normalized progress within this phase (20-55% mapped to 0-1)
  const normalizedProgress = Math.min(1, Math.max(0, (progress - 20) / 35))
  const filledPages = Math.floor(normalizedProgress * totalPages)

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
        {t('phase3')}
      </h2>

      <div className="grid w-full max-w-md grid-cols-3 gap-3 sm:grid-cols-4">
        {Array.from({ length: totalPages }).map((_, i) => {
          const isFilled = i < filledPages
          const isActive = i === filledPages

          return (
            <motion.div
              key={i}
              className={cn(
                'relative aspect-[3/4] overflow-hidden rounded-lg border',
                isFilled
                  ? 'border-transparent'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
              )}
              initial={false}
              animate={
                isActive
                  ? { scale: [1, 1.05, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.6 }}
            >
              {isFilled && (
                <motion.div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-br',
                    PAGE_COLORS[i % PAGE_COLORS.length]
                  )}
                  initial={{ scale: 0, borderRadius: '50%' }}
                  animate={{ scale: 1, borderRadius: '0%' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              )}

              {/* Paint splash on active page */}
              {isActive && (
                <motion.div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-br',
                    PAGE_COLORS[i % PAGE_COLORS.length]
                  )}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.2, 1], opacity: [0, 0.8, 1] }}
                  transition={{ duration: 0.8 }}
                />
              )}

              {/* Page number */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={cn(
                    'text-xs font-medium',
                    isFilled
                      ? 'text-white/70'
                      : 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  {i + 1}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
