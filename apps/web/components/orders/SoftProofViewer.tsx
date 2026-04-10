'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ProofPage {
  url: string
  pageNumber: number
}

interface SoftProofViewerProps {
  pages: ProofPage[]
  onApprove: () => void | Promise<void>
  onReject: (reason: string) => void | Promise<void>
  isSubmitting?: boolean
  className?: string
}

export function SoftProofViewer({
  pages,
  onApprove,
  onReject,
  isSubmitting = false,
  className,
}: SoftProofViewerProps) {
  const t = useTranslations('orders')
  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(3, z + 0.25))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.5, z - 0.25))
  }, [])

  const handleResetZoom = useCallback(() => {
    setZoom(1)
  }, [])

  const handleReject = useCallback(async () => {
    if (!rejectReason.trim()) return
    await onReject(rejectReason.trim())
    setShowRejectForm(false)
    setRejectReason('')
  }, [rejectReason, onReject])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className={cn(
              'rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100',
              'dark:text-slate-400 dark:hover:bg-slate-700',
              'disabled:opacity-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            )}
            aria-label={t('zoomOut')}
          >
            <ZoomOut className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="min-w-[3rem] text-center text-sm font-medium text-slate-600 dark:text-slate-400">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className={cn(
              'rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100',
              'dark:text-slate-400 dark:hover:bg-slate-700',
              'disabled:opacity-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            )}
            aria-label={t('zoomIn')}
          >
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className={cn(
              'rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100',
              'dark:text-slate-400 dark:hover:bg-slate-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            )}
            aria-label={t('resetZoom')}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className={cn(
              'rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100',
              'dark:text-slate-400 dark:hover:bg-slate-700',
              'disabled:opacity-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            )}
            aria-label={t('previousPage')}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t('pageOf', { current: currentPage + 1, total: pages.length })}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
            disabled={currentPage === pages.length - 1}
            className={cn(
              'rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100',
              'dark:text-slate-400 dark:hover:bg-slate-700',
              'disabled:opacity-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            )}
            aria-label={t('nextPage')}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Image viewer */}
      <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex min-h-[400px] items-center justify-center p-4">
          {pages.length > 0 ? (
            <img
              src={pages[currentPage]?.url}
              alt={t('proofPage', { number: currentPage + 1 })}
              className="max-w-full transition-transform"
              style={{ transform: `scale(${zoom})` }}
            />
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('noProofPages')}
            </p>
          )}
        </div>
      </div>

      {/* Approve / Reject buttons */}
      {showRejectForm ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-800/50 dark:bg-red-900/10">
          <label
            htmlFor="reject-reason"
            className="block text-sm font-medium text-red-800 dark:text-red-300"
          >
            {t('rejectReason')}
          </label>
          <textarea
            id="reject-reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder={t('rejectReasonPlaceholder')}
            className={cn(
              'mt-2 w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm',
              'text-slate-900 placeholder:text-slate-400',
              'dark:border-red-800 dark:bg-slate-900 dark:text-white',
              'focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20',
            )}
          />
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={handleReject}
              disabled={!rejectReason.trim() || isSubmitting}
              className={cn(
                'rounded-xl px-5 py-2.5 text-sm font-semibold',
                'bg-red-600 text-white transition-colors hover:bg-red-700',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
              )}
            >
              {t('confirmReject')}
            </button>
            <button
              type="button"
              onClick={() => setShowRejectForm(false)}
              className={cn(
                'rounded-xl px-5 py-2.5 text-sm font-medium',
                'border border-red-300 text-red-700 transition-colors hover:bg-red-100',
                'dark:border-red-700 dark:text-red-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
              )}
            >
              {t('cancelReject')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onApprove}
            disabled={isSubmitting || pages.length === 0}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold',
              'bg-green-600 text-white transition-colors hover:bg-green-700',
              'dark:bg-green-500 dark:hover:bg-green-600',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-slate-900',
            )}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {t('approveProof')}
          </button>
          <button
            type="button"
            onClick={() => setShowRejectForm(true)}
            disabled={isSubmitting || pages.length === 0}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold',
              'border border-red-200 text-red-600 transition-colors hover:bg-red-50',
              'dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
            )}
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            {t('rejectProof')}
          </button>
        </div>
      )}
    </div>
  )
}
