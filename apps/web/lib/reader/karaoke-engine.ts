// Karaoke word timing engine
// Calculates word timings from text length and audio duration

export interface WordTiming {
  word: string
  startMs: number
  endMs: number
  index: number
}

/**
 * Calculate word timings based on text and audio duration.
 * Words are weighted by character count so longer words get more time.
 */
export function calculateTimings(text: string, durationMs: number): WordTiming[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  // Weight each word by character length + a base constant
  const BASE_WEIGHT = 2
  const totalWeight = words.reduce((sum, w) => sum + w.length + BASE_WEIGHT, 0)

  // Reserve small gaps between words (5% of total duration)
  const gapTotal = durationMs * 0.05
  const gapPerWord = words.length > 1 ? gapTotal / (words.length - 1) : 0
  const activeDuration = durationMs - gapTotal

  const timings: WordTiming[] = []
  let currentMs = 0

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const weight = word.length + BASE_WEIGHT
    const wordDuration = (weight / totalWeight) * activeDuration
    const startMs = currentMs
    const endMs = startMs + wordDuration

    timings.push({
      word,
      startMs: Math.round(startMs),
      endMs: Math.round(endMs),
      index: i,
    })

    currentMs = endMs + gapPerWord
  }

  return timings
}

/**
 * Get the index of the current word based on elapsed time.
 * Returns -1 if no word is active (before first or after last).
 */
export function getCurrentWordIndex(timings: WordTiming[], elapsedMs: number): number {
  if (timings.length === 0) return -1

  for (let i = 0; i < timings.length; i++) {
    if (elapsedMs >= timings[i].startMs && elapsedMs <= timings[i].endMs) {
      return i
    }
  }

  // If between words, return the next word if close enough
  for (let i = 0; i < timings.length - 1; i++) {
    if (elapsedMs > timings[i].endMs && elapsedMs < timings[i + 1].startMs) {
      return i // Keep highlighting the previous word in gaps
    }
  }

  // Past the last word
  if (timings.length > 0 && elapsedMs > timings[timings.length - 1].endMs) {
    return timings.length - 1
  }

  return -1
}
