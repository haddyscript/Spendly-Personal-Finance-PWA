import type { Transaction } from '@/types/models'
import { toMonthKey } from '@/utils/date'

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amountMinor : -t.amountMinor), 0)
}

export function calculateIncomeTotal(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amountMinor, 0)
}

export function calculateExpenseTotal(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amountMinor, 0)
}

export function filterByMonth(transactions: Transaction[], monthKey: string): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(monthKey))
}

/** Returns a map of categoryId -> total amount (minor units) for the given transactions. */
export function calculateCategoryTotals(transactions: Transaction[]): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const t of transactions) {
    totals[t.categoryId] = (totals[t.categoryId] ?? 0) + t.amountMinor
  }
  return totals
}

export interface MonthlyTotal {
  month: string
  income: number
  expense: number
}

/** Aggregates income/expense totals per month for the given month keys (in the order provided). */
export function calculateMonthlyTotals(transactions: Transaction[], monthKeys: string[]): MonthlyTotal[] {
  return monthKeys.map((month) => {
    const monthTx = filterByMonth(transactions, month)
    return {
      month,
      income: calculateIncomeTotal(monthTx),
      expense: calculateExpenseTotal(monthTx),
    }
  })
}

/** Safe percentage calculation. Returns 0 when `whole` is 0 to avoid NaN/Infinity. */
export function calculatePercentage(part: number, whole: number): number {
  if (!whole) return 0
  return (part / whole) * 100
}

export interface BudgetProgress {
  percentage: number
  remainingMinor: number
  isOverBudget: boolean
}

export function calculateBudgetProgress(spentMinor: number, budgetMinor: number): BudgetProgress {
  const percentage = calculatePercentage(spentMinor, budgetMinor)
  return {
    percentage: Math.min(percentage, 999),
    remainingMinor: budgetMinor - spentMinor,
    isOverBudget: budgetMinor > 0 && spentMinor > budgetMinor,
  }
}

export interface SpendingTrend {
  direction: 'up' | 'down' | 'stable'
  percentage: number
}

/** Compares current vs previous period spending. `percentage` is always >= 0. */
export function calculateSpendingTrend(currentMinor: number, previousMinor: number): SpendingTrend {
  if (previousMinor === 0) {
    return currentMinor === 0 ? { direction: 'stable', percentage: 0 } : { direction: 'up', percentage: 100 }
  }
  const change = calculatePercentage(currentMinor - previousMinor, previousMinor)
  if (Math.abs(change) < 1) return { direction: 'stable', percentage: Math.abs(change) }
  return { direction: change > 0 ? 'up' : 'down', percentage: Math.abs(change) }
}

export interface TopCategory {
  categoryId: string
  totalMinor: number
}

export function calculateTopCategories(transactions: Transaction[], limit = 5): TopCategory[] {
  const totals = calculateCategoryTotals(transactions)
  return Object.entries(totals)
    .map(([categoryId, totalMinor]) => ({ categoryId, totalMinor }))
    .sort((a, b) => b.totalMinor - a.totalMinor)
    .slice(0, limit)
}

export interface MoneyLeak {
  key: string
  description: string
  categoryId: string
  count: number
  totalMinor: number
  avgMinor: number
  lastDate: string
}

const MONEY_LEAK_MIN_OCCURRENCES = 3

/**
 * Detects small repeat purchases (coffee runs, delivery fees, impulse buys) by grouping
 * expenses with matching descriptions that recur at least `minOccurrences` times. Transactions
 * generated from a formal recurring rule are excluded — those are already surfaced elsewhere,
 * so flagging them again here would just be noise.
 */
export function calculateMoneyLeaks(transactions: Transaction[], minOccurrences = MONEY_LEAK_MIN_OCCURRENCES): MoneyLeak[] {
  const groups = new Map<string, { description: string; categoryId: string; total: number; count: number; lastDate: string }>()

  for (const t of transactions) {
    if (t.type !== 'expense' || t.recurringId) continue
    const key = `${t.categoryId}:${t.description.trim().toLowerCase()}`
    const existing = groups.get(key)
    if (existing) {
      existing.total += t.amountMinor
      existing.count += 1
      if (t.date > existing.lastDate) existing.lastDate = t.date
    } else {
      groups.set(key, { description: t.description.trim(), categoryId: t.categoryId, total: t.amountMinor, count: 1, lastDate: t.date })
    }
  }

  return [...groups.entries()]
    .filter(([, g]) => g.count >= minOccurrences)
    .map(([key, g]) => ({
      key,
      description: g.description,
      categoryId: g.categoryId,
      count: g.count,
      totalMinor: g.total,
      avgMinor: Math.round(g.total / g.count),
      lastDate: g.lastDate,
    }))
    .sort((a, b) => b.totalMinor - a.totalMinor)
}

export function previousMonthKey(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return toMonthKey(d)
}
