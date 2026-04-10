'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  ArrowLeft,
  Pencil,
  Calendar,
  User as UserIcon,
  Heart,
  Camera,
  Accessibility,
  Glasses,
  Ear,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

/* ------------------------------------------------------------------ */
/* Types (matching API response)                                      */
/* ------------------------------------------------------------------ */

interface ChildProfile {
  id: string
  name: string
  gender: 'boy' | 'girl' | 'prefer_not_to_say'
  birthDate: string
  photoUrls: string[]
  avatar: {
    skinTone: string
    hairColor: string
    hairStyle: string
    eyeColor: string
    glasses: boolean
    hearingAid: boolean
  } | null
  physicalTraits: {
    wheelchair: boolean
    glasses: boolean
    hearingAid: boolean
    customNotes: string
  }
  preferences: {
    familyStructure: string
    cultural: {
      dietaryRestrictions: string[]
      holidayPreferences: string[]
    }
    modestyConcerns: boolean
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function ChildProfilePage() {
  const t = useTranslations('children')
  const tCommon = useTranslations('common')
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [child, setChild] = useState<ChildProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const genderLabel =
    child.gender === 'boy'
      ? t('boy')
      : child.gender === 'girl'
        ? t('girl')
        : t('preferNotToSay')

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
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
            {child.name}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/children/${child.id}/edit`)}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
            'bg-primary-600 text-white hover:bg-primary-700',
            'dark:bg-primary-500 dark:hover:bg-primary-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-900',
          )}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          {t('editProfile')}
        </button>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {/* Basic info */}
        <div className="space-y-4 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Basic Information
          </h2>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <UserIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t('gender')}
                </dt>
                <dd className="text-sm text-slate-900 dark:text-white">
                  {genderLabel}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t('birthDate')}
                </dt>
                <dd className="text-sm text-slate-900 dark:text-white">
                  {child.birthDate}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Photos */}
        {child.photoUrls.length > 0 && (
          <div className="border-t border-slate-200 p-6 dark:border-slate-700 sm:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <Camera className="h-5 w-5" aria-hidden="true" />
              Photos
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {child.photoUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${child.name} photo ${i + 1}`}
                  className="aspect-square rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Physical traits */}
        <div className="border-t border-slate-200 p-6 dark:border-slate-700 sm:p-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            {t('physicalTraits')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {child.physicalTraits.wheelchair && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                <Accessibility className="h-3.5 w-3.5" aria-hidden="true" />
                Wheelchair
              </span>
            )}
            {child.physicalTraits.glasses && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                <Glasses className="h-3.5 w-3.5" aria-hidden="true" />
                Glasses
              </span>
            )}
            {child.physicalTraits.hearingAid && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                <Ear className="h-3.5 w-3.5" aria-hidden="true" />
                Hearing Aid
              </span>
            )}
            {!child.physicalTraits.wheelchair &&
              !child.physicalTraits.glasses &&
              !child.physicalTraits.hearingAid && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  None specified
                </span>
              )}
          </div>
          {child.physicalTraits.customNotes && (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              {child.physicalTraits.customNotes}
            </p>
          )}
        </div>

        {/* Preferences */}
        <div className="border-t border-slate-200 p-6 dark:border-slate-700 sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Heart className="h-5 w-5" aria-hidden="true" />
            {t('culturalPrefs')}
          </h2>

          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Family Structure
              </dt>
              <dd className="mt-0.5 text-sm capitalize text-slate-900 dark:text-white">
                {child.preferences.familyStructure.replace(/_/g, ' ')}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Dietary Restrictions
              </dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {child.preferences.cultural.dietaryRestrictions.length > 0 ? (
                  child.preferences.cultural.dietaryRestrictions.map((d) => (
                    <span
                      key={d}
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                    >
                      {d}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    None
                  </span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Holiday Preferences
              </dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {child.preferences.cultural.holidayPreferences.length > 0 ? (
                  child.preferences.cultural.holidayPreferences.map((h) => (
                    <span
                      key={h}
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                    >
                      {h.replace(/_/g, ' ')}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    None
                  </span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Modesty Concerns
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900 dark:text-white">
                {child.preferences.modestyConcerns ? 'Yes' : 'No'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
