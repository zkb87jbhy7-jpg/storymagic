'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ShieldCheck, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ConsentFormProps {
  studentName: string
  schoolName: string
  teacherName: string
  token: string
  onConsent: (token: string, consented: boolean) => void | Promise<void>
  className?: string
}

export function ConsentForm({
  studentName,
  schoolName,
  teacherName,
  token,
  onConsent,
  className,
}: ConsentFormProps) {
  const t = useTranslations('consent')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dataCollectionAgreed, setDataCollectionAgreed] = useState(false)
  const [biometricAgreed, setBiometricAgreed] = useState(false)

  const handleSubmit = useCallback(
    async (consented: boolean) => {
      if (consented && (!dataCollectionAgreed || !biometricAgreed)) return
      setIsSubmitting(true)
      try {
        await onConsent(token, consented)
      } finally {
        setIsSubmitting(false)
      }
    },
    [token, dataCollectionAgreed, biometricAgreed, onConsent],
  )

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <ShieldCheck className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          {t('parentConsentTitle')}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t('consentIntro', { student: studentName, school: schoolName, teacher: teacherName })}
        </p>
      </div>

      {/* COPPA notice */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-900/20">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-300">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          {t('coppaTitle')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-blue-800 dark:text-blue-300/80">
          {t('coppaDescription')}
        </p>
      </div>

      {/* Biometric disclosure */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/20">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          {t('biometricTitle')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-amber-800 dark:text-amber-300/80">
          {t('biometricDescription')}
        </p>
      </div>

      {/* Data collection details */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          {t('dataCollectedTitle')}
        </h2>
        <ul className="mt-3 space-y-2">
          {['firstName', 'photo', 'voiceRecording', 'storyPreferences'].map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
            >
              <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" />
              {t(`dataItem.${item}`)}
            </li>
          ))}
        </ul>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50">
          <input
            type="checkbox"
            checked={dataCollectionAgreed}
            onChange={(e) => setDataCollectionAgreed(e.target.checked)}
            className="mt-0.5 rounded text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {t('agreeDataCollection')}
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50">
          <input
            type="checkbox"
            checked={biometricAgreed}
            onChange={(e) => setBiometricAgreed(e.target.checked)}
            className="mt-0.5 rounded text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {t('agreeBiometric')}
          </span>
        </label>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={!dataCollectionAgreed || !biometricAgreed || isSubmitting}
          className={cn(
            'flex-1 rounded-xl px-6 py-3 text-sm font-semibold',
            'bg-green-600 text-white transition-colors hover:bg-green-700',
            'dark:bg-green-500 dark:hover:bg-green-600',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-900',
          )}
        >
          {t('giveConsent')}
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting}
          className={cn(
            'flex-1 rounded-xl px-6 py-3 text-sm font-semibold',
            'border border-slate-300 text-slate-700 transition-colors hover:bg-slate-50',
            'dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-900',
          )}
        >
          {t('optOut')}
        </button>
      </div>
    </div>
  )
}
