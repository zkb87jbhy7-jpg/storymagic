'use client'

import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter, Link } from '@/i18n/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().min(1, 'required').email('invalidEmail'),
  password: z.string().min(1, 'required').min(8, 'minLength'),
})

type LoginFormValues = z.infer<typeof loginSchema>

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginForm() {
  const t = useTranslations('auth')
  const tErrors = useTranslations('validation')
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginFormValues) {
    setServerError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'same-origin',
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setServerError(body?.message ?? tErrors('loginFailed'))
        return
      }

      // Read redirect query param if present
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect')
      router.push(redirect ?? '/dashboard')
    } catch {
      setServerError(tErrors('networkError'))
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      {/* Server error */}
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
          htmlFor="login-email"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {t('email')}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400">
            <Mail className="h-4 w-4" aria-hidden="true" />
          </span>
          <input
            id="login-email"
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
          <p className="text-xs text-danger-500">{tErrors(errors.email.message as string)}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="login-password"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {t('password')}
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            {t('forgotPassword')}
          </Link>
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </span>
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
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
            onClick={() => setShowPassword((prev) => !prev)}
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
          <p className="text-xs text-danger-500">{tErrors(errors.password.message as string)}</p>
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
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {t('login')}
      </button>

      {/* Divider */}
      <div className="relative flex items-center py-2">
        <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
        <span className="px-3 text-xs text-slate-400 dark:text-slate-500">
          {t('orContinueWith')}
        </span>
        <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
      </div>

      {/* Google */}
      <button
        type="button"
        className={cn(
          'flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-2.5',
          'text-sm font-medium transition-colors',
          'border-slate-300 bg-white text-slate-700',
          'hover:bg-slate-50',
          'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300',
          'dark:hover:bg-slate-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-slate-900'
        )}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {t('google')}
      </button>

      {/* Register link */}
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        {t('noAccount')}{' '}
        <Link
          href="/register"
          className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
        >
          {t('register')}
        </Link>
      </p>
    </form>
  )
}
