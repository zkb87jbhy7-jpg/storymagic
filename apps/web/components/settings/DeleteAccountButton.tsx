'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Trash2, AlertTriangle } from 'lucide-react'
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog'
import { cn } from '@/lib/utils/cn'

export function DeleteAccountButton() {
  const t = useTranslations('settings.privacy')
  const tCommon = useTranslations('common')
  const [dialogOpen, setDialogOpen] = useState(false)

  async function handleDelete() {
    try {
      await fetch('/api/settings/delete-account', { method: 'DELETE' })
      // On success the server will invalidate the session and redirect
      window.location.href = '/'
    } catch {
      // Error handling would go here
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg px-5 py-2.5',
          'text-sm font-medium text-white transition-colors',
          'bg-red-600 hover:bg-red-700',
          'dark:bg-red-600 dark:hover:bg-red-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-slate-900',
        )}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        {t('deleteAccount')}
      </button>

      <ConfirmationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDelete}
        title={t('deleteAccountTitle')}
        description={t('deleteAccountWarning')}
        confirmLabel={t('deleteAccountConfirm')}
        cancelLabel={tCommon('cancel')}
        variant="danger"
      />

      {/* Explanatory text below the button */}
      <div
        className={cn(
          'mt-4 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4',
          'dark:border-red-900/50 dark:bg-red-900/20',
        )}
      >
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
          aria-hidden="true"
        />
        <div className="space-y-2 text-sm text-red-800 dark:text-red-300">
          <p className="font-medium">{t('deleteConsequencesTitle')}</p>
          <ul className="list-inside list-disc space-y-1 text-start">
            <li>{t('deleteConsequence1')}</li>
            <li>{t('deleteConsequence2')}</li>
            <li>{t('deleteConsequence3')}</li>
            <li>{t('cryptoShredding')}</li>
          </ul>
        </div>
      </div>
    </>
  )
}
