'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { UnwrappingAnimation } from './UnwrappingAnimation'

interface GiftRedeemExperienceProps {
  senderName: string
  message: string
  giftType: 'digital' | 'print' | 'experience'
  onStartCreating: () => void
  className?: string
}

export function GiftRedeemExperience({
  senderName,
  message,
  giftType,
  onStartCreating,
  className,
}: GiftRedeemExperienceProps) {
  const t = useTranslations('gifts')
  const [phase, setPhase] = useState<'unwrap' | 'message' | 'create'>('unwrap')

  const handleUnwrapComplete = useCallback(() => {
    setPhase('message')
  }, [])

  const handleContinue = useCallback(() => {
    setPhase('create')
  }, [])

  return (
    <div className={cn('min-h-[500px]', className)}>
      <AnimatePresence mode="wait">
        {phase === 'unwrap' && (
          <motion.div
            key="unwrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <UnwrappingAnimation onComplete={handleUnwrapComplete} />
          </motion.div>
        )}

        {phase === 'message' && (
          <motion.div
            key="message"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center px-4 py-12 text-center"
          >
            <Heart
              className="h-12 w-12 text-pink-500 dark:text-pink-400"
              aria-hidden="true"
            />
            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
              {t('giftFrom', { name: senderName })}
            </h2>

            {/* Message card */}
            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50 p-8 shadow-sm dark:border-pink-800/50 dark:from-pink-900/10 dark:to-purple-900/10">
              <p className="text-base italic leading-relaxed text-slate-700 dark:text-slate-300">
                &ldquo;{message}&rdquo;
              </p>
              <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                &mdash; {senderName}
              </p>
            </div>

            {/* Gift type info */}
            <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
              {t(`redeemDescription.${giftType}`)}
            </p>

            <button
              type="button"
              onClick={handleContinue}
              className={cn(
                'mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold',
                'bg-gradient-to-r from-pink-500 to-purple-600 text-white transition-opacity',
                'hover:opacity-90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2',
                'dark:focus-visible:ring-offset-slate-900',
              )}
            >
              {t('continueToCreate')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </motion.div>
        )}

        {phase === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center px-4 py-12 text-center"
          >
            <Sparkles
              className="h-12 w-12 text-amber-500 dark:text-amber-400"
              aria-hidden="true"
            />
            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
              {t('readyToCreate')}
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
              {t('readyToCreateDescription')}
            </p>
            <button
              type="button"
              onClick={onStartCreating}
              className={cn(
                'mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold',
                'bg-primary-600 text-white transition-colors hover:bg-primary-700',
                'dark:bg-primary-500 dark:hover:bg-primary-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                'dark:focus-visible:ring-offset-slate-900',
              )}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t('startCreatingBook')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
