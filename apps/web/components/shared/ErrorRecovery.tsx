'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { RefreshCw, WifiOff, Sparkles, CreditCard, AlertCircle, Clock } from 'lucide-react'
import {
  type AppError,
  NetworkError,
  AIGenerationError,
  PaymentError,
  RateLimitError,
  toAppError,
} from '@/lib/errors/error-types'
import type { LucideIcon } from 'lucide-react'

// ---- Error config by type ------------------------------------------------

interface ErrorConfig {
  icon: LucideIcon
  illustrationColor: string
  messageKey: string
  descriptionKey: string
}

function getErrorConfig(error: AppError): ErrorConfig {
  if (error instanceof NetworkError) {
    return {
      icon: WifiOff,
      illustrationColor: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
      messageKey: 'networkError',
      descriptionKey: 'networkErrorDesc',
    }
  }
  if (error instanceof AIGenerationError) {
    return {
      icon: Sparkles,
      illustrationColor: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
      messageKey: 'aiError',
      descriptionKey: 'aiErrorDesc',
    }
  }
  if (error instanceof PaymentError) {
    return {
      icon: CreditCard,
      illustrationColor: 'text-red-500 bg-red-50 dark:bg-red-900/20',
      messageKey: 'paymentError',
      descriptionKey: 'paymentErrorDesc',
    }
  }
  if (error instanceof RateLimitError) {
    return {
      icon: Clock,
      illustrationColor: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
      messageKey: 'rateLimitError',
      descriptionKey: 'rateLimitErrorDesc',
    }
  }
  return {
    icon: AlertCircle,
    illustrationColor: 'text-slate-500 bg-slate-50 dark:bg-slate-800',
    messageKey: 'genericError',
    descriptionKey: 'genericErrorDesc',
  }
}

// ---- Props ---------------------------------------------------------------

interface ErrorRecoveryProps {
  error: unknown
  onRetry?: () => void
  className?: string
}

// ---- Component -----------------------------------------------------------

export function ErrorRecovery({ error, onRetry, className }: ErrorRecoveryProps) {
  const t = useTranslations('errors')

  const appError = toAppError(error)
  const config = getErrorConfig(appError)
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-4 py-12 text-center',
        className,
      )}
      role="alert"
    >
      {/* Child-friendly illustration circle */}
      <div
        className={cn(
          'mb-6 flex h-24 w-24 items-center justify-center rounded-full',
          config.illustrationColor,
        )}
      >
        <Icon className="h-12 w-12" aria-hidden="true" />
      </div>

      {/* Error message */}
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        {t(config.messageKey)}
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {t(config.descriptionKey)}
      </p>

      {/* Retry button (only for retryable errors) */}
      {appError.isRetryable && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            'mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5',
            'text-sm font-medium text-white transition-colors',
            'bg-primary-600 hover:bg-primary-700',
            'dark:bg-primary-500 dark:hover:bg-primary-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-900',
          )}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {t('retry')}
        </button>
      )}

      {/* Error code for support */}
      <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
        {t('errorCode')}: {appError.code}
      </p>
    </div>
  )
}
