'use client'

import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface EarlyPeekProps {
  imageUrl: string | null
  isVisible: boolean
  onDismiss: () => void
}

export function EarlyPeek({ imageUrl, isVisible, onDismiss }: EarlyPeekProps) {
  const t = useTranslations('magicMoment')

  return (
    <AnimatePresence>
      {isVisible && imageUrl && (
        <motion.div
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            'bg-black/70 backdrop-blur-sm'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onDismiss}
        >
          <motion.div
            className="relative mx-4 flex max-h-[80vh] max-w-lg flex-col items-center gap-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Badge */}
            <motion.div
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-bold',
                'bg-yellow-400 text-yellow-900',
                'dark:bg-yellow-500 dark:text-yellow-950'
              )}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t('earlyPeek')}
            </motion.div>

            {/* Image */}
            <div
              className={cn(
                'overflow-hidden rounded-2xl border-4 shadow-2xl',
                'border-white/20 dark:border-white/10'
              )}
            >
              <img
                src={imageUrl}
                alt="Early peek at your book illustration"
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            {/* Dismiss */}
            <button
              type="button"
              onClick={onDismiss}
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                'bg-white/20 text-white hover:bg-white/30',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
              )}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
