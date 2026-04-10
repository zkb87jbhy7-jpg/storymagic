'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Volume2, VolumeX, Waves, Mic } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type QualityLevel = 'good' | 'fair' | 'poor'

export interface RecordingQuality {
  backgroundNoise: QualityLevel
  volumeConsistency: QualityLevel
  clarity: QualityLevel
  overallScore: number // 0-100
}

interface RecordingQualityFeedbackProps {
  quality: RecordingQuality | null
  isRecording?: boolean
  className?: string
}

const levelConfig: Record<QualityLevel, { color: string; bgColor: string; darkBgColor: string }> = {
  good: {
    color: 'text-success-500',
    bgColor: 'bg-success-400/20',
    darkBgColor: 'dark:bg-success-500/20',
  },
  fair: {
    color: 'text-warning-500',
    bgColor: 'bg-warning-400/20',
    darkBgColor: 'dark:bg-warning-500/20',
  },
  poor: {
    color: 'text-danger-500',
    bgColor: 'bg-danger-400/20',
    darkBgColor: 'dark:bg-danger-500/20',
  },
}

function QualityIndicator({
  label,
  level,
  icon: Icon,
}: {
  label: string
  level: QualityLevel
  icon: React.ComponentType<{ className?: string }>
}) {
  const t = useTranslations('voice')
  const config = levelConfig[level]

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          config.bgColor,
          config.darkBgColor
        )}
      >
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        <p className={cn('text-xs font-semibold', config.color)}>{t(`quality_${level}`)}</p>
      </div>
      <div className="flex gap-0.5">
        {(['poor', 'fair', 'good'] as const).map((l, i) => (
          <motion.div
            key={l}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              'h-2 w-5 rounded-full',
              i === 0
                ? level !== 'poor'
                  ? 'bg-success-400'
                  : 'bg-danger-400'
                : i === 1
                  ? level === 'good'
                    ? 'bg-success-400'
                    : level === 'fair'
                      ? 'bg-warning-400'
                      : 'bg-slate-200 dark:bg-slate-600'
                  : level === 'good'
                    ? 'bg-success-400'
                    : 'bg-slate-200 dark:bg-slate-600'
            )}
          />
        ))}
      </div>
    </div>
  )
}

export function RecordingQualityFeedback({
  quality,
  isRecording = false,
  className,
}: RecordingQualityFeedbackProps) {
  const t = useTranslations('voice')

  if (!quality && !isRecording) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800',
        className
      )}
    >
      <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
        {t('qualityCheck')}
      </h4>

      {isRecording && !quality && (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Mic className="h-4 w-4 text-danger-500" />
          </motion.div>
          <span>{t('analyzingAudio')}</span>
        </div>
      )}

      {quality && (
        <div className="space-y-3">
          <QualityIndicator
            label={t('backgroundNoise')}
            level={quality.backgroundNoise}
            icon={quality.backgroundNoise === 'poor' ? VolumeX : Volume2}
          />
          <QualityIndicator
            label={t('volumeConsistency')}
            level={quality.volumeConsistency}
            icon={Waves}
          />
          <QualityIndicator
            label={t('clarity')}
            level={quality.clarity}
            icon={Mic}
          />

          {/* Overall score */}
          <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {t('overallScore')}
              </span>
              <span
                className={cn(
                  'font-bold',
                  quality.overallScore >= 70
                    ? 'text-success-500'
                    : quality.overallScore >= 40
                      ? 'text-warning-500'
                      : 'text-danger-500'
                )}
              >
                {quality.overallScore}%
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${quality.overallScore}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  quality.overallScore >= 70
                    ? 'bg-success-400'
                    : quality.overallScore >= 40
                      ? 'bg-warning-400'
                      : 'bg-danger-400'
                )}
              />
            </div>

            {quality.overallScore < 70 && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {t('qualityTip')}
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
