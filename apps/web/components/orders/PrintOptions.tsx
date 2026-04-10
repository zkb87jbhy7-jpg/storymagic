'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { BookOpen, Maximize, Gift, Minus, Plus, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface PrintConfig {
  coverType: 'hardcover' | 'softcover'
  size: 'square' | 'a4'
  giftWrap: boolean
  quantity: number
}

interface PrintOptionsProps {
  onSubmit: (config: PrintConfig) => void | Promise<void>
  basePrice?: number
  currency?: string
  isSubmitting?: boolean
  className?: string
}

const coverPrices = { hardcover: 12, softcover: 0 } as const
const sizePrices = { square: 0, a4: 3 } as const
const giftWrapPrice = 4.99

export function PrintOptions({
  onSubmit,
  basePrice = 19.99,
  currency = 'USD',
  isSubmitting = false,
  className,
}: PrintOptionsProps) {
  const t = useTranslations('orders')
  const [config, setConfig] = useState<PrintConfig>({
    coverType: 'hardcover',
    size: 'square',
    giftWrap: false,
    quantity: 1,
  })

  const totalPrice =
    (basePrice +
      coverPrices[config.coverType] +
      sizePrices[config.size] +
      (config.giftWrap ? giftWrapPrice : 0)) *
    config.quantity

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      await onSubmit(config)
    },
    [config, onSubmit],
  )

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Cover type */}
      <fieldset>
        <legend className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          {t('coverType')}
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(['hardcover', 'softcover'] as const).map((type) => (
            <label
              key={type}
              className={cn(
                'flex cursor-pointer flex-col items-center rounded-xl border p-4 transition-all',
                config.coverType === type
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20 dark:bg-primary-900/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600',
              )}
            >
              <input
                type="radio"
                name="coverType"
                value={type}
                checked={config.coverType === type}
                onChange={() => setConfig((p) => ({ ...p, coverType: type }))}
                className="sr-only"
              />
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {t(`cover.${type}`)}
              </span>
              {coverPrices[type] > 0 && (
                <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  +{formatCurrency(coverPrices[type])}
                </span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Size */}
      <fieldset>
        <legend className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <Maximize className="h-4 w-4" aria-hidden="true" />
          {t('bookSize')}
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(['square', 'a4'] as const).map((size) => (
            <label
              key={size}
              className={cn(
                'flex cursor-pointer flex-col items-center rounded-xl border p-4 transition-all',
                config.size === size
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20 dark:bg-primary-900/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600',
              )}
            >
              <input
                type="radio"
                name="size"
                value={size}
                checked={config.size === size}
                onChange={() => setConfig((p) => ({ ...p, size }))}
                className="sr-only"
              />
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {t(`size.${size}`)}
              </span>
              {sizePrices[size] > 0 && (
                <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  +{formatCurrency(sizePrices[size])}
                </span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Gift wrap */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <Gift
            className="h-5 w-5 text-pink-500 dark:text-pink-400"
            aria-hidden="true"
          />
          <div>
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {t('giftWrap')}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              +{formatCurrency(giftWrapPrice)}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={config.giftWrap}
          onClick={() => setConfig((p) => ({ ...p, giftWrap: !p.giftWrap }))}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
            config.giftWrap
              ? 'bg-primary-600 dark:bg-primary-500'
              : 'bg-slate-200 dark:bg-slate-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-800',
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform',
              config.giftWrap ? 'translate-x-5' : 'translate-x-0.5',
              'mt-0.5',
            )}
          />
        </button>
      </div>

      {/* Quantity */}
      <div>
        <label className="text-sm font-semibold text-slate-900 dark:text-white">
          {t('quantity')}
        </label>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setConfig((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))
            }
            disabled={config.quantity <= 1}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 transition-colors',
              'hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            )}
            aria-label={t('decreaseQuantity')}
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="w-12 text-center text-lg font-bold text-slate-900 dark:text-white">
            {config.quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setConfig((p) => ({ ...p, quantity: Math.min(99, p.quantity + 1) }))
            }
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 transition-colors',
              'hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            )}
            aria-label={t('increaseQuantity')}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Total + submit */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t('estimatedTotal')}
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalPrice)}
          </span>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold',
            'bg-primary-600 text-white transition-colors hover:bg-primary-700',
            'dark:bg-primary-500 dark:hover:bg-primary-600',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-slate-900',
          )}
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? t('processing') : t('proceedToCheckout')}
        </button>
      </div>
    </form>
  )
}
