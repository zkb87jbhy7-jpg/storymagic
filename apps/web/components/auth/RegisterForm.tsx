'use client'

import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter, Link } from '@/i18n/navigation'
import { User, Mail, Lock, Eye, EyeOff, Globe, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { locales, localeNames } from '@/i18n/config'

// ─── Schema ───────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    name: z.string().min(1, 'required').min(2, 'nameTooShort'),
    email: z.string().min(1, 'required').email('invalidEmail'),
    password: z.string().min(1, 'required').min(8, 'minLength'),
    confirmPassword: z.string().min(1, 'required'),
    locale: z.enum(['he', 'en'] as const),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: 'mustAgree' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'passwordsMismatch',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegisterForm() {
  const t = useTranslations('auth')
  const tValidation = useTranslations('validation')
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      locale: 'he',
      agreeToTerms: undefined as unknown as true,
    },
  })

  async function onSubmit(data: RegisterFormValues) {
    setServerError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          locale: data.locale,
        }),
        credentials: 'same-origin',
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setServerError(body?.message ?? tValidation('registerFailed'))
        return
      }

      router.push('/dashboard')
    } catch {
      setServerError(tValidation('networkError'))
    }
  }

  // ── Shared input class helpers ──
  const inputBase = cn(
    'w-full rounded-lg border bg-white ps-10 pe-4 py-2.5 text-sm',
    'text-slate-900 placeholder:text-slate-400',
    'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    'transition-colors'
  )

  function inputCls(hasError: boolean) {
    return cn(inputBase, hasError ? 'border-danger-500 focus:ring-danger-500' : 'border-slate-300')
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

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="register-name"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {t('name')}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400">
            <User className="h-4 w-4" aria-hidden="true" />
          </span>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            {...register('name')}
            className={inputCls(!!errors.name)}
          />
        </div>
        {errors.name && (
          <p className="text-xs text-danger-500">{tValidation(errors.name.message as string)}</p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="register-email"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {t('email')}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400">
            <Mail className="h-4 w-4" aria-hidden="true" />
          </span>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={inputCls(!!errors.email)}
            placeholder="you@example.com"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-danger-500">{tValidation(errors.email.message as string)}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="register-password"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {t('password')}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </span>
          <input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('password')}
            className={cn(inputCls(!!errors.password), 'pe-10')}
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
          htmlFor="register-confirm"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {t('confirmPassword')}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </span>
          <input
            id="register-confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={cn(inputCls(!!errors.confirmPassword), 'pe-10')}
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

      {/* Language preference */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="register-locale"
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {t('languagePreference')}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400">
            <Globe className="h-4 w-4" aria-hidden="true" />
          </span>
          <select
            id="register-locale"
            {...register('locale')}
            className={cn(
              'w-full appearance-none rounded-lg border bg-white ps-10 pe-4 py-2.5 text-sm',
              'text-slate-900',
              'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              'border-slate-300 transition-colors'
            )}
          >
            {locales.map((loc) => (
              <option key={loc} value={loc}>
                {localeNames[loc]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Agree to terms */}
      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-2.5">
          <input
            type="checkbox"
            {...register('agreeToTerms')}
            className={cn(
              'mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-primary-600',
              'focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800'
            )}
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {t('agreeToTerms')}
          </span>
        </label>
        {errors.agreeToTerms && (
          <p className="text-xs text-danger-500">
            {tValidation(errors.agreeToTerms.message as string)}
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
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {t('register')}
      </button>

      {/* Login link */}
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        {t('haveAccount')}{' '}
        <Link
          href="/login"
          className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
        >
          {t('login')}
        </Link>
      </p>
    </form>
  )
}
