'use client'

import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useBookGeneration, type WizardStep } from '@/hooks/useBookGeneration'
import { ChildSelector } from './ChildSelector'
import { PromptBuilder } from './PromptBuilder'
import { StyleSelector } from './StyleSelector'
import { MoodSelector } from './MoodSelector'
import { OptionsPanel } from './OptionsPanel'
import { StoryPreview } from './StoryPreview'

const STEP_KEYS: { step: WizardStep; labelKey: string }[] = [
  { step: 1, labelKey: 'selectChild' },
  { step: 2, labelKey: 'writePrompt' },
  { step: 3, labelKey: 'chooseStyle' },
  { step: 4, labelKey: 'chooseMood' },
  { step: 5, labelKey: 'options' },
  { step: 6, labelKey: 'preview' },
]

// Mock children data (would come from API in production)
const mockChildren = [
  { id: '1', name: 'Mika', age: 5, avatarUrl: null },
  { id: '2', name: 'Noa', age: 8, avatarUrl: null },
]

export function CreationWizard() {
  const t = useTranslations('bookCreation')
  const tCommon = useTranslations('common')
  const {
    step,
    setStep,
    nextStep,
    prevStep,
    wizardData,
    updateData,
    submit,
    isGenerating,
  } = useBookGeneration()

  const canGoNext = (() => {
    switch (step) {
      case 1:
        return !!wizardData.childId
      case 2:
        return wizardData.prompt.trim().length > 10
      case 3:
        return !!wizardData.style
      case 4:
        return !!wizardData.mood
      case 5:
        return true
      case 6:
        return true
      default:
        return false
    }
  })()

  const handleSubmit = async () => {
    try {
      await submit()
    } catch {
      // Error handled in hook
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <ChildSelector
            children={mockChildren}
            selectedId={wizardData.childId}
            onSelect={(id, name, age) =>
              updateData({ childId: id, childName: name, childAge: age })
            }
          />
        )
      case 2:
        return (
          <PromptBuilder
            value={wizardData.prompt}
            onChange={(prompt) => updateData({ prompt })}
            childName={wizardData.childName}
          />
        )
      case 3:
        return (
          <StyleSelector
            selected={wizardData.style}
            onSelect={(style) => updateData({ style })}
          />
        )
      case 4:
        return (
          <MoodSelector
            selected={wizardData.mood}
            onSelect={(mood) => updateData({ mood })}
          />
        )
      case 5:
        return (
          <OptionsPanel
            language={wizardData.language}
            pageCount={wizardData.pageCount}
            rhyming={wizardData.rhyming}
            bilingual={wizardData.bilingual}
            onLanguageChange={(language) => updateData({ language })}
            onPageCountChange={(pageCount) => updateData({ pageCount })}
            onRhymingChange={(rhyming) => updateData({ rhyming })}
            onBilingualChange={(bilingual) => updateData({ bilingual })}
          />
        )
      case 6:
        return (
          <StoryPreview
            pages={[
              { pageNumber: 1, text: 'Your story preview will appear here after generation.' },
            ]}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      {/* Title */}
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        {t('title')}
      </h1>

      {/* Step indicator */}
      <nav aria-label="Wizard steps" className="flex items-center justify-center">
        {STEP_KEYS.map(({ step: s, labelKey }, index) => (
          <div key={s} className="flex items-center">
            {/* Step circle */}
            <button
              type="button"
              onClick={() => s < step && setStep(s)}
              disabled={s > step}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                s === step
                  ? 'bg-primary-600 text-white dark:bg-primary-500'
                  : s < step
                    ? 'cursor-pointer bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300'
                    : 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
              )}
              aria-current={s === step ? 'step' : undefined}
              title={t(labelKey)}
            >
              {s}
            </button>

            {/* Connecting line */}
            {index < STEP_KEYS.length - 1 && (
              <div
                className={cn(
                  'mx-1 h-0.5 w-6 sm:mx-2 sm:w-10',
                  s < step
                    ? 'bg-primary-400 dark:bg-primary-600'
                    : 'bg-slate-200 dark:bg-slate-700'
                )}
              />
            )}
          </div>
        ))}
      </nav>

      {/* Step content */}
      <div className="min-h-[300px]">{renderStepContent()}</div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 1}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
            'text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40',
            'dark:text-slate-300 dark:hover:bg-slate-800'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          {tCommon('back')}
        </button>

        {step < 6 ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={!canGoNext}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors',
              'bg-primary-600 text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40',
              'dark:bg-primary-500 dark:hover:bg-primary-600'
            )}
          >
            {tCommon('next')}
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isGenerating}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors',
              'bg-primary-600 text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40',
              'dark:bg-primary-500 dark:hover:bg-primary-600'
            )}
          >
            {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
            {isGenerating ? t('generating') : tCommon('create')}
          </button>
        )}
      </div>
    </div>
  )
}
