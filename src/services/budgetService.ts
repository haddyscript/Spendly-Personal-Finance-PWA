import { db } from '@/db/db'
import type { Budget } from '@/types/models'
import { createId } from '@/utils/id'
import { getCategoryById } from '@/services/categoryService'
import { getSettings } from '@/services/settingsService'
import { notify } from '@/services/notificationService'
import { formatCurrency } from '@/utils/money'

export async function getBudgetsForMonth(month: string): Promise<Budget[]> {
  return db.budgets.where('month').equals(month).toArray()
}

export async function getOverallBudget(month: string): Promise<Budget | undefined> {
  const budgets = await getBudgetsForMonth(month)
  return budgets.find((b) => b.categoryId === null)
}

export async function getCategoryBudgets(month: string): Promise<Budget[]> {
  const budgets = await getBudgetsForMonth(month)
  return budgets.filter((b) => b.categoryId !== null)
}

async function upsertBudget(month: string, categoryId: string | null, amountMinor: number): Promise<Budget> {
  const budgets = await getBudgetsForMonth(month)
  const existing = budgets.find((b) => b.categoryId === categoryId)
  const now = new Date().toISOString()

  if (existing) {
    const updated: Budget = { ...existing, amountMinor, updatedAt: now }
    await db.budgets.put(updated)
    return updated
  }

  const created: Budget = { id: createId(), month, categoryId, amountMinor, createdAt: now, updatedAt: now }
  await db.budgets.add(created)
  return created
}

export async function setOverallBudget(month: string, amountMinor: number): Promise<Budget> {
  return upsertBudget(month, null, amountMinor)
}

export async function setCategoryBudget(month: string, categoryId: string, amountMinor: number): Promise<Budget> {
  return upsertBudget(month, categoryId, amountMinor)
}

export async function deleteBudget(id: string): Promise<void> {
  await db.budgets.delete(id)
}

async function getSpentMinor(month: string, categoryId: string | null): Promise<number> {
  const expenses = await db.transactions.where('type').equals('expense').toArray()
  return expenses
    .filter((t) => t.date.startsWith(month) && (categoryId === null || t.categoryId === categoryId))
    .reduce((sum, t) => sum + t.amountMinor, 0)
}

// Checked highest-first so a jump straight past 100% doesn't also fire the 90% notice.
const ALERT_THRESHOLDS = [100, 90] as const

function alertStorageKey(month: string, categoryId: string | null): string {
  return `spendly:budgetAlert:${month}:${categoryId ?? 'overall'}`
}

/**
 * Notifies once per threshold (90%/100%) crossed per budget per month. The "already notified"
 * marker lives in localStorage rather than Dexie — it's throwaway device-local UI state, not
 * financial data, so it has no business in exports/imports or the synced data layer.
 */
async function checkThreshold(month: string, categoryId: string | null): Promise<void> {
  const budget = categoryId === null ? await getOverallBudget(month) : (await getCategoryBudgets(month)).find((b) => b.categoryId === categoryId)
  if (!budget || budget.amountMinor <= 0) return

  const spentMinor = await getSpentMinor(month, categoryId)
  const percentage = (spentMinor / budget.amountMinor) * 100
  const crossed = ALERT_THRESHOLDS.find((t) => percentage >= t)
  if (!crossed) return

  const key = alertStorageKey(month, categoryId)
  const alreadyNotified = Number(localStorage.getItem(key) ?? 0)
  if (alreadyNotified >= crossed) return
  localStorage.setItem(key, String(crossed))

  const settings = await getSettings()
  const label = categoryId === null ? 'Overall budget' : ((await getCategoryById(categoryId))?.name ?? 'Budget')
  const title = crossed >= 100 ? `Over budget: ${label}` : `${label} at ${crossed}% of budget`
  const body = `${formatCurrency(spentMinor, settings.currency)} of ${formatCurrency(budget.amountMinor, settings.currency)} spent this month.`

  await notify(title, { body, tag: key })
}

/** Fire-and-forget check for both the overall and category budget after a new expense. Never throws. */
export async function checkBudgetAlerts(month: string, categoryId: string): Promise<void> {
  try {
    await checkThreshold(month, null)
    await checkThreshold(month, categoryId)
  } catch {
    // Notifications are best-effort — never let this block or fail the transaction flow.
  }
}
