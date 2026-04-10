'use client'

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { GiftRedeemExperience } from '@/components/gifts/GiftRedeemExperience'

export default function RedeemGiftPage() {
  const t = useTranslations('gifts')
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const handleStartCreating = useCallback(() => {
    router.push(`/books/create?gift=${code}`)
  }, [code, router])

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <GiftRedeemExperience
        senderName={t('loadingSender')}
        message={t('loadingMessage')}
        giftType="digital"
        onStartCreating={handleStartCreating}
      />
    </div>
  )
}
