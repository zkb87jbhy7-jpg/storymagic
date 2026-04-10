import type { FaceDetection } from './blazeface-client'

export interface QualityScores {
  /** At least one face was detected with adequate confidence. */
  faceDetected: boolean
  /** The detected face is within the center 60 % of the image. */
  faceCentered: boolean
  /** The face bounding-box covers at least 20 % of the total image area. */
  faceLargeEnough: boolean
  /** Average brightness of the face region is acceptable. */
  goodLighting: boolean
  /** All individual checks pass. */
  overallGood: boolean
}

const CONFIDENCE_THRESHOLD = 0.75
const CENTER_RATIO = 0.6 // face centre must be within the middle 60 %
const MIN_FACE_AREA_RATIO = 0.04 // 20 % of width * 20 % of height = 4 %
const MIN_BRIGHTNESS = 60
const MAX_BRIGHTNESS = 230

/**
 * Assess the quality of a single face detection against the source image.
 */
export function scoreFaceQuality(
  faces: FaceDetection[],
  imageWidth: number,
  imageHeight: number,
  brightnessCanvas?: HTMLCanvasElement,
): QualityScores {
  // ---- face detected ----
  const validFaces = faces.filter((f) => f.probability >= CONFIDENCE_THRESHOLD)
  const faceDetected = validFaces.length > 0

  if (!faceDetected) {
    return {
      faceDetected: false,
      faceCentered: false,
      faceLargeEnough: false,
      goodLighting: false,
      overallGood: false,
    }
  }

  // Use the highest-confidence face for scoring.
  const face = validFaces.reduce((best, curr) =>
    curr.probability > best.probability ? curr : best,
  )

  // ---- face centered ----
  const faceCenterX = (face.topLeft[0] + face.bottomRight[0]) / 2
  const faceCenterY = (face.topLeft[1] + face.bottomRight[1]) / 2

  const margin = (1 - CENTER_RATIO) / 2
  const faceCentered =
    faceCenterX >= imageWidth * margin &&
    faceCenterX <= imageWidth * (1 - margin) &&
    faceCenterY >= imageHeight * margin &&
    faceCenterY <= imageHeight * (1 - margin)

  // ---- face large enough ----
  const faceWidth = Math.abs(face.bottomRight[0] - face.topLeft[0])
  const faceHeight = Math.abs(face.bottomRight[1] - face.topLeft[1])
  const faceArea = faceWidth * faceHeight
  const imageArea = imageWidth * imageHeight
  const faceLargeEnough = faceArea / imageArea >= MIN_FACE_AREA_RATIO

  // ---- good lighting (via canvas pixel sampling) ----
  let goodLighting = true
  if (brightnessCanvas) {
    const ctx = brightnessCanvas.getContext('2d', { willReadFrequently: true })
    if (ctx) {
      const sx = Math.max(0, Math.floor(face.topLeft[0]))
      const sy = Math.max(0, Math.floor(face.topLeft[1]))
      const sw = Math.min(
        Math.ceil(faceWidth),
        brightnessCanvas.width - sx,
      )
      const sh = Math.min(
        Math.ceil(faceHeight),
        brightnessCanvas.height - sy,
      )

      if (sw > 0 && sh > 0) {
        const imageData = ctx.getImageData(sx, sy, sw, sh)
        const pixels = imageData.data
        let totalBrightness = 0
        const pixelCount = pixels.length / 4

        for (let i = 0; i < pixels.length; i += 4) {
          // Perceived brightness: 0.299 R + 0.587 G + 0.114 B
          totalBrightness +=
            0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]
        }

        const avgBrightness = totalBrightness / pixelCount
        goodLighting =
          avgBrightness >= MIN_BRIGHTNESS && avgBrightness <= MAX_BRIGHTNESS
      }
    }
  }

  return {
    faceDetected,
    faceCentered,
    faceLargeEnough,
    goodLighting,
    overallGood: faceDetected && faceCentered && faceLargeEnough && goodLighting,
  }
}
