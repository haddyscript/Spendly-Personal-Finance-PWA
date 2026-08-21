import { db } from '@/db/db'
import type { SpendlyExport } from '@/types/models'
import { validateSpendlyExport } from '@/utils/validation'
import { DEFAULT_CATEGORIES } from '@/db/defaultCategories'

export async function exportAllData(): Promise<SpendlyExport> {
  const [transactions, categories, budgets, goals, recurring, settings] = await Promise.all([
    db.transactions.toArray(),
    db.categories.toArray(),
    db.budgets.toArray(),
    db.goals.toArray(),
    db.recurring.toArray(),
    db.settings.toArray(),
  ])

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
    categories,
    budgets,
    goals,
    recurring,
    settings,
  }
}

export function downloadExport(data: SpendlyExport): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const dateStamp = data.exportedAt.slice(0, 10)
  a.href = url
  a.download = `spendly-backup-${dateStamp}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export interface ImportResult {
  success: boolean
  errors: string[]
}

/** Replaces all local data with the imported data. Caller is responsible for confirming with the user first. */
export async function importData(raw: unknown): Promise<ImportResult> {
  const result = validateSpendlyExport(raw)
  if (!result.valid || !result.data) {
    return { success: false, errors: result.errors }
  }

  const { transactions, categories, budgets, goals, recurring, settings } = result.data

  await db.transaction(
    'rw',
    [db.transactions, db.categories, db.budgets, db.goals, db.recurring, db.settings],
    async () => {
      await Promise.all([
        db.transactions.clear(),
        db.categories.clear(),
        db.budgets.clear(),
        db.goals.clear(),
        db.recurring.clear(),
        db.settings.clear(),
      ])

      await Promise.all([
        db.transactions.bulkAdd(transactions),
        db.categories.bulkAdd(categories),
        db.budgets.bulkAdd(budgets),
        db.goals.bulkAdd(goals),
        db.recurring.bulkAdd(recurring),
        settings.length > 0 ? db.settings.bulkAdd(settings) : Promise.resolve(),
      ])
    },
  )

  return { success: true, errors: [] }
}

export async function clearAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [db.transactions, db.categories, db.budgets, db.goals, db.recurring, db.settings],
    async () => {
      await Promise.all([
        db.transactions.clear(),
        db.categories.clear(),
        db.budgets.clear(),
        db.goals.clear(),
        db.recurring.clear(),
        db.settings.clear(),
      ])
      await db.categories.bulkAdd(DEFAULT_CATEGORIES)
      const now = new Date().toISOString()
      await db.settings.add({
        id: 'settings',
        theme: 'system',
        currency: 'PHP',
        hasOnboarded: true,
        securityLock: 'none',
        installPromptDismissedAt: null,
        notificationsEnabled: false,
        voiceFeedbackEnabled: true,
        createdAt: now,
        updatedAt: now,
      })
    },
  )
}
