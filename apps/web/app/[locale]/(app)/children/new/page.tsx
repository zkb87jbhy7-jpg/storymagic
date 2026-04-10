'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {
  ChildProfileForm,
  type ChildProfilePayload,
} from '@/components/children/ChildProfileForm'

export default function NewChildPage() {
  const t = useTranslations('children')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(
    async (data: ChildProfilePayload) => {
      setIsSubmitting(true)
      try {
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('gender', data.gender)
        formData.append('birthDate', data.birthDate)
        formData.append('avatar', JSON.stringify(data.avatar))
        formData.append('physicalTraits', JSON.stringify(data.physicalTraits))
        formData.append('preferences', JSON.stringify(data.preferences))

        data.photos.forEach((photo) => {
          formData.append('photos', photo.file)
        })

        const res = await fetch('/api/children', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          throw new Error('Failed to create child profile')
        }

        const child = await res.json()
        router.push(`/children/${child.id}`)
      } catch {
        // Error handling would use toast / sonner in production
      } finally {
        setIsSubmitting(false)
      }
    },
    [router],
  )

  const handleCancel = useCallback(() => {
    router.back()
  }, [router])

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
            'border border-slate-200 bg-white hover:bg-slate-50',
            'dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          )}
          aria-label={tCommon('back')}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('addChild')}
        </h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
        <ChildProfileForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
