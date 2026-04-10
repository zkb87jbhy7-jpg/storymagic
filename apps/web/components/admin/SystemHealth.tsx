'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { Database, Cpu, Clock, Sparkles, RefreshCw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ---- Types ---------------------------------------------------------------

type ServiceStatus = 'healthy' | 'degraded' | 'down'

interface Service {
  key: string
  icon: LucideIcon
  status: ServiceStatus
  latencyMs: number
}

// ---- Styles --------------------------------------------------------------

const STATUS_INDICATOR: Record<ServiceStatus, string> = {
  healthy: 'bg-green-500',
  degraded: 'bg-amber-500',
  down: 'bg-red-500',
}

const STATUS_TEXT: Record<ServiceStatus, string> = {
  healthy: 'text-green-600 dark:text-green-400',
  degraded: 'text-amber-600 dark:text-amber-400',
  down: 'text-red-600 dark:text-red-400',
}

// ---- Component -----------------------------------------------------------

export function SystemHealth() {
  const t = useTranslations('admin.health')
  const [services, setServices] = useState<Service[]>([
    { key: 'database', icon: Database, status: 'healthy', latencyMs: 12 },
    { key: 'redis', icon: Cpu, status: 'healthy', latencyMs: 3 },
    { key: 'temporal', icon: Clock, status: 'healthy', latencyMs: 45 },
    { key: 'aiProviders', icon: Sparkles, status: 'healthy', latencyMs: 230 },
  ])
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function refresh() {
    setIsRefreshing(true)
    try {
      const res = await fetch('/api/admin/health')
      if (res.ok) {
        const data = (await res.json()) as {
          services: Array<{ key: string; status: ServiceStatus; latencyMs: number }>
        }
        setServices((prev) =>
          prev.map((svc) => {
            const update = data.services.find((s) => s.key === svc.key)
            return update
              ? { ...svc, status: update.status, latencyMs: update.latencyMs }
              : svc
          }),
        )
      }
    } catch {
      // Leave current state unchanged on error
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      void refresh()
    }, 30_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          {t('title')}
        </h3>
        <button
          type="button"
          onClick={refresh}
          disabled={isRefreshing}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5',
            'text-xs font-medium text-slate-600 transition-colors',
            'hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700',
            'disabled:opacity-50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          )}
        >
          <RefreshCw
            className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')}
            aria-hidden="true"
          />
          {t('refresh')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((svc) => {
          const Icon = svc.icon
          return (
            <div
              key={svc.key}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <Icon
                  className="h-5 w-5 text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {t(svc.key)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-block h-2.5 w-2.5 rounded-full',
                      STATUS_INDICATOR[svc.status],
                    )}
                    aria-hidden="true"
                  />
                  <span className={cn('text-xs font-medium', STATUS_TEXT[svc.status])}>
                    {t(`status_${svc.status}`)}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {svc.latencyMs}ms
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
