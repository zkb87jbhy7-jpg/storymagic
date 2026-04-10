'use client'

/**
 * BlazeFace client — lazy-singleton wrapper around @tensorflow-models/blazeface.
 *
 * Because the TF.js + BlazeFace packages are heavy we load them dynamically
 * at runtime only once the first detection is requested.
 */

export interface FaceDetection {
  topLeft: [number, number]
  bottomRight: [number, number]
  landmarks: Array<[number, number]>
  probability: number
}

type BlazeFaceModel = {
  estimateFaces: (
    input: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    returnTensors?: boolean,
  ) => Promise<Array<{
    topLeft: number[] | Float32Array
    bottomRight: number[] | Float32Array
    landmarks: Array<number[] | Float32Array>
    probability: number[] | Float32Array
  }>>
}

let modelPromise: Promise<BlazeFaceModel> | null = null

/**
 * Load (or return the already-loading) BlazeFace model.
 * The first call triggers the dynamic import; subsequent calls return the
 * same promise so the model is a lazy singleton.
 */
export async function loadModel(): Promise<BlazeFaceModel> {
  if (modelPromise) return modelPromise

  modelPromise = (async () => {
    // Dynamic import to keep the main bundle lean
    const tf = await import('@tensorflow/tfjs')
    await tf.ready()
    const blazeface = await import('@tensorflow-models/blazeface')
    const model = await blazeface.load()
    return model as unknown as BlazeFaceModel
  })()

  return modelPromise
}

/**
 * Run face detection on the given image element.
 *
 * @returns Normalised array of `FaceDetection` objects.
 */
export async function detectFaces(
  imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
): Promise<FaceDetection[]> {
  const model = await loadModel()
  const rawPredictions = await model.estimateFaces(imageElement, false)

  return rawPredictions.map((pred) => {
    const toTuple = (v: number[] | Float32Array): [number, number] => [
      Number(v[0]),
      Number(v[1]),
    ]

    return {
      topLeft: toTuple(pred.topLeft),
      bottomRight: toTuple(pred.bottomRight),
      landmarks: (pred.landmarks ?? []).map((l) => toTuple(l)),
      probability: Number(
        Array.isArray(pred.probability)
          ? pred.probability[0]
          : pred.probability[0],
      ),
    }
  })
}
