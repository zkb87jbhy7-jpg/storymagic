'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface MagicPhaseAssemblyProps {
  progress: number
}

export function MagicPhaseAssembly({ progress }: MagicPhaseAssemblyProps) {
  const t = useTranslations('magicMoment')

  // Normalized progress within this phase (55-95% mapped to 0-1)
  const normalizedProgress = Math.min(1, Math.max(0, (progress - 55) / 40))

  const pages = Array.from({ length: 8 })
  const stackedPages = Math.ceil(normalizedProgress * pages.length)
  const showCover = normalizedProgress > 0.7

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
        {t('phase4')}
      </h2>

      <div
        className="relative flex h-64 w-full max-w-xs items-center justify-center"
        style={{ perspective: '800px' }}
      >
        {/* Pages stacking */}
        {pages.map((_, i) => {
          const isStacked = i < stackedPages
          return (
            <motion.div
              key={i}
              className={cn(
                'absolute h-44 w-32 rounded-md border shadow-sm',
                'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
              )}
              initial={{ y: -100, opacity: 0, rotateX: 20 }}
              animate={
                isStacked
                  ? {
                      y: -i * 3,
                      opacity: 1,
                      rotateX: 0,
                    }
                  : { y: -100, opacity: 0, rotateX: 20 }
              }
              transition={{
                duration: 0.5,
                delay: i * 0.15,
                ease: 'easeOut',
              }}
              style={{
                zIndex: i,
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-16 rounded bg-slate-100 dark:bg-slate-700" />
              </div>
            </motion.div>
          )
        })}

        {/* Cover wrapping around */}
        {showCover && (
          <motion.div
            className={cn(
              'absolute h-48 w-36 rounded-lg shadow-lg',
              'bg-gradient-to-br from-primary-500 to-primary-700',
              'dark:from-primary-400 dark:to-primary-600'
            )}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              zIndex: pages.length + 1,
              transformStyle: 'preserve-3d',
              transformOrigin: 'left center',
            }}
          >
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
              <div className="h-3 w-16 rounded bg-white/30" />
              <div className="h-2 w-12 rounded bg-white/20" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
