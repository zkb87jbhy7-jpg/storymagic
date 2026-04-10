'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Loader2, Mic } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type CloneStatus = 'idle' | 'processing' | 'ready' | 'failed'

interface VoiceCloneStatusProps {
  status: CloneStatus
  progress?: number // 0-100, only used when status === 'processing'
  voiceName?: string
  errorMessage?: string
  onRetry?: () => void
  className?: string
}

const statusConfig: Record<
  CloneStatus,
  {
    icon: React.ComponentType<{ className?: string }>
    colorClass: string
    bgClass: string
    borderClass: string
  }
> = {
  idle: {
    icon: Mic,
    colorClass: 'text-slate-400',
    bgClass: 'bg-slate-50 dark:bg-slate-800/50',
    borderClass: 'border-slate-200 dark:border-slate-700',
  },
  processing: {
    icon: Loader2,
    colorClass: 'text-primary-500',
    bgClass: 'bg-primary-50 dark:bg-primary-950/30',
    borderClass: 'border-primary-200 dark:border-primary-800',
  },
  ready: {
    icon: CheckCircle,
    colorClass: 'text-success-500',
    bgClass: 'bg-success-400/5 dark:bg-success-500/10',
    borderClass: 'border-success-400 dark:border-success-600',
  },
  failed: {
    icon: AlertCircle,
    colorClass: 'text-danger-500',
    bgClass: 'bg-danger-400/5 dark:bg-danger-500/10',
    borderClass: 'border-danger-400 dark:border-danger-600',
  },
}

export function VoiceCloneStatus({
  status,
  progress = 0,
  voiceName,
  errorMessage,
  onRetry,
  className,
}: VoiceCloneStatusProps) {
  const t = useTranslations('voice')
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border p-4',
        config.bgClass,
        config.borderClass,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {status === 'processing' ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Icon className={cn('h-5 w-5', config.colorClass)} />
            </motion.div>
          ) : (
            <Icon className={cn('h-5 w-5', config.colorClass)} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-slate-900 dark:text-white">
            {voiceName ? t('voiceCloneFor', { name: voiceName }) : t('voiceClone')}
          </h4>
          <p className={cn('mt-0.5 text-sm', config.colorClass)}>
            {t(`cloneStatus_${status}`)}
          </p>

          {/* Processing progress */}
          {status === 'processing' && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-primary-600 dark:text-primary-400">
                  {t('processingVoice')}
                </span>
                <span className="font-mono text-primary-600 dark:text-primary-400">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-primary-100 dark:bg-primary-900/30">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="relative h-full rounded-full bg-primary-500"
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              </div>

              {/* Processing steps */}
              <div className="mt-3 space-y-1">
                {[
                  { key: 'analyzing', threshold: 0 },
                  { key: 'extracting', threshold: 25 },
                  { key: 'training', threshold: 50 },
                  { key: 'finalizing', threshold: 85 },
                ].map((step) => (
                  <div key={step.key} className="flex items-center gap-2">
                    {progress >= step.threshold + 25 ? (
                      <CheckCircle className="h-3.5 w-3.5 text-success-500" />
                    ) : progress >= step.threshold ? (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500" />
                      </motion.div>
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border border-slate-300 dark:border-slate-600" />
                    )}
                    <span
                      className={cn(
                        'text-xs',
                        progress >= step.threshold
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400 dark:text-slate-500'
                      )}
                    >
                      {t(`cloneStep_${step.key}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error state */}
          {status === 'failed' && (
            <div className="mt-2">
              {errorMessage && (
                <p className="text-sm text-danger-600 dark:text-danger-400">{errorMessage}</p>
              )}
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className={cn(
                    'mt-2 rounded-lg px-3 py-1.5 text-sm font-medium',
                    'bg-danger-500 text-white transition-colors hover:bg-danger-600',
                    'focus:outline-none focus:ring-2 focus:ring-danger-400 focus:ring-offset-2',
                    'dark:focus:ring-offset-slate-900'
                  )}
                >
                  {t('retryClone')}
                </button>
              )}
            </div>
          )}

          {/* Ready state */}
          {status === 'ready' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-sm text-success-600 dark:text-success-400"
            >
              {t('voiceReady')}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
