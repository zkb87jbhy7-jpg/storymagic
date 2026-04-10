'use client'

import { useCallback, useRef, useState } from 'react'
import type { FaceDetection } from '@/lib/face-detection/blazeface-client'

interface UseFaceDetectionReturn {
  /** Run face detection on the given image element. */
  detect: (
    imageEl: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
  ) => Promise<FaceDetection[]>
  /** Faces found during the most recent `detect` call. */
  faces: FaceDetection[]
  /** `true` while the model is loading or inference is running. */
  isLoading: boolean
  /** The last error encountered, if any. */
  error: Error | null
}

/**
 * Hook that wraps the BlazeFace client.
 *
 * The model is loaded lazily on the first invocation of `detect`.
 */
export function useFaceDetection(): UseFaceDetectionReturn {
  const [faces, setFaces] = useState<FaceDetection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Keep a stable reference so callers can rely on identity equality.
  const modelLoadedRef = useRef(false)

  const detect = useCallback(
    async (
      imageEl: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    ): Promise<FaceDetection[]> => {
      setIsLoading(true)
      setError(null)

      try {
        // Dynamic import keeps the TF.js bundle out of the initial load.
        const { loadModel, detectFaces } = await import(
          '@/lib/face-detection/blazeface-client'
        )

        if (!modelLoadedRef.current) {
          await loadModel()
          modelLoadedRef.current = true
        }

        const results = await detectFaces(imageEl)
        setFaces(results)
        return results
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err))
        setError(e)
        setFaces([])
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  return { detect, faces, isLoading, error }
}
