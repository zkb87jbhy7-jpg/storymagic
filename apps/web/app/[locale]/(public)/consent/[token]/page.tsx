'use client'

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { ConsentForm } from '@/components/classroom/ConsentForm'

export default function ConsentPage() {
  const t = useTranslations('consent')
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const handleConsent = useCallback(
    async (consentToken: string, consented: boolean) => {
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: consentToken, consented }),
      })
      if (res.ok) {
        router.push(consented ? '/consent/thank-you' : '/consent/opted-out')
      }
    },
    [router],
  )

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <ConsentForm
        studentName={t('loadingStudent')}
        schoolName={t('loadingSchool')}
        teacherName={t('loadingTeacher')}
        token={token}
        onConsent={handleConsent}
      />
    </div>
  )
}
