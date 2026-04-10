'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { CoCreationWizard, type CoCreationChoices } from '@/components/co-creation/CoCreationWizard'
import { SparkyMascot } from '@/components/co-creation/SparkyMascot'

// Mock data — would come from API / route params
const MOCK_CHILDREN = [
  { id: '1', name: 'Mika', age: 5 },
  { id: '2', name: 'Noa', age: 8 },
]

export default function CoCreationPage() {
  const t = useTranslations('coCreation')

  const [selectedChild, setSelectedChild] = useState<(typeof MOCK_CHILDREN)[0] | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [finalChoices, setFinalChoices] = useState<CoCreationChoices | null>(null)

  const handleComplete = useCallback((choices: CoCreationChoices) => {
    setFinalChoices(choices)
    setIsComplete(true)
    // In production, this would trigger API call to generate the book
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <a
          href="/books/create"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          aria-label={t('backToCreate')}
        >
          <ArrowLeft className="h-5 w-5" />
        </a>
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
            <Users className="h-6 w-6 text-primary-500" />
            {t('title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Child selection (if not yet selected) */}
      {!selectedChild && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-start gap-3">
            <SparkyMascot mood="waving" size="md" />
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm dark:border-slate-600 dark:bg-slate-700">
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {t('whoIsCreating')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MOCK_CHILDREN.map((child) => (
              <motion.button
                key={child.id}
                type="button"
                onClick={() => setSelectedChild(child)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-4 rounded-xl border-2 border-slate-200 bg-white p-5',
                  'text-start transition-all hover:border-primary-400 hover:shadow-md',
                  'dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-500',
                  'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
                  'dark:focus:ring-offset-slate-900'
                )}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 text-xl font-bold text-white">
                  {child.name[0]}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {child.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('ageYears', { age: child.age })}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Wizard */}
      {selectedChild && !isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => setSelectedChild(null)}
              className="text-primary-500 underline hover:text-primary-600 dark:text-primary-400"
            >
              {t('changeChild')}
            </button>
            <span>|</span>
            <span>
              {t('creatingWith', { name: selectedChild.name })}
            </span>
          </div>
          <CoCreationWizard
            childName={selectedChild.name}
            childAge={selectedChild.age}
            onComplete={handleComplete}
          />
        </motion.div>
      )}

      {/* Completion */}
      {isComplete && finalChoices && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 py-8 text-center"
        >
          <SparkyMascot mood="excited" size="lg" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('storyCreated')}
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {t('storyCreatedDesc', { name: selectedChild?.name })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(finalChoices).map(([key, value]) => {
              if (key === 'customInput' || !value) return null
              return (
                <div
                  key={key}
                  className="rounded-xl bg-primary-50 p-3 dark:bg-primary-950/20"
                >
                  <p className="text-xs font-medium text-primary-500">{t(`step_${key}`)}</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                    {value}
                  </p>
                </div>
              )
            })}
          </div>

          <motion.a
            href={`/books/${Date.now()}/read`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'mt-4 flex items-center gap-2 rounded-xl px-6 py-3 text-lg font-semibold text-white',
              'bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg',
              'hover:shadow-xl transition-shadow'
            )}
          >
            <Sparkles className="h-5 w-5" />
            {t('readStory')}
          </motion.a>
        </motion.div>
      )}
    </div>
  )
}
