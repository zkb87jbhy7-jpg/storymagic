'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'

const FACTS = [
  'Children who are read to daily hear about 1.4 million more words by age 5.',
  'The oldest known children\'s book dates back to 1658.',
  'Reading for just 20 minutes a day exposes kids to 1.8 million words per year.',
  'Picture books help develop visual literacy and critical thinking.',
  'Personalized stories boost reading engagement by up to 40%.',
  'Children remember stories better when they see themselves as the main character.',
  'Bedtime reading routines improve sleep quality for children.',
  'Illustrations activate different brain regions than text alone.',
  'Rhyming stories help children develop phonological awareness.',
  'Kids who own books are more likely to read for pleasure.',
]

const INTERVAL_MS = 8000

interface FactTickerProps {
  className?: string
}

export function FactTicker({ className }: FactTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const cycle = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % FACTS.length)
      setIsVisible(true)
    }, 400)
  }, [])

  useEffect(() => {
    const timer = setInterval(cycle, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [cycle])

  return (
    <div
      className={cn(
        'flex items-center justify-center px-4 py-3',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <p
        className={cn(
          'text-center text-sm text-slate-500 transition-opacity duration-400 dark:text-slate-400',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
      >
        {FACTS[currentIndex]}
      </p>
    </div>
  )
}
