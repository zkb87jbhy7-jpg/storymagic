'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface RetryWithBackoffProps {
  /** The async operation to perform. Should throw on failure. */
  operation: () => Promise<void>
  /** Maximum number of retry attempts. */
  maxRetries?: number
  /** Base delay in milliseconds (doubles each attempt). */
  baseDelayMs?: number
  /** Called when all retries are exhausted. */
  onExhausted?: () => void
  /** Render children when the operation succeeds. */
  children: React.ReactNode
}

type RetryState = 'idle' | 'running' | 'waiting' | 'success' | 'exhausted'

/**
 * Wrapper that retries an async operation with exponential backoff.
 * While retrying, it shows attempt count and a progress indicator.
 */
export function RetryWithBackoff({
  operation,
  maxRetries = 3,
  baseDelayMs = 1000,
  onExhausted,
  children,
}: RetryWithBackoffProps) {
  const t = useTranslations('retry')
  const [state, setState] = useState<RetryState>('idle')
  const [attempt, setAttempt] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const abortRef = useRef(false)

  const execute = useCallback(async () => {
    abortRef.current = false

    for (let i = 0; i <= maxRetries; i++) {
      if (abortRef.current) return

      setAttempt(i + 1)
      setState('running')

      try {
        await operation()
        setState('success')
        return
      } catch {
        if (i < maxRetries) {
          const delay = baseDelayMs * Math.pow(2, i)
          setState('waiting')
          setCountdown(Math.ceil(delay / 1000))

          // Countdown
          await new Promise<void>((resolve) => {
            let remaining = Math.ceil(delay / 1000)
            const timer = setInterval(() => {
              remaining--
              setCountdown(remaining)
              if (remaining <= 0) {
                clearInterval(timer)
                resolve()
              }
            }, 1000)
          })
        }
      }
    }

    setState('exhausted')
    onExhausted?.()
  }, [operation, maxRetries, baseDelayMs, onExhausted])

  // Auto-start on mount
  useEffect(() => {
    void execute()
    return () => {
      abortRef.current = true
    }
  }, [execute])

  if (state === 'success') {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      {/* Status indicator */}
      {state === 'running' && (
        <Loader2
          className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400"
          aria-hidden="true"
        />
      )}

      {state === 'waiting' && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
          <span className="text-lg font-bold">{countdown}</span>
        </div>
      )}

      {state === 'exhausted' && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <RefreshCw className="h-6 w-6" aria-hidden="true" />
        </div>
      )}

      {/* Status text */}
      <div>
        {(state === 'running' || state === 'waiting') && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('attempt', { current: attempt, max: maxRetries + 1 })}
          </p>
        )}

        {state === 'waiting' && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t('retryingIn', { seconds: countdown })}
          </p>
        )}

        {state === 'exhausted' && (
          <>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {t('exhausted')}
            </p>
            <button
              type="button"
              onClick={() => void execute()}
              className={cn(
                'mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2',
                'text-sm font-medium text-white transition-colors',
                'bg-primary-600 hover:bg-primary-700',
                'dark:bg-primary-500 dark:hover:bg-primary-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              )}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {t('tryAgain')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
