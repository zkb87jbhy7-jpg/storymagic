// ---------------------------------------------------------------------------
// DraftRecoveryManager — persists in-progress work to localStorage so users
// never lose drafts due to crashes, navigation, or network issues.
// ---------------------------------------------------------------------------

const PREFIX = 'storymagic:draft:'

export interface DraftEntry<T = unknown> {
  key: string
  data: T
  savedAt: number // epoch ms
}

export class DraftRecoveryManager {
  /** Persist data under the given key. */
  static save<T>(key: string, data: T): void {
    try {
      const entry: DraftEntry<T> = {
        key,
        data,
        savedAt: Date.now(),
      }
      localStorage.setItem(PREFIX + key, JSON.stringify(entry))
    } catch {
      // localStorage may be full or unavailable — fail silently
    }
  }

  /** Retrieve a previously saved draft, or null if none exists. */
  static load<T>(key: string): DraftEntry<T> | null {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      if (!raw) return null
      return JSON.parse(raw) as DraftEntry<T>
    } catch {
      return null
    }
  }

  /** Remove a single draft. */
  static clear(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key)
    } catch {
      // ignore
    }
  }

  /** List all stored draft keys (without the prefix). */
  static list(): string[] {
    const keys: string[] = []
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k?.startsWith(PREFIX)) {
          keys.push(k.slice(PREFIX.length))
        }
      }
    } catch {
      // ignore
    }
    return keys
  }

  /** Remove drafts older than the given age in milliseconds. */
  static prune(maxAgeMs: number): void {
    const cutoff = Date.now() - maxAgeMs
    for (const key of DraftRecoveryManager.list()) {
      const entry = DraftRecoveryManager.load(key)
      if (entry && entry.savedAt < cutoff) {
        DraftRecoveryManager.clear(key)
      }
    }
  }
}
