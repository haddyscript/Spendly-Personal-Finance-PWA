import { db } from '@/db/db'
import type { AppSettings } from '@/types/models'

const DEFAULTS: AppSettings = {
  id: 'settings',
  theme: 'system',
  currency: 'PHP',
  hasOnboarded: false,
  securityLock: 'none',
  installPromptDismissedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export async function getSettings(): Promise<AppSettings> {
  const settings = await db.settings.get('settings')
  return settings ?? DEFAULTS
}

export async function updateSettings(patch: Partial<Omit<AppSettings, 'id'>>): Promise<AppSettings> {
  const current = await getSettings()
  const updated: AppSettings = { ...current, ...patch, updatedAt: new Date().toISOString() }
  await db.settings.put(updated)
  return updated
}
