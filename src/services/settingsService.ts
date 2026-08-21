import { db } from '@/db/db'
import type { AppSettings } from '@/types/models'

const DEFAULTS: AppSettings = {
  id: 'settings',
  theme: 'system',
  currency: 'PHP',
  hasOnboarded: false,
  securityLock: 'none',
  installPromptDismissedAt: null,
  notificationsEnabled: true,
  voiceFeedbackEnabled: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export async function getSettings(): Promise<AppSettings> {
  const settings = await db.settings.get('settings')
  // Merge over DEFAULTS (rather than returning the stored record as-is) so fields added after
  // a user already has a settings row — like voiceFeedbackEnabled — fall back sanely instead
  // of silently reading as undefined/falsy.
  return settings ? { ...DEFAULTS, ...settings } : DEFAULTS
}

export async function updateSettings(patch: Partial<Omit<AppSettings, 'id'>>): Promise<AppSettings> {
  const current = await getSettings()
  const updated: AppSettings = { ...current, ...patch, updatedAt: new Date().toISOString() }
  await db.settings.put(updated)
  return updated
}
