'use client'

import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ─── Schema ───────────────────────────────────────────────────────────────────

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'required').email('invalidEmail'),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const tValidation = useTranslations('validation')

  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: ForgotPasswordValues) {
    setServerError(null)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setServerError(body?.message ?? tValidation('networkError'))
        return
      }

      setSent(true)
    } catch {
      setServerError(tValidation('networkError'))
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div
        className={cn(
          'w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg',
          'dark:border-slate-700 dark:bg-slate-900'
        )}
      >
        {sent ? (
          /* Success state */
          <div className="flex flex-col items-center gap-4 text-center">
            <span
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full',
                'bg-success-500/10 text-success-500'
              )}
            >
              <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t('resetEmailSent')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('resetEmailSentDesc')}
            </p>
            <Link
              href="/login"
              className={cn(
                'mt-4 inline-flex items-center gap-2 text-sm font-medium',
                'text-primary-600 hover:text-primary-700',
                'dark:text-primary-400 dark:hover:text-primary-300',
                'transition-colors'
              )}
            >
              {t('backToLogin')}
            </Link>
          </div>
        ) : (
          /* Form state */
          <>
            <div className="mb-6">
              <Link
                href="/login"
                className={cn(
                  'inline-flex items-center gap-1.5 text-sm font-medium',
                  'text-slate-500 hover:text-slate-700',
                  'dark:text-slate-400 dark:hover:text-slate-300',
                  'transition-colors'
                )}
              >
                <svg
                  className="h-4 w-4 rtl:rotate-180"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                {t('backToLogin')}
              </Link>
            </div>

            <div className="mb-6">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {t('forgotPassword')}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t('forgotPasswordDesc')}
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
              noValidate
            >
              {serverError && (
                <div
                  role="alert"
                  className={cn(
                    'rounded-lg border border-danger-400/30 bg-danger-500/10 px-4 py-3',
                    'text-sm text-danger-600 dark:text-danger-400'
                  )}
                >
                  {serverError}
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="forgot-email"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t('email')}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className={cn(
                      'w-full rounded-lg border bg-white ps-10 pe-4 py-2.5 text-sm',
                      'text-slate-900 placeholder:text-slate-400',
                      'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                      'transition-colors',
                      errors.email
                        ? 'border-danger-500 focus:ring-danger-500'
                        : 'border-slate-300'
                    )}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-danger-500">
                    {tValidation(errors.email.message as string)}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5',
                  'text-sm font-semibold text-white transition-colors',
                  'bg-primary-600 hover:bg-primary-700',
                  'dark:bg-primary-500 dark:hover:bg-primary-600',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                  'dark:focus-visible:ring-offset-slate-900',
                  'disabled:cursor-not-allowed disabled:opacity-60'
                )}
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                {t('sendResetLink')}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
