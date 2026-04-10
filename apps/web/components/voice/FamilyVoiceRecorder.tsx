'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { AudioWaveform } from './AudioWaveform'
import { VoicePreviewPlayer } from './VoicePreviewPlayer'
import {
  RecordingQualityFeedback,
  type RecordingQuality,
  type QualityLevel,
} from './RecordingQualityFeedback'

const MAX_DURATION = 30 // seconds

interface FamilyVoiceRecorderProps {
  onRecordingComplete: (blob: Blob, quality: RecordingQuality) => void
  className?: string
}

export function FamilyVoiceRecorder({
  onRecordingComplete,
  className,
}: FamilyVoiceRecorderProps) {
  const t = useTranslations('voice')

  const [isRecording, setIsRecording] = useState(false)
  const [countdown, setCountdown] = useState(MAX_DURATION)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [quality, setQuality] = useState<RecordingQuality | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval>>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const analyzeQuality = useCallback((analyser: AnalyserNode): RecordingQuality => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(dataArray)

    // Simple analysis based on frequency data
    const avgVolume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
    const maxVolume = Math.max(...dataArray)
    const lowFreqAvg =
      dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10
    const highFreqAvg =
      dataArray.slice(dataArray.length - 20).reduce((a, b) => a + b, 0) / 20

    const bgNoiseLevel: QualityLevel =
      lowFreqAvg < 30 ? 'good' : lowFreqAvg < 60 ? 'fair' : 'poor'
    const volumeLevel: QualityLevel =
      avgVolume > 40 && maxVolume < 240 ? 'good' : avgVolume > 20 ? 'fair' : 'poor'
    const clarityLevel: QualityLevel =
      highFreqAvg > 10 && avgVolume > 30 ? 'good' : avgVolume > 15 ? 'fair' : 'poor'

    const scores = { good: 100, fair: 60, poor: 20 }
    const overallScore = Math.round(
      (scores[bgNoiseLevel] + scores[volumeLevel] + scores[clarityLevel]) / 3
    )

    return {
      backgroundNoise: bgNoiseLevel,
      volumeConsistency: volumeLevel,
      clarity: clarityLevel,
      overallScore,
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      })
      streamRef.current = stream

      // Set up analyser
      const audioCtx = new AudioContext()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaElementSource
        ? audioCtx.createMediaStreamSource(stream)
        : audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      analyserRef.current = analyser

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setRecordedBlob(blob)
        setRecordedUrl(url)

        if (analyserRef.current) {
          const q = analyzeQuality(analyserRef.current)
          setQuality(q)
          onRecordingComplete(blob, q)
        }

        stream.getTracks().forEach((track) => track.stop())
        audioCtx.close()
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setCountdown(MAX_DURATION)
      setRecordedBlob(null)
      setRecordedUrl(null)
      setQuality(null)

      // Start countdown
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            mediaRecorder.stop()
            setIsRecording(false)
            if (timerRef.current) clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch {
      // Permission denied or device not available
    }
  }, [analyzeQuality, onRecordingComplete])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
  }, [])

  const resetRecording = useCallback(() => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    setRecordedBlob(null)
    setRecordedUrl(null)
    setQuality(null)
    setCountdown(MAX_DURATION)
  }, [recordedUrl])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (recordedUrl) URL.revokeObjectURL(recordedUrl)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      audioContextRef.current?.close()
    }
  }, [recordedUrl])

  const progress = ((MAX_DURATION - countdown) / MAX_DURATION) * 100

  return (
    <div className={cn('space-y-4', className)}>
      {/* Recording area */}
      <div className="relative flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
        {/* Countdown timer */}
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="relative mx-auto h-24 w-24">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    className="text-danger-500 transition-all duration-1000"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-900 dark:text-white">
                  {countdown}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-danger-500">{t('recording')}</p>
            </motion.div>
          ) : recordedUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <p className="mb-2 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('recordingPreview')}
              </p>
              <VoicePreviewPlayer src={recordedUrl} label={t('familyVoicePreview')} />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('recordInstructions')}
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {t('maxDuration', { seconds: MAX_DURATION })}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live waveform */}
        {isRecording && (
          <AudioWaveform
            isLive
            analyserNode={analyserRef.current}
            height={40}
            barColor="#ef4444"
          />
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          {!isRecording && !recordedBlob && (
            <motion.button
              type="button"
              onClick={startRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full',
                'bg-danger-500 text-white shadow-lg transition-shadow hover:shadow-xl',
                'focus:outline-none focus:ring-4 focus:ring-danger-400/50'
              )}
              aria-label={t('startRecording')}
            >
              <Mic className="h-6 w-6" />
            </motion.button>
          )}

          {isRecording && (
            <motion.button
              type="button"
              onClick={stopRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full',
                'bg-slate-900 text-white shadow-lg transition-shadow hover:shadow-xl',
                'dark:bg-white dark:text-slate-900',
                'focus:outline-none focus:ring-4 focus:ring-slate-400/50'
              )}
              aria-label={t('stopRecording')}
            >
              <Square className="h-5 w-5" />
            </motion.button>
          )}

          {recordedBlob && !isRecording && (
            <>
              <motion.button
                type="button"
                onClick={resetRecording}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full',
                  'border-2 border-slate-300 text-slate-600 transition-colors hover:bg-slate-100',
                  'dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700',
                  'focus:outline-none focus:ring-4 focus:ring-slate-300/50'
                )}
                aria-label={t('reRecord')}
              >
                <RotateCcw className="h-5 w-5" />
              </motion.button>

              <motion.button
                type="button"
                onClick={startRecording}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full',
                  'bg-danger-500 text-white shadow-lg transition-shadow hover:shadow-xl',
                  'focus:outline-none focus:ring-4 focus:ring-danger-400/50'
                )}
                aria-label={t('startRecording')}
              >
                <Mic className="h-6 w-6" />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Quality feedback */}
      <AnimatePresence>
        {(quality || isRecording) && (
          <RecordingQualityFeedback quality={quality} isRecording={isRecording} />
        )}
      </AnimatePresence>
    </div>
  )
}
