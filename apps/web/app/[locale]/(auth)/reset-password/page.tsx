'use client'

import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter, Link } from '@/i18n/navigation'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ─── Schema ───────────────────────────────────────────────────────────────────

const resetPasswordSchema = z
  .object({
    password: z.string().min(1, 'required').min(8, 'minLength'),
    confirmPassword: z.string().min(1, 'required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'passwordsMismatch',
    path: ['confirmPassword'],
  })

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  const t = useTranslations('auth')
  const tValidation = useTranslations('validation')
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onSubmit(data: ResetPasswordValues) {
    setServerError(null)

    // Read token from URL search params
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (!token) {
      setServerError(tValidation('invalidResetToken'))
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: data.password, token }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setServerError(body?.message ?? tValidation('networkError'))
        return
      }

      setSuccess(true)
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
        {success ? (
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
              {t('passwordResetSuccess')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('passwordResetSuccessDesc')}
            </p>
            <Link
              href="/login"
              className={cn(
                'mt-4 inline-flex items-center justify-center rounded-lg px-5 py-2.5',
                'text-sm font-semibold text-white transition-colors',
                'bg-primary-600 hover:bg-primary-700',
                'dark:bg-primary-500 dark:hover:bg-primary-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                'dark:focus-visible:ring-offset-slate-900'
              )}
            >
              {t('backToLogin')}
            </Link>
          </div>
        ) : (
          /* Form state */
          <>
            <div className="mb-6">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {t('resetPassword')}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t('resetPasswordDesc')}
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

              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reset-password"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t('newPassword')}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400">
                    <Lock className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <input
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('password')}
                    className={cn(
                      'w-full rounded-lg border bg-white ps-10 pe-10 py-2.5 text-sm',
                      'text-slate-900 placeholder:text-slate-400',
                      'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                      'transition-colors',
                      errors.password
                        ? 'border-danger-500 focus:ring-danger-500'
                        : 'border-slate-300'
                    )}
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-danger-500">
                    {tValidation(errors.password.message as string)}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reset-confirm"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t('confirmPassword')}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400">
                    <Lock className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <input
                    id="reset-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    className={cn(
                      'w-full rounded-lg border bg-white ps-10 pe-10 py-2.5 text-sm',
                      'text-slate-900 placeholder:text-slate-400',
                      'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                      'transition-colors',
                      errors.confirmPassword
                        ? 'border-danger-500 focus:ring-danger-500'
                        : 'border-slate-300'
                    )}
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-danger-500">
                    {tValidation(errors.confirmPassword.message as string)}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5',
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
                {t('resetPassword')}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
