'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

export type Currency = 'ILS' | 'USD' | 'EUR'

interface CurrencyToggleProps {
  value: Currency
  onChange: (currency: Currency) => void
  className?: string
}

const currencies: { value: Currency; symbol: string }[] = [
  { value: 'USD', symbol: '$' },
  { value: 'ILS', symbol: '\u20AA' },
  { value: 'EUR', symbol: '\u20AC' },
]

export function CurrencyToggle({ value, onChange, className }: CurrencyToggleProps) {
  const t = useTranslations('pricing')

  return (
    <div
      className={cn(
        'inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800',
        className,
      )}
      role="radiogroup"
      aria-label={t('selectCurrency')}
    >
      {currencies.map((currency) => (
        <button
          key={currency.value}
          type="button"
          role="radio"
          aria-checked={value === currency.value}
          onClick={() => onChange(currency.value)}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-all',
            value === currency.value
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          )}
        >
          {currency.symbol} {currency.value}
        </button>
      ))}
    </div>
  )
}
