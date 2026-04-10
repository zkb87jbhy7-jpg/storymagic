'use client'

import { useState, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Loader2, Wand2, Rocket, TreePine, Castle, Cloud, Cat, Dog, Bird, Star, Swords, Heart, BookOpen, Waves, Mountain, Palmtree, Moon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SparkyMascot } from './SparkyMascot'
import { SparkyChatBubble } from './SparkyChatBubble'
import { ChoiceGrid, type ChoiceOption } from './ChoiceGrid'
import { CreationJourneyMap, type JourneyStep } from './CreationJourneyMap'
import { VoiceInteractionProvider } from './VoiceInteractionProvider'

type WizardStep = 'setting' | 'companion' | 'adventure' | 'lesson' | 'generating'

interface CoCreationWizardProps {
  childName: string
  childAge: number
  onComplete: (choices: CoCreationChoices) => void
  className?: string
}

export interface CoCreationChoices {
  setting: string
  companion: string
  adventure: string
  lesson: string
  customInput?: string
}

const SETTING_OPTIONS: ChoiceOption[] = [
  { id: 'enchanted_forest', icon: <TreePine className="h-8 w-8 text-green-500" />, labelKey: 'setting_forest', colorClass: 'bg-green-50 dark:bg-green-950/20' },
  { id: 'magical_castle', icon: <Castle className="h-8 w-8 text-purple-500" />, labelKey: 'setting_castle', colorClass: 'bg-purple-50 dark:bg-purple-950/20' },
  { id: 'outer_space', icon: <Rocket className="h-8 w-8 text-blue-500" />, labelKey: 'setting_space', colorClass: 'bg-blue-50 dark:bg-blue-950/20' },
  { id: 'underwater', icon: <Waves className="h-8 w-8 text-cyan-500" />, labelKey: 'setting_ocean', colorClass: 'bg-cyan-50 dark:bg-cyan-950/20' },
]

const COMPANION_OPTIONS: ChoiceOption[] = [
  { id: 'dragon', icon: <Star className="h-8 w-8 text-orange-500" />, labelKey: 'companion_dragon', colorClass: 'bg-orange-50 dark:bg-orange-950/20' },
  { id: 'talking_cat', icon: <Cat className="h-8 w-8 text-amber-500" />, labelKey: 'companion_cat', colorClass: 'bg-amber-50 dark:bg-amber-950/20' },
  { id: 'magic_dog', icon: <Dog className="h-8 w-8 text-brown-500" />, labelKey: 'companion_dog', colorClass: 'bg-yellow-50 dark:bg-yellow-950/20' },
  { id: 'wise_bird', icon: <Bird className="h-8 w-8 text-sky-500" />, labelKey: 'companion_bird', colorClass: 'bg-sky-50 dark:bg-sky-950/20' },
]

const ADVENTURE_OPTIONS: ChoiceOption[] = [
  { id: 'treasure_hunt', icon: <Mountain className="h-8 w-8 text-amber-600" />, labelKey: 'adventure_treasure', colorClass: 'bg-amber-50 dark:bg-amber-950/20' },
  { id: 'rescue_mission', icon: <Swords className="h-8 w-8 text-red-500" />, labelKey: 'adventure_rescue', colorClass: 'bg-red-50 dark:bg-red-950/20' },
  { id: 'exploring', icon: <Palmtree className="h-8 w-8 text-emerald-500" />, labelKey: 'adventure_exploring', colorClass: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { id: 'mystery', icon: <Moon className="h-8 w-8 text-indigo-500" />, labelKey: 'adventure_mystery', colorClass: 'bg-indigo-50 dark:bg-indigo-950/20' },
]

const LESSON_OPTIONS: ChoiceOption[] = [
  { id: 'courage', icon: <Swords className="h-8 w-8 text-red-500" />, labelKey: 'lesson_courage', colorClass: 'bg-red-50 dark:bg-red-950/20' },
  { id: 'kindness', icon: <Heart className="h-8 w-8 text-pink-500" />, labelKey: 'lesson_kindness', colorClass: 'bg-pink-50 dark:bg-pink-950/20' },
  { id: 'teamwork', icon: <Cloud className="h-8 w-8 text-blue-500" />, labelKey: 'lesson_teamwork', colorClass: 'bg-blue-50 dark:bg-blue-950/20' },
  { id: 'curiosity', icon: <BookOpen className="h-8 w-8 text-violet-500" />, labelKey: 'lesson_curiosity', colorClass: 'bg-violet-50 dark:bg-violet-950/20' },
]

const STEP_ORDER: WizardStep[] = ['setting', 'companion', 'adventure', 'lesson']

const STEP_OPTIONS: Record<string, ChoiceOption[]> = {
  setting: SETTING_OPTIONS,
  companion: COMPANION_OPTIONS,
  adventure: ADVENTURE_OPTIONS,
  lesson: LESSON_OPTIONS,
}

export function CoCreationWizard({ childName, childAge, onComplete, className }: CoCreationWizardProps) {
  const t = useTranslations('coCreation')

  const [currentStep, setCurrentStep] = useState<WizardStep>('setting')
  const [choices, setChoices] = useState<Record<string, string>>({})
  const [customMode, setCustomMode] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const currentStepIndex = STEP_ORDER.indexOf(currentStep)

  const sparkyMessages: Record<WizardStep, string> = useMemo(
    () => ({
      setting: t('sparky_setting', { name: childName }),
      companion: t('sparky_companion', { name: childName }),
      adventure: t('sparky_adventure'),
      lesson: t('sparky_lesson'),
      generating: t('sparky_generating', { name: childName }),
    }),
    [t, childName]
  )

  const sparkyMood = useMemo(() => {
    if (isGenerating) return 'excited' as const
    if (currentStep === 'lesson') return 'thinking' as const
    if (currentStepIndex > 0) return 'happy' as const
    return 'waving' as const
  }, [isGenerating, currentStep, currentStepIndex])

  const journeySteps: JourneyStep[] = useMemo(
    () =>
      STEP_ORDER.map((step, index) => ({
        id: step,
        labelKey: `step_${step}`,
        icon: ['🌍', '🐾', '⚔️', '💡'][index],
        value: choices[step]
          ? t(
              STEP_OPTIONS[step]?.find((o) => o.id === choices[step])?.labelKey ??
                choices[step]
            )
          : undefined,
        isCompleted: !!choices[step],
        isCurrent: currentStep === step,
      })),
    [choices, currentStep, t]
  )

  const handleSelect = useCallback(
    (id: string) => {
      setChoices((prev) => ({ ...prev, [currentStep]: id }))
      setCustomMode(false)

      // Auto-advance after brief delay
      setTimeout(() => {
        const nextIndex = currentStepIndex + 1
        if (nextIndex < STEP_ORDER.length) {
          setCurrentStep(STEP_ORDER[nextIndex])
        } else {
          // All choices made, begin generation
          setIsGenerating(true)
          const finalChoices: CoCreationChoices = {
            setting: choices.setting || id,
            companion: choices.companion || id,
            adventure: choices.adventure || id,
            lesson: choices.lesson || id,
          }
          // Ensure current step choice is set
          finalChoices[currentStep as keyof CoCreationChoices] = id
          onComplete(finalChoices)
        }
      }, 400)
    },
    [currentStep, currentStepIndex, choices, onComplete]
  )

  const handleBack = useCallback(() => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEP_ORDER[prevIndex])
      setCustomMode(false)
      setCustomInput('')
    }
  }, [currentStepIndex])

  const handleCustomSelect = useCallback(() => {
    setCustomMode(true)
  }, [])

  const handleCustomSubmit = useCallback(() => {
    if (customInput.trim()) {
      handleSelect(customInput.trim())
      setCustomInput('')
    }
  }, [customInput, handleSelect])

  const handleVoiceResult = useCallback(
    (transcript: string, isFinal: boolean) => {
      if (isFinal && customMode) {
        setCustomInput(transcript)
      }
    },
    [customMode]
  )

  if (isGenerating) {
    return (
      <div className={cn('flex flex-col items-center gap-6 py-12', className)}>
        <SparkyMascot mood="excited" size="lg" />
        <SparkyChatBubble message={sparkyMessages.generating} position="bottom" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Wand2 className="h-8 w-8 text-primary-500" />
        </motion.div>
        <p className="text-center text-lg font-medium text-slate-700 dark:text-slate-300">
          {t('creatingStory')}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Journey map */}
      <CreationJourneyMap steps={journeySteps} />

      {/* Sparky with chat bubble */}
      <div className="flex items-start gap-3">
        <SparkyMascot mood={sparkyMood} size="md" />
        <SparkyChatBubble
          message={sparkyMessages[currentStep]}
          position="right"
        />
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
            {t(`step_${currentStep}_title`)}
          </h2>

          <VoiceInteractionProvider
            onResult={handleVoiceResult}
            lang={childAge < 6 ? 'en-US' : undefined}
          >
            {customMode ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                  placeholder={t('customPlaceholder')}
                  className={cn(
                    'w-full rounded-xl border-2 border-primary-300 bg-white px-4 py-3 text-lg',
                    'text-slate-900 placeholder:text-slate-400',
                    'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200',
                    'dark:border-primary-600 dark:bg-slate-800 dark:text-white',
                    'dark:focus:border-primary-400 dark:focus:ring-primary-800'
                  )}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomMode(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                  >
                    {t('backToChoices')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    disabled={!customInput.trim()}
                    className={cn(
                      'flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white',
                      'bg-primary-500 transition-colors hover:bg-primary-600 disabled:opacity-50',
                      'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2'
                    )}
                  >
                    {t('confirmChoice')}
                  </button>
                </div>
              </div>
            ) : (
              <ChoiceGrid
                options={STEP_OPTIONS[currentStep] ?? []}
                selectedId={choices[currentStep] ?? null}
                onSelect={handleSelect}
                showCustomOption
                onCustomSelect={handleCustomSelect}
                isCustomSelected={false}
              />
            )}
          </VoiceInteractionProvider>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {currentStepIndex > 0 && (
        <motion.button
          type="button"
          onClick={handleBack}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            'flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors',
            'hover:text-primary-500 dark:text-slate-400 dark:hover:text-primary-400'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          {t('goBack')}
        </motion.button>
      )}
    </div>
  )
}
