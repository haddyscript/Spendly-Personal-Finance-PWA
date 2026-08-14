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

export function previousMonthKey(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return toMonthKey(d)
}
