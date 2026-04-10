'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import type { FaceDetection } from '@/lib/face-detection/blazeface-client'

interface FaceDetectionOverlayProps {
  /** Source image to draw beneath the overlay. */
  imageSrc: string
  /** Detection results from BlazeFace. */
  faces: FaceDetection[]
  /** Natural width of the image. */
  imageWidth: number
  /** Natural height of the image. */
  imageHeight: number
  className?: string
}

/**
 * Canvas overlay that draws a green bounding box around each detected face
 * and displays a status label.
 */
export function FaceDetectionOverlay({
  imageSrc,
  faces,
  imageWidth,
  imageHeight,
  className,
}: FaceDetectionOverlayProps) {
  const t = useTranslations('children')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = imageWidth
      canvas.height = imageHeight
      ctx.clearRect(0, 0, imageWidth, imageHeight)
      ctx.drawImage(img, 0, 0, imageWidth, imageHeight)

      // Draw bounding boxes
      faces.forEach((face) => {
        const [x1, y1] = face.topLeft
        const [x2, y2] = face.bottomRight
        const w = x2 - x1
        const h = y2 - y1

        ctx.strokeStyle = '#22c55e' // green-500
        ctx.lineWidth = Math.max(2, Math.min(imageWidth, imageHeight) * 0.005)
        ctx.strokeRect(x1, y1, w, h)

        // Confidence label
        const label = `${Math.round(face.probability * 100)}%`
        ctx.font = `bold ${Math.max(12, imageWidth * 0.025)}px sans-serif`
        ctx.fillStyle = '#22c55e'
        const textMetrics = ctx.measureText(label)
        const textH = Math.max(12, imageWidth * 0.025) + 4
        ctx.fillRect(x1, y1 - textH, textMetrics.width + 8, textH)
        ctx.fillStyle = '#ffffff'
        ctx.fillText(label, x1 + 4, y1 - 4)
      })
    }
    img.src = imageSrc
  }, [imageSrc, faces, imageWidth, imageHeight])

  const detected = faces.length > 0

  return (
    <div className={cn('relative', className)}>
      <canvas
        ref={canvasRef}
        className="h-auto w-full rounded-lg"
        aria-label={detected ? t('faceDetected') : t('noFaceDetected')}
      />
      <span
        className={cn(
          'absolute bottom-2 start-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm',
          detected
            ? 'bg-green-600/80 text-white'
            : 'bg-red-600/80 text-white',
        )}
      >
        {detected ? t('faceDetected') : t('noFaceDetected')}
      </span>
    </div>
  )
}
