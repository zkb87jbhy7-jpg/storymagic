'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface SparkyChatBubbleProps {
  /** Text to display with typewriter effect */
  message: string
  /** Whether to show the bubble */
  isVisible?: boolean
  /** Typing speed in ms per character */
  typingSpeed?: number
  /** Position relative to mascot */
  position?: 'top' | 'right' | 'bottom'
  /** Called when typing animation finishes */
  onTypingComplete?: () => void
  className?: string
}

export function SparkyChatBubble({
  message,
  isVisible = true,
  typingSpeed = 35,
  position = 'right',
  onTypingComplete,
  className,
}: SparkyChatBubbleProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTypingDone, setIsTypingDone] = useState(false)
  const indexRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)

  useEffect(() => {
    if (!isVisible) {
      setDisplayedText('')
      setIsTypingDone(false)
      indexRef.current = 0
      return
    }

    indexRef.current = 0
    setDisplayedText('')
    setIsTypingDone(false)

    intervalRef.current = setInterval(() => {
      indexRef.current++
      if (indexRef.current >= message.length) {
        setDisplayedText(message)
        setIsTypingDone(true)
        onTypingComplete?.()
        if (intervalRef.current) clearInterval(intervalRef.current)
      } else {
        setDisplayedText(message.slice(0, indexRef.current))
      }
    }, typingSpeed)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [message, isVisible, typingSpeed, onTypingComplete])

  const tailPositionClasses = {
    top: 'bottom-full start-6 mb-0',
    right: 'start-full top-4 ms-0',
    bottom: 'top-full start-6 mt-0',
  }

  const tailSvg = {
    top: (
      <svg
        className="absolute start-4 top-full h-3 w-4 text-white dark:text-slate-700"
        viewBox="0 0 16 12"
        fill="currentColor"
      >
        <path d="M0 0 L8 12 L16 0 Z" />
      </svg>
    ),
    right: (
      <svg
        className="absolute end-full top-3 h-4 w-3 text-white dark:text-slate-700"
        viewBox="0 0 12 16"
        fill="currentColor"
      >
        <path d="M12 0 L0 8 L12 16 Z" />
      </svg>
    ),
    bottom: (
      <svg
        className="absolute bottom-full start-4 h-3 w-4 text-white dark:text-slate-700"
        viewBox="0 0 16 12"
        fill="currentColor"
      >
        <path d="M0 12 L8 0 L16 12 Z" />
      </svg>
    ),
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={cn(
            'relative max-w-xs rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-lg',
            'dark:border-slate-600 dark:bg-slate-700',
            tailPositionClasses[position],
            className
          )}
        >
          {tailSvg[position]}

          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {displayedText}
            {!isTypingDone && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="ms-0.5 inline-block h-4 w-0.5 bg-primary-500"
              />
            )}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
