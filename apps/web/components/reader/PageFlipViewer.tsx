'use client'

import { useRef, useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface PageFlipViewerProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  children: React.ReactNode
}

type Direction = 'next' | 'prev'

const PAGE_VARIANTS = {
  enter: (direction: Direction) => ({
    x: direction === 'next' ? '100%' : '-100%',
    opacity: 0,
    rotateY: direction === 'next' ? -15 : 15,
  }),
  center: {
    x: 0,
    opacity: 1,
    rotateY: 0,
  },
  exit: (direction: Direction) => ({
    x: direction === 'next' ? '-100%' : '100%',
    opacity: 0,
    rotateY: direction === 'next' ? 15 : -15,
  }),
}

export function PageFlipViewer({
  currentPage,
  totalPages,
  onPageChange,
  children,
}: PageFlipViewerProps) {
  const t = useTranslations('reader')
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const [direction, setDirection] = useState<Direction>('next')

  const goNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setDirection('next')
      onPageChange(currentPage + 1)
    } else if (currentPage === totalPages - 1) {
      // Trigger end of book
      onPageChange(totalPages)
    }
  }, [currentPage, totalPages, onPageChange])

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      setDirection('prev')
      onPageChange(currentPage - 1)
    }
  }, [currentPage, onPageChange])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

    // Must be primarily horizontal swipe
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      // RTL-aware: detect document direction
      const isRtl = document.documentElement.dir === 'rtl'
      const isSwipeToNext = isRtl ? dx > 0 : dx < 0

      if (isSwipeToNext) {
        goNext()
      } else {
        goPrev()
      }
    }

    touchStartRef.current = null
  }, [goNext, goPrev])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const third = rect.width / 3

    // RTL-aware click zones
    const isRtl = document.documentElement.dir === 'rtl'

    if (isRtl) {
      if (clickX < third) goNext()
      else if (clickX > rect.width - third) goPrev()
    } else {
      if (clickX > rect.width - third) goNext()
      else if (clickX < third) goPrev()
    }
  }, [goNext, goPrev])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const isRtl = document.documentElement.dir === 'rtl'
    if (e.key === 'ArrowRight') {
      isRtl ? goPrev() : goNext()
    } else if (e.key === 'ArrowLeft') {
      isRtl ? goNext() : goPrev()
    }
  }, [goNext, goPrev])

  return (
    <div className="flex flex-1 flex-col">
      {/* Page content with flip animation */}
      <div
        ref={containerRef}
        className="relative flex-1 cursor-pointer overflow-hidden [perspective:1000px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label={t('swipeHint')}
        aria-roledescription="page viewer"
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            variants={PAGE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              rotateY: { duration: 0.3 },
            }}
            className="h-full w-full"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page counter */}
      <div className="flex items-center justify-center gap-3 py-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentPage === 0}
          className={cn(
            'rounded-full p-1.5 transition-colors',
            'text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent',
            'dark:text-slate-400 dark:hover:bg-slate-800'
          )}
          aria-label="Previous page"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span
          className="min-w-[4rem] text-center text-sm font-medium text-slate-600 dark:text-slate-400"
          aria-live="polite"
        >
          {t('pageOf', { current: currentPage + 1, total: totalPages })}
        </span>

        <button
          type="button"
          onClick={goNext}
          disabled={currentPage >= totalPages - 1}
          className={cn(
            'rounded-full p-1.5 transition-colors',
            'text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent',
            'dark:text-slate-400 dark:hover:bg-slate-800'
          )}
          aria-label="Next page"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
