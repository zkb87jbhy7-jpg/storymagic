// ---------------------------------------------------------------------------
// Web Vitals collection — uses the web-vitals library (loaded dynamically)
// to report LCP, CLS, and INP metrics to our analytics API.
// ---------------------------------------------------------------------------

export interface VitalMetric {
  name: 'LCP' | 'CLS' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

type OnVitalCallback = (metric: VitalMetric) => void

const REPORT_ENDPOINT = '/api/analytics/web-vitals'

/** Send a collected vital to the server. */
async function reportVital(metric: VitalMetric): Promise<void> {
  try {
    await fetch(REPORT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
      keepalive: true,
    })
  } catch {
    // Reporting is best-effort — swallow failures
  }
}

/**
 * Initialise web-vitals collection. Call once in the app root.
 * The web-vitals library is dynamically imported so it does not increase the
 * initial bundle size.
 */
export async function initWebVitals(
  onVital?: OnVitalCallback,
): Promise<void> {
  try {
    // Dynamic import — tree-shakes when not used
    const { onLCP, onCLS, onINP } = await import('web-vitals')

    const handle = (name: VitalMetric['name']) => {
      return (entry: { value: number; rating: string }) => {
        const metric: VitalMetric = {
          name,
          value: entry.value,
          rating: entry.rating as VitalMetric['rating'],
        }
        onVital?.(metric)
        void reportVital(metric)
      }
    }

    onLCP(handle('LCP'))
    onCLS(handle('CLS'))
    onINP(handle('INP'))
  } catch {
    // web-vitals not installed or browser unsupported
  }
}

/** Retrieve the latest stored metric values (for dev overlay). */
export function getStoredVitals(): VitalMetric[] {
  const stored: VitalMetric[] = []
  try {
    const raw = sessionStorage.getItem('storymagic:web-vitals')
    if (raw) return JSON.parse(raw) as VitalMetric[]
  } catch {
    // ignore
  }
  return stored
}

/** Persist a metric into session storage for dev overlay consumption. */
export function storeVital(metric: VitalMetric): void {
  try {
    const existing = getStoredVitals()
    const idx = existing.findIndex((m) => m.name === metric.name)
    if (idx >= 0) existing[idx] = metric
    else existing.push(metric)
    sessionStorage.setItem('storymagic:web-vitals', JSON.stringify(existing))
  } catch {
    // ignore
  }
}
