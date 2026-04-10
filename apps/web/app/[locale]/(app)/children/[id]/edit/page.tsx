'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  ChildProfileForm,
  type ChildProfilePayload,
} from '@/components/children/ChildProfileForm'

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface ChildProfileData {
  id: string
  name: string
  gender: 'boy' | 'girl' | 'prefer_not_to_say'
  birthDate: string
  avatar: ChildProfilePayload['avatar'] | null
  physicalTraits: ChildProfilePayload['physicalTraits']
  preferences: ChildProfilePayload['preferences']
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function EditChildPage() {
  const t = useTranslations('children')
  const tCommon = useTranslations('common')
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [child, setChild] = useState<ChildProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch existing profile
  useEffect(() => {
    let cancelled = false

    async function fetchChild() {
      try {
        const res = await fetch(`/api/children?id=${params.id}`)
        if (!res.ok) throw new Error('Failed to load profile')
        const data = await res.json()
        if (!cancelled) setChild(data)
      } catch {
        if (!cancelled) setError('Failed to load child profile')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchChild()
    return () => {
      cancelled = true
    }
  }, [params.id])

  const handleSubmit = useCallback(
    async (data: ChildProfilePayload) => {
      setIsSubmitting(true)
      try {
        const formData = new FormData()
        formData.append('id', params.id)
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

        if (!res.ok) throw new Error('Failed to update profile')

        router.push(`/children/${params.id}`)
      } catch {
        // Error handling
      } finally {
        setIsSubmitting(false)
      }
    },
    [params.id, router],
  )

  const handleCancel = useCallback(() => {
    router.back()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !child) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-600 dark:text-red-400">
          {error ?? 'Profile not found'}
        </p>
        <button
          onClick={() => router.back()}
          className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
        >
          {tCommon('back')}
        </button>
      </div>
    )
  }

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
          {t('editProfile')}
        </h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
        <ChildProfileForm
          defaultValues={{
            name: child.name,
            gender: child.gender,
            birthDate: child.birthDate,
            photos: [], // existing photos are shown by URL; new uploads go here
            avatar: child.avatar ?? undefined,
            physicalTraits: child.physicalTraits,
            preferences: child.preferences,
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
