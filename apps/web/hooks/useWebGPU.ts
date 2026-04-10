'use client'

import { useState, useEffect } from 'react'

interface UseWebGPUReturn {
  isSupported: boolean
  adapter: GPUAdapter | null
  isChecking: boolean
}

export function useWebGPU(): UseWebGPUReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [adapter, setAdapter] = useState<GPUAdapter | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function checkWebGPU() {
      try {
        if (!navigator.gpu) {
          setIsSupported(false)
          setIsChecking(false)
          return
        }

        const gpuAdapter = await navigator.gpu.requestAdapter()
        if (cancelled) return

        if (gpuAdapter) {
          setAdapter(gpuAdapter)
          setIsSupported(true)
        } else {
          setIsSupported(false)
        }
      } catch {
        if (!cancelled) {
          setIsSupported(false)
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false)
        }
      }
    }

    checkWebGPU()

    return () => {
      cancelled = true
    }
  }, [])

  return { isSupported, adapter, isChecking }
}
