import { db } from '@/db/db'
import type { Budget } from '@/types/models'
import { createId } from '@/utils/id'

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
