'use client'

import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
} from 'react'
import { useTranslations } from 'next-intl'
import { Upload, Camera, X, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useFaceDetection } from '@/hooks/useFaceDetection'
import { useFaceQuality } from '@/hooks/useFaceQuality'
import { FaceDetectionOverlay } from './FaceDetectionOverlay'
import { FaceQualityFeedback } from './FaceQualityFeedback'
import type { FaceDetection as FaceDetectionResult } from '@/lib/face-detection/blazeface-client'
import type { QualityScores } from '@/lib/face-detection/quality-scorer'

const MAX_PHOTOS = 5
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface PhotoEntry {
  id: string
  file: File
  previewUrl: string
  faces: FaceDetectionResult[]
  quality: QualityScores | null
  imageWidth: number
  imageHeight: number
}

interface PhotoUploaderProps {
  photos: PhotoEntry[]
  onChange: (photos: PhotoEntry[]) => void
  className?: string
}

/**
 * Drag-and-drop zone accepting 1-5 images with face detection + quality feedback.
 */
export function PhotoUploader({
  photos,
  onChange,
  className,
}: PhotoUploaderProps) {
  const t = useTranslations('children')
  const tCommon = useTranslations('common')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const { detect, isLoading } = useFaceDetection()

  const processFile = useCallback(
    async (file: File): Promise<PhotoEntry | null> => {
      if (!ACCEPTED_TYPES.includes(file.type)) return null

      return new Promise((resolve) => {
        const url = URL.createObjectURL(file)
        const img = new Image()
        img.onload = async () => {
          let faces: FaceDetectionResult[] = []
          let quality: QualityScores | null = null

          try {
            faces = await detect(img)

            // Build a canvas for brightness analysis
            const canvas = document.createElement('canvas')
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(img, 0, 0)
            }

            const { scoreFaceQuality } = await import(
              '@/lib/face-detection/quality-scorer'
            )
            quality = scoreFaceQuality(
              faces,
              img.naturalWidth,
              img.naturalHeight,
              canvas,
            )
          } catch {
            // Face detection failed — still allow the photo
          }

          resolve({
            id: crypto.randomUUID(),
            file,
            previewUrl: url,
            faces,
            quality,
            imageWidth: img.naturalWidth,
            imageHeight: img.naturalHeight,
          })
        }
        img.onerror = () => resolve(null)
        img.src = url
      })
    },
    [detect],
  )

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const remaining = MAX_PHOTOS - photos.length
      if (remaining <= 0) return

      const selected = Array.from(files).slice(0, remaining)
      const entries = await Promise.all(selected.map(processFile))
      const valid = entries.filter(Boolean) as PhotoEntry[]

      if (valid.length > 0) {
        onChange([...photos, ...valid])
      }
    },
    [photos, onChange, processFile],
  )

  const removePhoto = useCallback(
    (id: string) => {
      const entry = photos.find((p) => p.id === id)
      if (entry) URL.revokeObjectURL(entry.previewUrl)
      onChange(photos.filter((p) => p.id !== id))
    },
    [photos, onChange],
  )

  // ---- Drag events ----
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      if (e.dataTransfer.files.length) {
        addFiles(e.dataTransfer.files)
      }
    },
    [addFiles],
  )

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        addFiles(e.target.files)
        e.target.value = ''
      }
    },
    [addFiles],
  )

  const canAdd = photos.length < MAX_PHOTOS

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          isDragOver
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
            : 'border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50',
          !canAdd && 'pointer-events-none opacity-50',
        )}
      >
        <ImagePlus
          className="mb-3 h-10 w-10 text-slate-400 dark:text-slate-500"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('uploadPhotos')}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {t('photoHint')}
        </p>

        {/* Action buttons */}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canAdd || isLoading}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              'bg-primary-600 text-white hover:bg-primary-700',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-slate-900',
            )}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            {t('uploadPhotos')}
          </button>

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={!canAdd || isLoading}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
              'dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-slate-900',
            )}
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            Take Photo
          </button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {tCommon('loading')}
        </p>
      )}

      {/* Photo thumbnails */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {photos.map((photo) => (
            <PhotoThumbnail
              key={photo.id}
              photo={photo}
              onRemove={() => removePhoto(photo.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Thumbnail card                                                     */
/* ------------------------------------------------------------------ */

function PhotoThumbnail({
  photo,
  onRemove,
}: {
  photo: PhotoEntry
  onRemove: () => void
}) {
  const tCommon = useTranslations('common')

  const quality = useFaceQuality({
    faces: photo.faces,
    imageWidth: photo.imageWidth,
    imageHeight: photo.imageHeight,
  })

  return (
    <div className="relative space-y-2">
      <FaceDetectionOverlay
        imageSrc={photo.previewUrl}
        faces={photo.faces}
        imageWidth={photo.imageWidth}
        imageHeight={photo.imageHeight}
        className="overflow-hidden rounded-lg"
      />

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={tCommon('delete')}
        className={cn(
          'absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full',
          'bg-red-600/80 text-white backdrop-blur-sm transition-colors hover:bg-red-700',
        )}
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <FaceQualityFeedback quality={quality} />
    </div>
  )
}
