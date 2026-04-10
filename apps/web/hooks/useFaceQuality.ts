'use client'

import { useMemo } from 'react'
import type { FaceDetection } from '@/lib/face-detection/blazeface-client'
import { scoreFaceQuality, type QualityScores } from '@/lib/face-detection/quality-scorer'

interface UseFaceQualityOptions {
  faces: FaceDetection[]
  imageWidth: number
  imageHeight: number
  brightnessCanvas?: HTMLCanvasElement | null
}

/**
 * Derives a quality assessment from an array of face detections and image
 * dimensions.  Re-computes only when its inputs change.
 */
export function useFaceQuality({
  faces,
  imageWidth,
  imageHeight,
  brightnessCanvas,
}: UseFaceQualityOptions): QualityScores {
  return useMemo(
    () =>
      scoreFaceQuality(
        faces,
        imageWidth,
        imageHeight,
        brightnessCanvas ?? undefined,
      ),
    [faces, imageWidth, imageHeight, brightnessCanvas],
  )
}
