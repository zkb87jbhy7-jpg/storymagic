'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface AutismModeProps {
  currentPage: number
  totalPages: number
  pageText: string
  childAge: number
  children: React.ReactNode
}

/**
 * Autism-Friendly mode:
 * - Uniform layout (identical every page)
 * - No surprise animations
 * - Emotion labels: "Dana feels happy because..."
 * - Transition warning before page change
 */
export function AutismMode({
  currentPage,
  totalPages,
  pageText,
  childAge,
  children,
}: AutismModeProps) {
  const t = useTranslations('reader')
  const [showTransition, setShowTransition] = useState(false)
  const prevPageRef = useRef(currentPage)

  // Show transition warning when page changes
  useEffect(() => {
    if (currentPage !== prevPageRef.current) {
      setShowTransition(true)
      const timer = setTimeout(() => {
        setShowTransition(false)
        prevPageRef.current = currentPage
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [currentPage])

  return (
    <div className="relative">
      {/* Disable all animations in autism mode */}
      <style jsx global>{`
        .reader-autism *,
        .reader-autism *::before,
        .reader-autism *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        .reader-autism canvas {
          display: none !important;
        }
        .reader-autism .reader-uniform-layout {
          display: flex;
          flex-direction: column;
          padding: 1rem;
        }
      `}</style>

      {children}

      {/* Transition warning overlay */}
      <AnimatePresence>
        {showTransition && (
          <div
            className={cn(
              'fixed inset-x-0 top-12 z-50 flex justify-center'
            )}
          >
            <div
              className={cn(
                'rounded-xl px-6 py-3 shadow-lg',
                'bg-primary-100 text-primary-800',
                'dark:bg-primary-900/80 dark:text-primary-200'
              )}
            >
              <p className="text-sm font-medium">
                {t('autismTransitionWarning')}
              </p>
              <p className="mt-1 text-xs text-primary-600 dark:text-primary-400">
                {t('pageOf', { current: currentPage + 1, total: totalPages })}
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
