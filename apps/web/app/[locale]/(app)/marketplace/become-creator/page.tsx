'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { CreatorApplicationForm } from '@/components/creator/CreatorApplicationForm'

export default function BecomeCreatorPage() {
  const t = useTranslations('creator')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(
    async (data: {
      displayName: string
      bio: string
      portfolioLinks: string[]
      termsAgreed: boolean
    }) => {
      setIsSubmitting(true)
      try {
        const res = await fetch('/api/creator/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) {
          router.push('/marketplace/creator/dashboard')
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [router],
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.back()}
        className={cn(
          'inline-flex items-center gap-2 text-sm font-medium',
          'text-slate-600 transition-colors hover:text-slate-900',
          'dark:text-slate-400 dark:hover:text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded',
        )}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {tCommon('back')}
      </button>

      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          <Sparkles className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          {t('becomeCreatorTitle')}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t('becomeCreatorSubtitle')}
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
        <CreatorApplicationForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
