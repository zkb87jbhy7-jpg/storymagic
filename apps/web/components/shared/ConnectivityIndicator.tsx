'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { WifiOff, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useConnectivity } from '@/hooks/useConnectivity'

/**
 * Banner that appears when the user goes offline ("You're offline" — yellow)
 * or comes back online ("Back online! Syncing..." — green). The "back online"
 * banner auto-dismisses after a few seconds.
 */
export function ConnectivityIndicator() {
  const t = useTranslations('connectivity')
  const { isOnline, wasOffline } = useConnectivity()
  const [showReconnected, setShowReconnected] = useState(false)

  // When connection restores, show the green banner briefly
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true)
      const timer = setTimeout(() => setShowReconnected(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  // Nothing to show when online and no recent reconnect
  if (isOnline && !showReconnected) return null

  const offline = !isOnline

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium shadow-md transition-all duration-300',
        offline
          ? 'bg-amber-500 text-white'
          : 'bg-green-500 text-white',
      )}
    >
      {offline ? (
        <>
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          <span>{t('offline')}</span>
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4" aria-hidden="true" />
          <span>{t('backOnline')}</span>
        </>
      )}
    </div>
  )
}
