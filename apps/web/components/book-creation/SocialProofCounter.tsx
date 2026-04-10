'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

interface SocialProofCounterProps {
  className?: string
}

export function SocialProofCounter({ className }: SocialProofCounterProps) {
  const t = useTranslations('magicMoment')
  const [displayCount, setDisplayCount] = useState(0)
  const targetRef = useRef(Math.floor(Math.random() * 30) + 42)

  useEffect(() => {
    const target = targetRef.current
    if (displayCount >= target) return

    const step = Math.max(1, Math.floor((target - displayCount) / 10))
    const timer = setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + step, target))
    }, 60)

    return () => clearTimeout(timer)
  }, [displayCount])

  // Slowly fluctuate
  useEffect(() => {
    const interval = setInterval(() => {
      targetRef.current = Math.floor(Math.random() * 30) + 42
      setDisplayCount((prev) => {
        const diff = targetRef.current - prev
        return prev + Math.sign(diff)
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1.5 py-2',
        className
      )}
    >
      <span
        className={cn(
          'inline-flex min-w-[2ch] items-center justify-center text-sm font-bold tabular-nums',
          'text-primary-600 dark:text-primary-400'
        )}
      >
        {displayCount}
      </span>
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {t('booksCreating', { count: displayCount })}
      </span>
    </div>
  )
}
