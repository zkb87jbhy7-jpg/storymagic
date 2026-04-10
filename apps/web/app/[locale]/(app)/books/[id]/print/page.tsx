'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Printer } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { PrintOptions, type PrintConfig } from '@/components/orders/PrintOptions'
import { DedicationEditor } from '@/components/orders/DedicationEditor'
import { SoftProofViewer } from '@/components/orders/SoftProofViewer'

export default function PrintPage() {
  const t = useTranslations('orders')
  const params = useParams()
  const router = useRouter()
  const bookId = params.id as string
  const [dedication, setDedication] = useState('')
  const [step, setStep] = useState<'options' | 'proof'>('options')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePrintSubmit = useCallback(
    async (config: PrintConfig) => {
      setIsSubmitting(true)
      try {
        const res = await fetch(`/api/books/${bookId}/print`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...config, dedication }),
        })
        if (res.ok) {
          setStep('proof')
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [bookId, dedication],
  )

  const handleApproveProof = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/books/${bookId}/print/approve`, {
        method: 'POST',
      })
      if (res.ok) {
        const { orderId } = await res.json()
        router.push(`/orders/${orderId}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [bookId, router])

  const handleRejectProof = useCallback(
    async (reason: string) => {
      await fetch(`/api/books/${bookId}/print/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      setStep('options')
    },
    [bookId],
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.back()}
        className={cn(
          'inline-flex items-center gap-2 text-sm font-medium',
          'text-slate-600 transition-colors hover:text-slate-900',
          'dark:text-slate-400 dark:hover:text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:rounded',
        )}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('backToBook')}
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          <Printer className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('printTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('printSubtitle')}
          </p>
        </div>
      </div>

      {step === 'options' ? (
        <div className="space-y-6">
          {/* Dedication */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <DedicationEditor value={dedication} onChange={setDedication} />
          </div>

          {/* Print options */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <PrintOptions
              onSubmit={handlePrintSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            {t('reviewProof')}
          </h2>
          <SoftProofViewer
            pages={[]}
            onApprove={handleApproveProof}
            onReject={handleRejectProof}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
    </div>
  )
}
