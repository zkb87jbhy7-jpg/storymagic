'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Download, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type ExportStatus = 'idle' | 'preparing' | 'downloading' | 'done' | 'error'

export function DataExportButton() {
  const t = useTranslations('settings.privacy')
  const [status, setStatus] = useState<ExportStatus>('idle')
  const [progress, setProgress] = useState(0)

  async function handleExport() {
    setStatus('preparing')
    setProgress(0)

    try {
      // Request data export
      const res = await fetch('/api/settings/export-data', { method: 'POST' })
      if (!res.ok) throw new Error('Export request failed')

      setStatus('downloading')

      // Simulate download progress (real implementation would use SSE or polling)
      for (let i = 1; i <= 10; i++) {
        await new Promise((r) => setTimeout(r, 300))
        setProgress(i * 10)
      }

      // Trigger browser download
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `storymagic-data-${Date.now()}.zip`
      anchor.click()
      URL.revokeObjectURL(url)

      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const isWorking = status === 'preparing' || status === 'downloading'

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleExport}
        disabled={isWorking}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg px-5 py-2.5',
          'text-sm font-medium transition-colors',
          'border border-slate-300 bg-white text-slate-700',
          'hover:bg-slate-50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300',
          'dark:hover:bg-slate-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-slate-900',
        )}
      >
        {isWorking ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : status === 'done' ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
        ) : (
          <Download className="h-4 w-4" aria-hidden="true" />
        )}
        {t('downloadMyData')}
      </button>

      {/* Progress bar */}
      {isWorking && (
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-primary-600 transition-all duration-300 dark:bg-primary-400"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {status === 'preparing' ? t('preparingExport') : t('downloadingData')}
            {' — '}
            {progress}%
          </p>
        </div>
      )}

      {status === 'done' && (
        <p className="text-sm font-medium text-green-600 dark:text-green-400">
          {t('exportComplete')}
        </p>
      )}

      {status === 'error' && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {t('exportError')}
        </p>
      )}
    </div>
  )
}
