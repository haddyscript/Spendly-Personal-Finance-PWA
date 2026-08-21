import { liveQuery } from 'dexie'
import { getSettings } from '@/services/settingsService'
import type { AppSettings } from '@/types/models'

/**
 * A synchronously-readable mirror of AppSettings, kept warm via a live query. Exists because
 * some consumers (speech.ts) must call browser APIs like speechSynthesis.speak() in the same
 * tick as a user gesture — awaiting an IndexedDB read first causes browsers (notably Safari)
 * to silently drop the call, since it no longer counts as "triggered by user interaction".
 */
let cached: AppSettings | null = null

export function getCachedSettings(): AppSettings | null {
  return cached
}

export function startSettingsCache(): void {
  liveQuery(() => getSettings()).subscribe({
    next: (settings) => {
      cached = settings
    },
  })
}
