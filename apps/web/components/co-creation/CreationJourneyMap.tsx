'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface JourneyStep {
  id: string
  labelKey: string
  icon: React.ReactNode
  value?: string
  isCompleted: boolean
  isCurrent: boolean
}

interface CreationJourneyMapProps {
  steps: JourneyStep[]
  className?: string
}

export function CreationJourneyMap({ steps, className }: CreationJourneyMapProps) {
  const t = useTranslations('coCreation')

  return (
    <div className={cn('relative', className)}>
      {/* Mobile: horizontal scrollable */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:gap-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex shrink-0 items-center gap-2">
            {/* Step node */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                  step.isCompleted
                    ? 'border-success-400 bg-success-400/10 dark:border-success-500 dark:bg-success-500/10'
                    : step.isCurrent
                      ? 'border-primary-500 bg-primary-50 shadow-md dark:border-primary-400 dark:bg-primary-950/30'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800'
                )}
              >
                {step.isCompleted ? (
                  <Check className="h-5 w-5 text-success-500" />
                ) : step.isCurrent ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Sparkles className="h-5 w-5 text-primary-500 dark:text-primary-400" />
                  </motion.div>
                ) : (
                  <span className="text-lg">{step.icon}</span>
                )}
              </div>

              <span
                className={cn(
                  'max-w-[64px] truncate text-center text-[10px] font-medium leading-tight',
                  step.isCompleted
                    ? 'text-success-600 dark:text-success-400'
                    : step.isCurrent
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-slate-400 dark:text-slate-500'
                )}
              >
                {t(step.labelKey)}
              </span>

              {/* Selected value badge */}
              {step.value && step.isCompleted && (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-[80px] truncate rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                >
                  {step.value}
                </motion.span>
              )}
            </motion.div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.05 }}
                className={cn(
                  'h-0.5 w-6 origin-start sm:w-10',
                  step.isCompleted
                    ? 'bg-success-400 dark:bg-success-500'
                    : 'bg-slate-200 dark:bg-slate-600'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
