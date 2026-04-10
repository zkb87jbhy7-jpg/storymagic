'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'
import { calculateTimings, getCurrentWordIndex, type WordTiming } from '@/lib/reader/karaoke-engine'
import { AudioController } from '@/lib/reader/audio-controller'
import { WordHighlighter } from './WordHighlighter'

interface KaraokeReaderProps {
  text: string
  audioUrl?: string
  speed?: number
}

// Default duration estimate: ~200ms per word
function estimateDuration(text: string): number {
  const words = text.split(/\s+/).filter(Boolean)
  return words.length * 350
}

export function KaraokeReader({ text, audioUrl, speed = 1.0 }: KaraokeReaderProps) {
  const [timings, setTimings] = useState<WordTiming[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<AudioController | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)
  const words = text.split(/\s+/).filter(Boolean)

  // Calculate timings
  useEffect(() => {
    const duration = audioUrl ? 5000 : estimateDuration(text) // Placeholder for actual audio
    const wordTimings = calculateTimings(text, duration / speed)
    setTimings(wordTimings)
  }, [text, audioUrl, speed])

  // Handle audio
  useEffect(() => {
    if (audioUrl) {
      const controller = new AudioController()
      audioRef.current = controller

      controller.loadNarration(audioUrl).then(() => {
        controller.setSpeed(speed)
      }).catch(() => {
        // Audio load failed - use timer-based karaoke
      })

      return () => {
        controller.destroy()
        audioRef.current = null
      }
    }
  }, [audioUrl, speed])

  const startKaraoke = useCallback(() => {
    setIsPlaying(true)
    setActiveIndex(0)
    startTimeRef.current = performance.now()

    if (audioRef.current) {
      audioRef.current.play()
    }

    // Timer-based word tracking
    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTimeRef.current) * speed
      const idx = getCurrentWordIndex(timings, elapsed)

      if (idx === -1 && elapsed > (timings[timings.length - 1]?.endMs ?? 0)) {
        // Finished
        setIsPlaying(false)
        setActiveIndex(-1)
        if (timerRef.current) clearInterval(timerRef.current)
      } else {
        setActiveIndex(idx)
      }
    }, 50)
  }, [timings, speed])

  const stopKaraoke = useCallback(() => {
    setIsPlaying(false)
    setActiveIndex(-1)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.reset()
    }
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Auto-start when timings are ready
  useEffect(() => {
    if (timings.length > 0 && !isPlaying) {
      startKaraoke()
    }
    return () => {
      stopKaraoke()
    }
  }, [timings]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={cn(
        'absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6',
        'bg-gradient-to-t from-black/60 to-transparent'
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {words.map((word, idx) => (
          <WordHighlighter
            key={`${idx}-${word}`}
            word={word}
            isActive={idx === activeIndex}
            isPast={idx < activeIndex}
          />
        ))}
      </div>
    </div>
  )
}
