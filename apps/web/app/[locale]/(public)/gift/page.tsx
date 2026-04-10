'use client'

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Gift } from 'lucide-react'
import { GiftPurchaseFlow } from '@/components/gifts/GiftPurchaseFlow'

export default function GiftPage() {
  const t = useTranslations('gifts')
  const router = useRouter()

  const handlePurchase = useCallback(
    async (data: {
      tierId: string
      message: string
      deliveryDate: string
      deliveryTime: string
      recipientEmail: string
    }) => {
      const res = await fetch('/api/gifts/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const { checkoutUrl } = await res.json()
        window.location.href = checkoutUrl
      }
    },
    [],
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30">
          <Gift className="h-8 w-8 text-pink-600 dark:text-pink-400" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
          {t('purchaseTitle')}
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          {t('purchaseSubtitle')}
        </p>
      </div>

      <GiftPurchaseFlow onPurchase={handlePurchase} />
    </div>
  )
}
