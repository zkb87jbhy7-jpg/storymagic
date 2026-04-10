'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { Save, Loader2 } from 'lucide-react'

interface ProfileData {
  name: string
  email: string
  phone: string
  language: string
  timezone: string
}

const LANGUAGES = [
  { value: 'he', label: 'עברית' },
  { value: 'en', label: 'English' },
]

const TIMEZONES = [
  { value: 'Asia/Jerusalem', label: 'Asia/Jerusalem (IST)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET)' },
]

export function ProfileForm() {
  const t = useTranslations('settings.profile')
  const tCommon = useTranslations('common')

  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    language: 'he',
    timezone: 'Asia/Jerusalem',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleChange(field: keyof ProfileData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) setSaved(true)
    } finally {
      setIsSaving(false)
    }
  }

  const inputClasses = cn(
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm',
    'text-slate-900 placeholder:text-slate-400',
    'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
    'dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500',
    'dark:focus:border-primary-400 dark:focus:ring-primary-400/20',
  )

  const labelClasses = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5'

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="profile-name" className={labelClasses}>
          {t('name')}
        </label>
        <input
          id="profile-name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder={t('namePlaceholder')}
          className={inputClasses}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="profile-email" className={labelClasses}>
          {t('email')}
        </label>
        <input
          id="profile-email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder={t('emailPlaceholder')}
          className={inputClasses}
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="profile-phone" className={labelClasses}>
          {t('phone')}
        </label>
        <input
          id="profile-phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder={t('phonePlaceholder')}
          className={inputClasses}
        />
      </div>

      {/* Language */}
      <div>
        <label htmlFor="profile-language" className={labelClasses}>
          {t('language')}
        </label>
        <select
          id="profile-language"
          value={formData.language}
          onChange={(e) => handleChange('language', e.target.value)}
          className={inputClasses}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Timezone */}
      <div>
        <label htmlFor="profile-timezone" className={labelClasses}>
          {t('timezone')}
        </label>
        <select
          id="profile-timezone"
          value={formData.timezone}
          onChange={(e) => handleChange('timezone', e.target.value)}
          className={inputClasses}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-5 py-2.5',
            'text-sm font-medium text-white transition-colors',
            'bg-primary-600 hover:bg-primary-700',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-primary-500 dark:hover:bg-primary-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-900',
          )}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          {isSaving ? tCommon('saving') : tCommon('save')}
        </button>

        {saved && (
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {tCommon('saved')}
          </span>
        )}
      </div>
    </form>
  )
}
