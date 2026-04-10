'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { AudioWaveform } from './AudioWaveform'

interface NarrationSegment {
  pageNumber: number
  startTime: number // seconds into the audio
  endTime: number
}

interface VoiceNarrationPlayerProps {
  /** Single audio URL or per-page URLs */
  audioUrl: string
  /** Map page boundaries within the audio */
  segments?: NarrationSegment[]
  /** Currently displayed page */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Callback when page should change based on narration progress */
  onPageChange?: (page: number) => void
  className?: string
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2] as const

export function VoiceNarrationPlayer({
  audioUrl,
  segments,
  currentPage,
  totalPages,
  onPageChange,
  className,
}: VoiceNarrationPlayerProps) {
  const t = useTranslations('voice')
  const audioRef = useRef<HTMLAudioElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [speed, setSpeed] = useState<(typeof SPEED_OPTIONS)[number]>(1)

  const setupAudioContext = useCallback(() => {
    const audio = audioRef.current
    if (!audio || sourceRef.current) return

    const ctx = new AudioContext()
    audioContextRef.current = ctx
    const source = ctx.createMediaElementSource(audio)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    analyser.connect(ctx.destination)
    sourceRef.current = source
    analyserRef.current = analyser
  }, [])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      setupAudioContext()
      await audio.play()
      setIsPlaying(true)
    }
  }, [isPlaying, setupAudioContext])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0))
  }, [])

  const skipPage = useCallback(
    (direction: 'prev' | 'next') => {
      if (!segments) return
      const targetPage = direction === 'next' ? currentPage + 1 : currentPage - 1
      const segment = segments.find((s) => s.pageNumber === targetPage)
      if (segment) {
        seek(segment.startTime)
        onPageChange?.(targetPage)
      }
    },
    [segments, currentPage, seek, onPageChange]
  )

  const cycleSpeed = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const currentIndex = SPEED_OPTIONS.indexOf(speed)
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length
    const newSpeed = SPEED_OPTIONS[nextIndex]
    setSpeed(newSpeed)
    audio.playbackRate = newSpeed
  }, [speed])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)

      // Auto-advance page based on segments
      if (segments && onPageChange) {
        const activeSegment = segments.find(
          (s) => audio.currentTime >= s.startTime && audio.currentTime < s.endTime
        )
        if (activeSegment && activeSegment.pageNumber !== currentPage) {
          onPageChange(activeSegment.pageNumber)
        }
      }
    }

    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [segments, currentPage, onPageChange])

  useEffect(() => {
    return () => {
      audioContextRef.current?.close()
    }
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800',
        className
      )}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Waveform */}
      <AudioWaveform
        isLive={isPlaying}
        analyserNode={analyserRef.current}
        height={48}
        barWidth={2}
        barGap={1}
        className="mb-3"
      />

      {/* Seek bar */}
      <div className="mb-3">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          className={cn(
            'h-1.5 w-full cursor-pointer appearance-none rounded-full',
            'bg-slate-200 dark:bg-slate-700',
            '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:shadow-md'
          )}
          style={{
            background: `linear-gradient(to right, #6366f1 ${progressPercent}%, #e2e8f0 ${progressPercent}%)`,
          }}
          aria-label={t('seekPosition')}
        />
        <div className="mt-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Speed */}
        <button
          type="button"
          onClick={cycleSpeed}
          className={cn(
            'rounded-lg px-2 py-1 text-xs font-bold',
            'bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200',
            'dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
          )}
          aria-label={t('playbackSpeed')}
        >
          {speed}x
        </button>

        {/* Transport */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => skipPage('prev')}
            disabled={currentPage <= 1}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
              'text-slate-600 hover:bg-slate-100 disabled:opacity-40',
              'dark:text-slate-300 dark:hover:bg-slate-700'
            )}
            aria-label={t('previousPage')}
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <motion.button
            type="button"
            onClick={togglePlay}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              'bg-primary-500 text-white shadow-md transition-shadow hover:shadow-lg',
              'focus:outline-none focus:ring-4 focus:ring-primary-300/50'
            )}
            aria-label={isPlaying ? t('pause') : t('play')}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ms-0.5" />
            )}
          </motion.button>

          <button
            type="button"
            onClick={() => skipPage('next')}
            disabled={currentPage >= totalPages}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
              'text-slate-600 hover:bg-slate-100 disabled:opacity-40',
              'dark:text-slate-300 dark:hover:bg-slate-700'
            )}
            aria-label={t('nextPage')}
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Page indicator */}
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {t('pageIndicator', { current: currentPage, total: totalPages })}
        </span>
      </div>
    </div>
  )
}
