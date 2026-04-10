'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Play, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface TestResult {
  id: string
  name: string
  passed: boolean
  durationMs: number
  error?: string
}

type RunStatus = 'idle' | 'running' | 'done'

export function PromptTestRunner() {
  const t = useTranslations('admin.prompts.testRunner')
  const [status, setStatus] = useState<RunStatus>('idle')
  const [results, setResults] = useState<TestResult[]>([])
  const [promptVersionId, setPromptVersionId] = useState('')

  async function runTests() {
    if (!promptVersionId) return
    setStatus('running')
    setResults([])

    try {
      const res = await fetch('/api/admin/prompts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId: promptVersionId }),
      })

      if (!res.ok) throw new Error('Test run failed')

      const data = (await res.json()) as { results: TestResult[] }
      setResults(data.results)
    } catch {
      setResults([
        {
          id: 'err',
          name: t('connectionError'),
          passed: false,
          durationMs: 0,
          error: t('connectionErrorDesc'),
        },
      ])
    } finally {
      setStatus('done')
    }
  }

  const passCount = results.filter((r) => r.passed).length
  const failCount = results.filter((r) => !r.passed).length

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
        {t('title')}
      </h3>

      {/* Input + Run button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="prompt-version-id"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {t('versionId')}
          </label>
          <input
            id="prompt-version-id"
            type="text"
            value={promptVersionId}
            onChange={(e) => setPromptVersionId(e.target.value)}
            placeholder={t('versionIdPlaceholder')}
            className={cn(
              'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm',
              'text-slate-900 placeholder:text-slate-400',
              'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
              'dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500',
            )}
          />
        </div>
        <button
          type="button"
          onClick={runTests}
          disabled={status === 'running' || !promptVersionId}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2.5',
            'text-sm font-medium text-white transition-colors',
            'bg-primary-600 hover:bg-primary-700',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-primary-500 dark:hover:bg-primary-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          )}
        >
          {status === 'running' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4" aria-hidden="true" />
          )}
          {t('runTests')}
        </button>
      </div>

      {/* Summary */}
      {status === 'done' && results.length > 0 && (
        <div className="flex gap-4 text-sm">
          <span className="font-medium text-green-600 dark:text-green-400">
            {t('passed', { count: passCount })}
          </span>
          <span className="font-medium text-red-600 dark:text-red-400">
            {t('failed', { count: failCount })}
          </span>
        </div>
      )}

      {/* Results list */}
      {results.length > 0 && (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
          {results.map((result) => (
            <li
              key={result.id}
              className="flex items-start gap-3 px-4 py-3"
            >
              {result.passed ? (
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400"
                  aria-hidden="true"
                />
              ) : (
                <XCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {result.name}
                </p>
                {result.error && (
                  <p className="mt-0.5 text-sm text-red-600 dark:text-red-400">
                    {result.error}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                {result.durationMs}ms
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
