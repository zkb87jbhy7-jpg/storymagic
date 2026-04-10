'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Keyboard, Send } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

type InputMode = 'voice' | 'text'

interface DreamRecorderProps {
  onSubmit: (description: string) => void
  className?: string
}

export function DreamRecorder({ onSubmit, className }: DreamRecorderProps) {
  const t = useTranslations('dreams')

  const [mode, setMode] = useState<InputMode>('text')
  const [textInput, setTextInput] = useState('')

  const {
    startListening,
    stopListening,
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    reset: resetTranscript,
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    lang: 'en-US',
  })

  const handleToggleVoice = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  const handleSubmit = useCallback(() => {
    const description = mode === 'voice' ? transcript : textInput
    if (description.trim()) {
      onSubmit(description.trim())
      setTextInput('')
      resetTranscript()
    }
  }, [mode, transcript, textInput, onSubmit, resetTranscript])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const currentText = mode === 'voice' ? `${transcript} ${interimTranscript}`.trim() : textInput

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800',
        className
      )}
    >
      {/* Mode toggle */}
      <div className="flex border-b border-slate-100 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setMode('text')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors',
            mode === 'text'
              ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          <Keyboard className="h-4 w-4" />
          {t('typeMode')}
        </button>
        {isSupported && (
          <button
            type="button"
            onClick={() => setMode('voice')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors',
              mode === 'voice'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <Mic className="h-4 w-4" />
            {t('voiceMode')}
          </button>
        )}
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {mode === 'text' ? (
            <motion.div
              key="text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('dreamPlaceholder')}
                rows={4}
                className={cn(
                  'w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm',
                  'text-slate-900 placeholder:text-slate-400',
                  'focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200',
                  'dark:border-slate-600 dark:bg-slate-700/50 dark:text-white dark:placeholder:text-slate-500',
                  'dark:focus:border-primary-500 dark:focus:bg-slate-700 dark:focus:ring-primary-800'
                )}
              />
            </motion.div>
          ) : (
            <motion.div
              key="voice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              {/* Voice transcript display */}
              <div
                className={cn(
                  'min-h-[80px] w-full rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-700/50',
                  transcript || interimTranscript
                    ? 'text-slate-700 dark:text-slate-200'
                    : 'text-slate-400 dark:text-slate-500'
                )}
              >
                {transcript || interimTranscript || t('voicePrompt')}
                {interimTranscript && (
                  <span className="text-slate-400 dark:text-slate-500">
                    {' '}
                    {interimTranscript}
                  </span>
                )}
              </div>

              {/* Mic button */}
              <motion.button
                type="button"
                onClick={handleToggleVoice}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg',
                  isListening
                    ? 'bg-danger-500 text-white'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                )}
              >
                {/* Listening pulse */}
                {isListening && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-danger-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                {isListening ? (
                  <MicOff className="relative z-10 h-7 w-7" />
                ) : (
                  <Mic className="relative z-10 h-7 w-7" />
                )}
              </motion.button>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isListening ? t('listening') : t('tapToRecord')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={!currentText.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white',
            'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md',
            'transition-opacity hover:shadow-lg disabled:opacity-50',
            'focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2',
            'dark:focus:ring-offset-slate-800'
          )}
        >
          <Send className="h-4 w-4" />
          {t('saveDream')}
        </motion.button>
      </div>
    </div>
  )
}
