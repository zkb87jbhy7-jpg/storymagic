'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

export interface VoiceSynthesisOptions {
  /** BCP-47 language code (e.g., 'en-US', 'he-IL') */
  lang?: string
  /** Speaking rate 0.1-10 (default 1) */
  rate?: number
  /** Pitch 0-2 (default 1) */
  pitch?: number
  /** Volume 0-1 (default 1) */
  volume?: number
  /** Preferred voice name */
  voiceName?: string
}

export interface UseVoiceSynthesisReturn {
  /** Speak the given text */
  speak: (text: string) => void
  /** Cancel current speech */
  cancel: () => void
  /** Pause speech */
  pause: () => void
  /** Resume speech */
  resume: () => void
  /** Whether speech is currently playing */
  isSpeaking: boolean
  /** Whether speech is paused */
  isPaused: boolean
  /** Whether the Web Speech API is supported */
  isSupported: boolean
  /** List of available voices */
  voices: SpeechSynthesisVoice[]
  /** Set the preferred voice */
  setVoice: (voice: SpeechSynthesisVoice) => void
  /** Set speaking rate */
  setRate: (rate: number) => void
  /** Set pitch */
  setPitch: (pitch: number) => void
  /** Current configuration */
  options: Required<VoiceSynthesisOptions>
}

export function useVoiceSynthesis(
  initialOptions: VoiceSynthesisOptions = {}
): UseVoiceSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [options, setOptions] = useState<Required<VoiceSynthesisOptions>>({
    lang: initialOptions.lang ?? 'en-US',
    rate: initialOptions.rate ?? 1,
    pitch: initialOptions.pitch ?? 1,
    volume: initialOptions.volume ?? 1,
    voiceName: initialOptions.voiceName ?? '',
  })

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  // Load voices
  useEffect(() => {
    if (!isSupported) return

    const loadVoices = () => {
      const available = speechSynthesis.getVoices()
      setVoices(available)
    }

    loadVoices()
    speechSynthesis.addEventListener('voiceschanged', loadVoices)

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [isSupported])

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return

      // Cancel any current speech
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = options.lang
      utterance.rate = options.rate
      utterance.pitch = options.pitch
      utterance.volume = options.volume

      // Find matching voice
      if (options.voiceName) {
        const voice = voices.find((v) => v.name === options.voiceName)
        if (voice) utterance.voice = voice
      } else {
        // Try to find a voice for the current language
        const langVoice = voices.find((v) => v.lang.startsWith(options.lang.split('-')[0]))
        if (langVoice) utterance.voice = langVoice
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        setIsPaused(false)
      }
      utterance.onend = () => {
        setIsSpeaking(false)
        setIsPaused(false)
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        setIsPaused(false)
      }
      utterance.onpause = () => setIsPaused(true)
      utterance.onresume = () => setIsPaused(false)

      utteranceRef.current = utterance
      speechSynthesis.speak(utterance)
    },
    [isSupported, options, voices]
  )

  const cancel = useCallback(() => {
    if (!isSupported) return
    speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
  }, [isSupported])

  const pause = useCallback(() => {
    if (!isSupported) return
    speechSynthesis.pause()
  }, [isSupported])

  const resume = useCallback(() => {
    if (!isSupported) return
    speechSynthesis.resume()
  }, [isSupported])

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setOptions((prev) => ({ ...prev, voiceName: voice.name, lang: voice.lang }))
  }, [])

  const setRate = useCallback((rate: number) => {
    setOptions((prev) => ({ ...prev, rate: Math.max(0.1, Math.min(10, rate)) }))
  }, [])

  const setPitch = useCallback((pitch: number) => {
    setOptions((prev) => ({ ...prev, pitch: Math.max(0, Math.min(2, pitch)) }))
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (isSupported) speechSynthesis.cancel()
    }
  }, [isSupported])

  return {
    speak,
    cancel,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    setVoice,
    setRate,
    setPitch,
    options,
  }
}
