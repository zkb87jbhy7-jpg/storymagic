'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseConnectivityReturn {
  /** Whether the browser is currently online. */
  isOnline: boolean
  /** True once the connection has been restored after being offline. */
  wasOffline: boolean
}

/**
 * Tracks browser connectivity using `navigator.onLine` and the
 * `online` / `offline` window events.
 */
export function useConnectivity(): UseConnectivityReturn {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )
  const [wasOffline, setWasOffline] = useState(false)

  const handleOnline = useCallback(() => {
    setIsOnline(true)
    setWasOffline(true)
  }, [])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
  }, [])

  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  return { isOnline, wasOffline }
}
