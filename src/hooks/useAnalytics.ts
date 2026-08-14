import type { TransactionType } from '@/types/models'
import { useTransactions } from '@/hooks/useTransactions'
import { toMonthKey, lastNMonthKeys } from '@/utils/date'
import {
  calculateBalance,
  calculateCategoryTotals,
  calculateExpenseTotal,
  calculateIncomeTotal,
  calculateMonthlyTotals,
  calculateSpendingTrend,
  calculateTopCategories,
  filterByMonth,
  previousMonthKey,
} from '@/utils/calculations'

export function useBalance() {
  const { transactions, isLoading } = useTransactions()
  return { balance: calculateBalance(transactions), isLoading }
}

export function useMonthSummary(month: string = toMonthKey()) {
  const { transactions, isLoading } = useTransactions()
  const monthTx = filterByMonth(transactions, month)
  const income = calculateIncomeTotal(monthTx)
  const expense = calculateExpenseTotal(monthTx)
  return { income, expense, remaining: income - expense, isLoading }
}

export function useCategoryBreakdown(month: string = toMonthKey(), type: TransactionType = 'expense') {
  const { transactions, isLoading } = useTransactions()
  const monthTx = filterByMonth(transactions, month).filter((t) => t.type === type)
  const totals = calculateCategoryTotals(monthTx)
  const total = Object.values(totals).reduce((a, b) => a + b, 0)
  return { totals, total, isLoading }
}

export function useMonthlySeries(monthsCount = 6) {
  const { transactions, isLoading } = useTransactions()
  const monthKeys = lastNMonthKeys(monthsCount)
  const series = calculateMonthlyTotals(transactions, monthKeys)
  return { series, isLoading }
}

export function useSpendingTrend(month: string = toMonthKey()) {
  const { transactions, isLoading } = useTransactions()
  const current = calculateExpenseTotal(filterByMonth(transactions, month))
  const previous = calculateExpenseTotal(filterByMonth(transactions, previousMonthKey(month)))
  return { trend: calculateSpendingTrend(current, previous), isLoading }
}

export function useTopCategories(month: string = toMonthKey(), type: TransactionType = 'expense', limit = 5) {
  const { transactions, isLoading } = useTransactions()
  const monthTx = filterByMonth(transactions, month).filter((t) => t.type === type)
  return { topCategories: calculateTopCategories(monthTx, limit), isLoading }
}
