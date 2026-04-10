'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Gift, Sparkles, BookOpen, Star, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { GiftMessageEditor } from './GiftMessageEditor'
import { GiftDeliveryScheduler } from './GiftDeliveryScheduler'

interface GiftTier {
  id: string
  nameKey: string
  price: number
  descriptionKey: string
  icon: React.ElementType
  color: string
}

interface GiftPurchaseFlowProps {
  currency?: string
  onPurchase: (data: {
    tierId: string
    message: string
    deliveryDate: string
    deliveryTime: string
    recipientEmail: string
  }) => void | Promise<void>
  className?: string
}

const tiers: GiftTier[] = [
  {
    id: 'digital',
    nameKey: 'tierDigital',
    price: 9.99,
    descriptionKey: 'tierDigitalDescription',
    icon: Sparkles,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    id: 'print',
    nameKey: 'tierPrint',
    price: 34.99,
    descriptionKey: 'tierPrintDescription',
    icon: BookOpen,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    id: 'experience',
    nameKey: 'tierExperience',
    price: 49.99,
    descriptionKey: 'tierExperienceDescription',
    icon: Star,
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
]

export function GiftPurchaseFlow({
  currency = 'USD',
  onPurchase,
  className,
}: GiftPurchaseFlowProps) {
  const t = useTranslations('gifts')
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [deliveryTime, setDeliveryTime] = useState('09:00')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedTier || !recipientEmail.trim()) return
      setIsSubmitting(true)
      try {
        await onPurchase({
          tierId: selectedTier,
          message,
          deliveryDate,
          deliveryTime,
          recipientEmail: recipientEmail.trim(),
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [selectedTier, message, recipientEmail, deliveryDate, deliveryTime, onPurchase],
  )

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-8', className)}>
      {/* Tier selection */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <Gift className="h-5 w-5 text-pink-500" aria-hidden="true" />
          {t('chooseGift')}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {tiers.map((tier) => {
            const Icon = tier.icon
            const isSelected = selectedTier === tier.id
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTier(tier.id)}
                className={cn(
                  'relative flex flex-col items-center rounded-2xl border p-6 text-center transition-all',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20 dark:bg-primary-900/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                )}
              >
                {isSelected && (
                  <div className="absolute end-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 dark:bg-primary-500">
                    <Check className="h-4 w-4 text-white" aria-hidden="true" />
                  </div>
                )}
                <div
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-2xl',
                    tier.color,
                  )}
                >
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                  {t(tier.nameKey)}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t(tier.descriptionKey)}
                </p>
                <span className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(tier.price)}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Recipient email */}
      <section>
        <label
          htmlFor="recipient-email"
          className="block text-sm font-semibold text-slate-900 dark:text-white"
        >
          {t('recipientEmail')}
        </label>
        <input
          id="recipient-email"
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder={t('recipientEmailPlaceholder')}
          required
          className={cn(
            'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm',
            'text-slate-900 placeholder:text-slate-400',
            'transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            'dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500',
          )}
        />
      </section>

      {/* Personal message */}
      <GiftMessageEditor value={message} onChange={setMessage} />

      {/* Delivery scheduling */}
      <GiftDeliveryScheduler
        date={deliveryDate}
        onDateChange={setDeliveryDate}
        time={deliveryTime}
        onTimeChange={setDeliveryTime}
      />

      {/* Submit */}
      <button
        type="submit"
        disabled={!selectedTier || !recipientEmail.trim() || isSubmitting}
        className={cn(
          'inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold',
          'bg-gradient-to-r from-pink-500 to-purple-600 text-white transition-opacity',
          'hover:opacity-90',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-slate-900',
        )}
      >
        <Gift className="h-4 w-4" aria-hidden="true" />
        {isSubmitting
          ? t('processing')
          : selectedTier
            ? t('purchaseGift', {
                price: formatCurrency(
                  tiers.find((tier) => tier.id === selectedTier)?.price ?? 0,
                ),
              })
            : t('selectTierFirst')}
      </button>
    </form>
  )
}
