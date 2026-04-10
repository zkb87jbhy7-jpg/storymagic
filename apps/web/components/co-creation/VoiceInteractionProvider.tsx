'use client'

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

interface VoiceInteractionProviderProps {
  /** Called with speech result */
  onResult: (transcript: string, isFinal: boolean) => void
  /** Whether the mic is actively listening */
  isListening?: boolean
  /** Language for recognition */
  lang?: string
  /** Children to wrap */
  children?: React.ReactNode
  className?: string
}

export function VoiceInteractionProvider({
  onResult,
  lang = 'en-US',
  children,
  className,
}: VoiceInteractionProviderProps) {
  const t = useTranslations('coCreation')

  const {
    startListening,
    stopListening,
    isListening,
    isSupported,
    isSpeechDetected,
    interimTranscript,
  } = useSpeechRecognition({
    lang,
    continuous: false,
    interimResults: true,
    onResult,
  })

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  if (!isSupported) return <>{children}</>

  return (
    <div className={cn('relative', className)}>
      {children}

      {/* Floating mic button */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <motion.button
          type="button"
          onClick={toggleListening}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors',
            'focus:outline-none focus:ring-4',
            isListening
              ? 'bg-danger-500 text-white focus:ring-danger-300/50'
              : 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-300/50'
          )}
          aria-label={isListening ? t('stopListening') : t('startListening')}
        >
          {/* Pulsing ring when listening */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.8, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-danger-400"
              />
            )}
          </AnimatePresence>

          {/* Speech detection ring */}
          {isSpeechDetected && (
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-white/50"
            />
          )}

          {isListening ? (
            <MicOff className="relative z-10 h-6 w-6" />
          ) : (
            <Mic className="relative z-10 h-6 w-6" />
          )}
        </motion.button>

        <AnimatePresence>
          {isListening && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-center text-xs font-medium text-danger-500"
            >
              {isSpeechDetected ? t('hearing') : t('listeningHint')}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Interim transcript */}
        <AnimatePresence>
          {interimTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm italic text-slate-600 dark:bg-slate-700 dark:text-slate-300"
            >
              {interimTranscript}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
