'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { AudioWaveform } from './AudioWaveform'

interface VoicePreviewPlayerProps {
  /** URL or blob URL to audio */
  src: string
  /** Label for screen readers */
  label?: string
  /** Compact mode for inline use */
  compact?: boolean
  className?: string
}

export function VoicePreviewPlayer({
  src,
  label,
  compact = false,
  className,
}: VoicePreviewPlayerProps) {
  const t = useTranslations('voice')
  const audioRef = useRef<HTMLAudioElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const setupAnalyser = useCallback(() => {
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
      setupAnalyser()
      await audio.play()
      setIsPlaying(true)
    }
  }, [isPlaying, setupAnalyser])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
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
  }, [])

  useEffect(() => {
    return () => {
      audioContextRef.current?.close()
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
        compact ? 'px-2 py-1.5' : 'px-3 py-2',
        className
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        type="button"
        onClick={togglePlay}
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full',
          'bg-primary-500 text-white transition-colors hover:bg-primary-600',
          'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
          'dark:focus:ring-offset-slate-800',
          compact ? 'h-7 w-7' : 'h-9 w-9'
        )}
        aria-label={isPlaying ? t('pause') : t('playPreview')}
      >
        {isPlaying ? (
          <Pause className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
        ) : (
          <Play className={cn(compact ? 'h-3 w-3' : 'h-4 w-4', 'ms-0.5')} />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <AudioWaveform
          isLive={isPlaying}
          analyserNode={analyserRef.current}
          height={compact ? 24 : 32}
          barWidth={2}
          barGap={1}
        />
      </div>

      <span
        className={cn(
          'shrink-0 font-mono text-slate-500 dark:text-slate-400',
          compact ? 'text-xs' : 'text-sm'
        )}
      >
        {formatTime(currentTime)}/{formatTime(duration)}
      </span>

      {label && <span className="sr-only">{label}</span>}
    </div>
  )
}
