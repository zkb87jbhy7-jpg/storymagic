'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface StoryStreamingDisplayProps {
  words: string[]
  onComplete?: () => void
  typingSpeed?: number
  className?: string
}

export function StoryStreamingDisplay({
  words,
  onComplete,
  typingSpeed = 80,
  className,
}: StoryStreamingDisplayProps) {
  const [visibleCount, setVisibleCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const completeRef = useRef(false)

  useEffect(() => {
    setVisibleCount(0)
    completeRef.current = false
  }, [words])

  useEffect(() => {
    if (visibleCount >= words.length) {
      if (!completeRef.current && words.length > 0) {
        completeRef.current = true
        onComplete?.()
      }
      return
    }

    const timer = setTimeout(() => {
      setVisibleCount((prev) => prev + 1)
    }, typingSpeed)

    return () => clearTimeout(timer)
  }, [visibleCount, words.length, typingSpeed, onComplete])

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [visibleCount])

  const isTyping = visibleCount < words.length

  return (
    <div
      ref={containerRef}
      className={cn(
        'max-h-64 overflow-y-auto rounded-xl border p-5',
        'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
        className
      )}
    >
      <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
        {words.slice(0, visibleCount).join(' ')}
        {isTyping && (
          <span
            className="ms-0.5 inline-block h-4 w-0.5 animate-blink bg-primary-500 align-middle dark:bg-primary-400"
            aria-hidden="true"
          />
        )}
      </p>

      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 0.8s infinite;
        }
      `}</style>
    </div>
  )
}
