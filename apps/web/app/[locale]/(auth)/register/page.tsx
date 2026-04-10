'use client'

import { useTranslations } from 'next-intl'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div
        className={cn(
          'w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg',
          'dark:border-slate-700 dark:bg-slate-900'
        )}
      >
        {/* Logo / App name */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              'bg-primary-100 text-primary-700',
              'dark:bg-primary-900/40 dark:text-primary-400'
            )}
          >
            <BookOpen className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {tCommon('appName')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('registerSubtitle')}
          </p>
        </div>

        <RegisterForm />
      </div>
    </main>
  )
}
