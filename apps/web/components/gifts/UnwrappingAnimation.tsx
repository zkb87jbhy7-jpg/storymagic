'use client'

import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Gift, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface UnwrappingAnimationProps {
  onComplete: () => void
  className?: string
}

export function UnwrappingAnimation({
  onComplete,
  className,
}: UnwrappingAnimationProps) {
  const t = useTranslations('gifts')
  const [phase, setPhase] = useState<'wrapped' | 'unwrapping' | 'revealed'>('wrapped')

  const handleUnwrap = useCallback(() => {
    setPhase('unwrapping')
    setTimeout(() => {
      setPhase('revealed')
    }, 1500)
  }, [])

  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center',
        className,
      )}
    >
      <AnimatePresence mode="wait">
        {phase === 'wrapped' && (
          <motion.div
            key="wrapped"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <button
              type="button"
              onClick={handleUnwrap}
              className={cn(
                'group relative flex h-48 w-48 items-center justify-center',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-500 focus-visible:rounded-3xl',
              )}
              aria-label={t('tapToUnwrap')}
            >
              {/* Gift box */}
              <div className="relative h-40 w-40 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 shadow-2xl transition-transform group-hover:scale-105">
                {/* Ribbon horizontal */}
                <div className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 bg-amber-400/80" />
                {/* Ribbon vertical */}
                <div className="absolute inset-y-0 start-1/2 w-4 -translate-x-1/2 bg-amber-400/80" />
                {/* Bow */}
                <div className="absolute -top-4 start-1/2 -translate-x-1/2">
                  <div className="flex gap-1">
                    <div className="h-6 w-8 rounded-full bg-amber-400" />
                    <div className="h-6 w-8 rounded-full bg-amber-400" />
                  </div>
                </div>
                {/* Sparkles */}
                <Sparkles className="absolute -end-2 -top-2 h-6 w-6 animate-pulse text-amber-300" />
                <Sparkles className="absolute -bottom-1 -start-1 h-4 w-4 animate-pulse text-pink-300" />
              </div>
            </button>
            <p className="mt-6 animate-bounce text-sm font-medium text-slate-600 dark:text-slate-400">
              {t('tapToUnwrap')}
            </p>
          </motion.div>
        )}

        {phase === 'unwrapping' && (
          <motion.div
            key="unwrapping"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="relative h-48 w-48">
              {/* Left paper piece */}
              <motion.div
                initial={{ x: 0, y: 0, rotate: 0 }}
                animate={{ x: -120, y: 60, rotate: -45, opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500"
                style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
              />
              {/* Right paper piece */}
              <motion.div
                initial={{ x: 0, y: 0, rotate: 0 }}
                animate={{ x: 120, y: 60, rotate: 45, opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500"
                style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}
              />
              {/* Inner gift reveal */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 shadow-lg dark:from-amber-900/30 dark:to-amber-800/30">
                  <Gift className="h-16 w-16 text-amber-600 dark:text-amber-400" />
                </div>
              </motion.div>
            </div>
            {/* Floating particles */}
            {Array.from({ length: 8 }, (_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 200 - 100,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 1 + Math.random() * 0.5,
                  delay: 0.2 + Math.random() * 0.3,
                }}
                className="absolute"
                style={{
                  top: '50%',
                  left: '50%',
                }}
              >
                <Sparkles
                  className="h-4 w-4"
                  style={{
                    color: ['#f472b6', '#a78bfa', '#fbbf24', '#34d399'][i % 4],
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {phase === 'revealed' && (
          <motion.div
            key="revealed"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 shadow-xl dark:from-amber-900/30 dark:to-amber-800/30">
              <Gift className="h-12 w-12 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
              {t('youGotAGift')}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t('giftRevealedDescription')}
            </p>
            <button
              type="button"
              onClick={onComplete}
              className={cn(
                'mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold',
                'bg-gradient-to-r from-pink-500 to-purple-600 text-white transition-opacity',
                'hover:opacity-90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2',
                'dark:focus-visible:ring-offset-slate-900',
              )}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t('openYourGift')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
