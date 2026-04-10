'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { InteractiveElement } from './InteractiveBookReader'
import { FunFactBubble } from './FunFactBubble'

interface TappableObjectProps {
  element: InteractiveElement
}

/**
 * Positioned element that pulses gently.
 * On tap/click, shows FunFactBubble.
 */
export function TappableObject({ element }: TappableObjectProps) {
  const [showFact, setShowFact] = useState(false)

  const handleTap = useCallback(() => {
    setShowFact(true)
  }, [])

  const handleDismiss = useCallback(() => {
    setShowFact(false)
  }, [])

  return (
    <>
      <motion.button
        type="button"
        onClick={handleTap}
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 0 0 rgba(251,191,36,0.4)',
            '0 0 0 8px rgba(251,191,36,0)',
            '0 0 0 0 rgba(251,191,36,0)',
          ],
        }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="pointer-events-auto absolute cursor-pointer rounded-full border-2 border-accent-400/50 bg-accent-400/20"
        style={{
          left: `${element.x}%`,
          top: `${element.y}%`,
          width: `${element.width}%`,
          height: `${element.height}%`,
        }}
        aria-label={element.label}
      />

      {showFact && (
        <FunFactBubble
          fact={element.funFact}
          x={element.x + element.width / 2}
          y={element.y}
          onDismiss={handleDismiss}
        />
      )}
    </>
  )
}
