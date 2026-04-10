'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useBookGenerationSSE } from '@/hooks/useBookGenerationSSE'
import { MagicPhaseTyping } from './MagicPhaseTyping'
import { MagicPhaseTransform } from './MagicPhaseTransform'
import { MagicPhasePainting } from './MagicPhasePainting'
import { MagicPhaseAssembly } from './MagicPhaseAssembly'
import { MagicPhaseReveal } from './MagicPhaseReveal'
import { EarlyPeek } from './EarlyPeek'
import { FactTicker } from './FactTicker'
import { SocialProofCounter } from './SocialProofCounter'
import { GenerationProgressTracker } from './GenerationProgressTracker'

interface MagicMomentExperienceProps {
  bookId: string
  onBookReady?: (bookId: string) => void
}

function getBackgroundGradient(progress: number): string {
  if (progress < 5)
    return 'from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-950 dark:via-amber-950/30 dark:to-slate-950'
  if (progress < 20)
    return 'from-purple-50 via-pink-50 to-rose-50 dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950'
  if (progress < 55)
    return 'from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-950'
  if (progress < 95)
    return 'from-emerald-50 via-green-50 to-lime-50 dark:from-slate-950 dark:via-emerald-950/30 dark:to-slate-950'
  return 'from-primary-50 via-violet-50 to-fuchsia-50 dark:from-slate-950 dark:via-primary-950/30 dark:to-slate-950'
}

export function MagicMomentExperience({
  bookId,
  onBookReady,
}: MagicMomentExperienceProps) {
  const t = useTranslations('magicMoment')

  const { progress, phase, isComplete, error, imageUrl } =
    useBookGenerationSSE({ bookId })

  const [showEarlyPeek, setShowEarlyPeek] = useState(false)
  const [earlyPeekDismissed, setEarlyPeekDismissed] = useState(false)

  // Show early peek at ~30%
  const shouldShowPeek = progress >= 30 && !!imageUrl && !earlyPeekDismissed
  if (shouldShowPeek && !showEarlyPeek) {
    setShowEarlyPeek(true)
  }

  const handleDismissEarlyPeek = useCallback(() => {
    setShowEarlyPeek(false)
    setEarlyPeekDismissed(true)
  }, [])

  const handleOpenBook = useCallback(() => {
    onBookReady?.(bookId)
  }, [bookId, onBookReady])

  const bgGradient = useMemo(() => getBackgroundGradient(progress), [progress])

  const renderPhase = () => {
    if (isComplete || progress >= 95) {
      return <MagicPhaseReveal onOpenBook={handleOpenBook} />
    }
    if (progress >= 55) {
      return <MagicPhaseAssembly progress={progress} />
    }
    if (progress >= 20) {
      return <MagicPhasePainting progress={progress} />
    }
    if (progress >= 5) {
      return <MagicPhaseTransform progress={progress} />
    }
    return <MagicPhaseTyping progress={progress} />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium',
            'bg-primary-600 text-white hover:bg-primary-700',
            'dark:bg-primary-500 dark:hover:bg-primary-600'
          )}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex min-h-[80vh] flex-col items-center justify-center bg-gradient-to-br transition-all duration-1000',
        bgGradient
      )}
    >
      {/* Early Peek Overlay */}
      <EarlyPeek
        imageUrl={imageUrl ?? null}
        isVisible={showEarlyPeek}
        onDismiss={handleDismissEarlyPeek}
      />

      {/* Main phase content */}
      <div className="w-full max-w-2xl px-4 py-12">
        <div className="mb-8">{renderPhase()}</div>

        {/* Progress bar */}
        {!isComplete && (
          <div className="mb-6">
            <GenerationProgressTracker
              progress={progress}
              phase={phase}
            />
          </div>
        )}

        {/* Notify me button (shown when not complete) */}
        {!isComplete && (
          <div className="mb-4 flex justify-center">
            <button
              type="button"
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <Bell className="h-4 w-4" />
              {t('notifyMe')}
            </button>
          </div>
        )}

        {/* Fact ticker + social proof */}
        <div className="flex flex-col gap-2">
          <FactTicker />
          <SocialProofCounter />
        </div>
      </div>
    </div>
  )
}
