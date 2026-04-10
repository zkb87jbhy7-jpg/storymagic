'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { QualityScores } from '@/lib/face-detection/quality-scorer'

interface FaceQualityFeedbackProps {
  quality: QualityScores
  className?: string
}

type BadgeVariant = 'good' | 'warning' | 'error'

interface Badge {
  variant: BadgeVariant
  labelKey: string
}

const variantStyles: Record<BadgeVariant, string> = {
  good: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  warning:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

const VariantIcon: Record<BadgeVariant, typeof CheckCircle> = {
  good: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

export function FaceQualityFeedback({
  quality,
  className,
}: FaceQualityFeedbackProps) {
  const t = useTranslations('children')

  const badges: Badge[] = []

  if (quality.faceDetected) {
    badges.push({ variant: 'good', labelKey: 'faceDetected' })
  } else {
    badges.push({ variant: 'error', labelKey: 'noFaceDetected' })
  }

  if (quality.faceDetected && !quality.faceLargeEnough) {
    badges.push({ variant: 'warning', labelKey: 'faceTooSmall' })
  }

  if (quality.faceDetected && !quality.goodLighting) {
    badges.push({ variant: 'warning', labelKey: 'poorLighting' })
  }

  if (quality.overallGood) {
    badges.push({ variant: 'good', labelKey: 'goodPhoto' })
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {badges.map((badge) => {
        const Icon = VariantIcon[badge.variant]
        return (
          <span
            key={badge.labelKey}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
              variantStyles[badge.variant],
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {t(badge.labelKey)}
          </span>
        )
      })}
    </div>
  )
}
