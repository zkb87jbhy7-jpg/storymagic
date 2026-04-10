'use client'

import { useState, useCallback } from 'react'

export type IllustrationStyle =
  | 'watercolor'
  | 'comic_book'
  | 'pixar_3d'
  | 'retro_vintage'
  | 'minimalist'
  | 'oil_painting'
  | 'fantasy'
  | 'manga'
  | 'classic_storybook'
  | 'whimsical'

export type MoodType = 'happy' | 'exciting' | 'sad' | 'scared' | 'angry' | 'calm'

export interface WizardData {
  childId: string | null
  childName: string
  childAge: number
  prompt: string
  style: IllustrationStyle | null
  mood: MoodType | null
  language: 'he' | 'en'
  pageCount: number
  rhyming: boolean
  bilingual: boolean
}

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6

const initialWizardData: WizardData = {
  childId: null,
  childName: '',
  childAge: 5,
  prompt: '',
  style: null,
  mood: null,
  language: 'he',
  pageCount: 12,
  rhyming: false,
  bilingual: false,
}

export function useBookGeneration() {
  const [step, setStep] = useState<WizardStep>(1)
  const [wizardData, setWizardData] = useState<WizardData>(initialWizardData)
  const [isGenerating, setIsGenerating] = useState(false)
  const [bookId, setBookId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const updateData = useCallback((updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }))
  }, [])

  const nextStep = useCallback(() => {
    setStep((prev) => (prev < 6 ? ((prev + 1) as WizardStep) : prev))
  }, [])

  const prevStep = useCallback(() => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as WizardStep) : prev))
  }, [])

  const goToStep = useCallback((target: WizardStep) => {
    setStep(target)
  }, [])

  const submit = useCallback(async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: wizardData.childId,
          child_name: wizardData.childName,
          child_age: wizardData.childAge,
          prompt: wizardData.prompt,
          style: wizardData.style,
          mood: wizardData.mood,
          language: wizardData.language,
          page_count: wizardData.pageCount,
          rhyming: wizardData.rhyming,
          bilingual: wizardData.bilingual,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Failed to create book' }))
        throw new Error(err.detail ?? 'Failed to create book')
      }

      const data = await response.json()
      setBookId(data.id)
      return data.id as string
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create book'
      setError(message)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [wizardData])

  const reset = useCallback(() => {
    setStep(1)
    setWizardData(initialWizardData)
    setIsGenerating(false)
    setBookId(null)
    setError(null)
  }, [])

  return {
    step,
    setStep: goToStep,
    nextStep,
    prevStep,
    wizardData,
    updateData,
    submit,
    isGenerating,
    bookId,
    error,
    reset,
  }
}
