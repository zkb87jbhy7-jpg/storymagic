// ---------------------------------------------------------------------------
// EventTracker — queues analytics events and flushes them to the API in
// batches to minimise network overhead.
// ---------------------------------------------------------------------------

export interface AnalyticsEvent {
  name: string
  properties: Record<string, unknown>
  timestamp: number
}

interface EventTrackerConfig {
  endpoint: string
  batchSize: number
  flushIntervalMs: number
}

const DEFAULT_CONFIG: EventTrackerConfig = {
  endpoint: '/api/analytics/events',
  batchSize: 20,
  flushIntervalMs: 10_000,
}

class EventTrackerSingleton {
  private queue: AnalyticsEvent[] = []
  private timer: ReturnType<typeof setInterval> | null = null
  private config: EventTrackerConfig

  constructor(config: Partial<EventTrackerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /** Enqueue an event. Auto-flushes when batch size is reached. */
  track(name: string, properties: Record<string, unknown> = {}): void {
    this.queue.push({ name, properties, timestamp: Date.now() })

    if (this.queue.length >= this.config.batchSize) {
      void this.flush()
    }

    this.ensureTimer()
  }

  /** Send all queued events to the API. */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return

    const batch = this.queue.splice(0, this.config.batchSize)

    try {
      const res = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      })

      if (!res.ok) {
        // Put events back at the front of the queue for retry
        this.queue.unshift(...batch)
      }
    } catch {
      // Network failure — re-queue
      this.queue.unshift(...batch)
    }
  }

  /** Start the periodic flush timer (idempotent). */
  private ensureTimer(): void {
    if (this.timer) return
    this.timer = setInterval(() => {
      void this.flush()
    }, this.config.flushIntervalMs)
  }

  /** Stop the timer and flush remaining events. */
  async dispose(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    await this.flush()
  }
}

/** Singleton instance used app-wide. */
export const eventTracker = new EventTrackerSingleton()

export { EventTrackerSingleton }
