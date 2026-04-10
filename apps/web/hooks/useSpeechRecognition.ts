'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

// Extend Window for webkitSpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onstart: (() => void) | null
  onend: (() => void) | null
  onspeechstart: (() => void) | null
  onspeechend: (() => void) | null
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

export interface UseSpeechRecognitionOptions {
  /** BCP-47 language code */
  lang?: string
  /** Keep recognizing until manually stopped */
  continuous?: boolean
  /** Show interim results as they come in */
  interimResults?: boolean
  /** Called with each result (interim or final) */
  onResult?: (transcript: string, isFinal: boolean) => void
  /** Called on error */
  onError?: (error: string) => void
}

export interface UseSpeechRecognitionReturn {
  /** Start listening */
  startListening: () => void
  /** Stop listening */
  stopListening: () => void
  /** Current transcript */
  transcript: string
  /** Interim (partial) transcript */
  interimTranscript: string
  /** Whether we are currently listening */
  isListening: boolean
  /** Whether the API is supported */
  isSupported: boolean
  /** Whether the user's speech is being detected */
  isSpeechDetected: boolean
  /** Reset the transcript */
  reset: () => void
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    lang = 'en-US',
    continuous = false,
    interimResults = true,
    onResult,
    onError,
  } = options

  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeechDetected, setIsSpeechDetected] = useState(false)

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)

  // Keep refs updated
  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const createRecognition = useCallback(() => {
    if (!isSupported) return null

    const SpeechRecognitionApi =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionApi) return null

    const recognition = new SpeechRecognitionApi()
    recognition.lang = lang
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.maxAlternatives = 1

    return recognition
  }, [isSupported, lang, continuous, interimResults])

  const startListening = useCallback(() => {
    if (!isSupported) return

    // Stop existing instance
    if (recognitionRef.current) {
      recognitionRef.current.abort()
    }

    const recognition = createRecognition()
    if (!recognition) return

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = ''
      let interimText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0]?.transcript ?? ''

        if (result.isFinal) {
          finalText += text
        } else {
          interimText += text
        }
      }

      if (finalText) {
        setTranscript((prev) => (prev ? `${prev} ${finalText}` : finalText))
        setInterimTranscript('')
        onResultRef.current?.(finalText, true)
      }

      if (interimText) {
        setInterimTranscript(interimText)
        onResultRef.current?.(interimText, false)
      }
    }

    recognition.onspeechstart = () => {
      setIsSpeechDetected(true)
    }

    recognition.onspeechend = () => {
      setIsSpeechDetected(false)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'aborted') {
        onErrorRef.current?.(event.error)
      }
      setIsListening(false)
      setIsSpeechDetected(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      setIsSpeechDetected(false)

      // Restart if continuous and wasn't manually stopped
      if (continuous && recognitionRef.current === recognition) {
        try {
          recognition.start()
        } catch {
          // Already started or other error
        }
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch {
      // Handle start error silently
    }
  }, [isSupported, createRecognition, continuous])

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current
    if (recognition) {
      recognitionRef.current = null
      recognition.stop()
    }
    setIsListening(false)
    setIsSpeechDetected(false)
    setInterimTranscript('')
  }, [])

  const reset = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
    }
  }, [])

  return {
    startListening,
    stopListening,
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    isSpeechDetected,
    reset,
  }
}
