'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils/cn'
import { PhotoUploader, type PhotoEntry } from './PhotoUploader'
import { AvatarBuilder, type AvatarValues } from './AvatarBuilder'
import {
  PhysicalTraitsForm,
  type PhysicalTraitsValues,
} from './PhysicalTraitsForm'
import { PreferencesForm, type PreferencesValues } from './PreferencesForm'

/* ------------------------------------------------------------------ */
/* Schema                                                             */
/* ------------------------------------------------------------------ */

const childProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  gender: z.enum(['boy', 'girl', 'prefer_not_to_say']),
  birthDate: z.string().min(1, 'Birth date is required'),
})

type ChildProfileFormData = z.infer<typeof childProfileSchema>

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */

export interface ChildProfilePayload extends ChildProfileFormData {
  photos: PhotoEntry[]
  avatar: AvatarValues
  physicalTraits: PhysicalTraitsValues
  preferences: PreferencesValues
}

interface ChildProfileFormProps {
  /** Pre-filled values when editing an existing profile. */
  defaultValues?: Partial<ChildProfilePayload>
  /** Called with validated data on save. */
  onSubmit: (data: ChildProfilePayload) => void | Promise<void>
  /** Called when the user cancels. */
  onCancel: () => void
  /** Show a loading state on the submit button. */
  isSubmitting?: boolean
  className?: string
}

/* ------------------------------------------------------------------ */
/* Default state factories                                            */
/* ------------------------------------------------------------------ */

const defaultAvatar: AvatarValues = {
  skinTone: 'light',
  hairColor: 'brown',
  hairStyle: 'short',
  eyeColor: 'brown',
  glasses: false,
  hearingAid: false,
}

const defaultPhysicalTraits: PhysicalTraitsValues = {
  wheelchair: false,
  glasses: false,
  hearingAid: false,
  customNotes: '',
}

const defaultPreferences: PreferencesValues = {
  familyStructure: 'two_parents',
  cultural: {
    dietaryRestrictions: [],
    holidayPreferences: [],
  },
  modestyConcerns: false,
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function ChildProfileForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
}: ChildProfileFormProps) {
  const t = useTranslations('children')
  const tCommon = useTranslations('common')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ChildProfileFormData>({
    resolver: zodResolver(childProfileSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      gender: defaultValues?.gender ?? 'prefer_not_to_say',
      birthDate: defaultValues?.birthDate ?? '',
    },
  })

  // Non-schema state managed alongside the form
  const [photos, setPhotos] = useState<PhotoEntry[]>(
    defaultValues?.photos ?? [],
  )
  const [avatar, setAvatar] = useState<AvatarValues>(
    defaultValues?.avatar ?? defaultAvatar,
  )
  const [physicalTraits, setPhysicalTraits] = useState<PhysicalTraitsValues>(
    defaultValues?.physicalTraits ?? defaultPhysicalTraits,
  )
  const [preferences, setPreferences] = useState<PreferencesValues>(
    defaultValues?.preferences ?? defaultPreferences,
  )

  const handleFormSubmit = useCallback(
    (data: ChildProfileFormData) => {
      onSubmit({
        ...data,
        photos,
        avatar,
        physicalTraits,
        preferences,
      })
    },
    [onSubmit, photos, avatar, physicalTraits, preferences],
  )

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn('space-y-10', className)}
      noValidate
    >
      {/* ---- Basic info ---- */}
      <section className="space-y-5">
        {/* Name */}
        <div>
          <label
            htmlFor="child-name"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {t('name')}
          </label>
          <input
            id="child-name"
            type="text"
            {...register('name')}
            className={cn(
              'w-full rounded-lg border px-3 py-2.5 text-sm transition-colors',
              'border-slate-300 bg-white placeholder:text-slate-400',
              'dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
              'dark:focus:border-primary-400 dark:focus:ring-primary-400/20',
              errors.name && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            )}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label
            htmlFor="child-gender"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {t('gender')}
          </label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <select
                id="child-gender"
                {...field}
                className={cn(
                  'w-full rounded-lg border px-3 py-2.5 text-sm transition-colors',
                  'border-slate-300 bg-white',
                  'dark:border-slate-600 dark:bg-slate-800 dark:text-white',
                  'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                  'dark:focus:border-primary-400 dark:focus:ring-primary-400/20',
                )}
              >
                <option value="boy">{t('boy')}</option>
                <option value="girl">{t('girl')}</option>
                <option value="prefer_not_to_say">{t('preferNotToSay')}</option>
              </select>
            )}
          />
        </div>

        {/* Birth date */}
        <div>
          <label
            htmlFor="child-birthdate"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {t('birthDate')}
          </label>
          <input
            id="child-birthdate"
            type="date"
            {...register('birthDate')}
            className={cn(
              'w-full rounded-lg border px-3 py-2.5 text-sm transition-colors',
              'border-slate-300 bg-white',
              'dark:border-slate-600 dark:bg-slate-800 dark:text-white',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
              'dark:focus:border-primary-400 dark:focus:ring-primary-400/20',
              errors.birthDate && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            )}
          />
          {errors.birthDate && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.birthDate.message}
            </p>
          )}
        </div>
      </section>

      {/* ---- Photos ---- */}
      <section>
        <PhotoUploader photos={photos} onChange={setPhotos} />
      </section>

      {/* ---- Avatar builder (fallback) ---- */}
      {photos.length === 0 && (
        <section>
          <AvatarBuilder value={avatar} onChange={setAvatar} />
        </section>
      )}

      {/* ---- Physical traits ---- */}
      <section>
        <PhysicalTraitsForm
          value={physicalTraits}
          onChange={setPhysicalTraits}
        />
      </section>

      {/* ---- Preferences ---- */}
      <section>
        <PreferencesForm value={preferences} onChange={setPreferences} />
      </section>

      {/* ---- Actions ---- */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={cn(
            'rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
            'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
            'dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-900',
          )}
        >
          {tCommon('cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors',
            'bg-primary-600 text-white hover:bg-primary-700',
            'dark:bg-primary-500 dark:hover:bg-primary-600',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-900',
          )}
        >
          {isSubmitting ? tCommon('loading') : tCommon('save')}
        </button>
      </div>
    </form>
  )
}
