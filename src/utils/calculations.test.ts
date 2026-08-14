import { describe, expect, it } from 'vitest'
import { makeTransaction } from '@/test/fixtures'
import {
  calculateBalance,
  calculateBudgetProgress,
  calculateCategoryTotals,
  calculateExpenseTotal,
  calculateIncomeTotal,
  calculateMonthlyTotals,
  calculatePercentage,
  calculateSpendingTrend,
  calculateTopCategories,
  filterByMonth,
  previousMonthKey,
} from '@/utils/calculations'

describe('calculateBalance', () => {
  it('subtracts total expenses from total income', () => {
    const transactions = [
      makeTransaction({ type: 'income', amountMinor: 50000 }),
      makeTransaction({ type: 'expense', amountMinor: 12000 }),
      makeTransaction({ type: 'expense', amountMinor: 8000 }),
    ]
    expect(calculateBalance(transactions)).toBe(30000)
  })

  it('returns 0 for no transactions', () => {
    expect(calculateBalance([])).toBe(0)
  })
})

describe('calculateIncomeTotal / calculateExpenseTotal', () => {
  const transactions = [
    makeTransaction({ type: 'income', amountMinor: 20000 }),
    makeTransaction({ type: 'income', amountMinor: 5000 }),
    makeTransaction({ type: 'expense', amountMinor: 3000 }),
  ]

  it('sums only income transactions', () => {
    expect(calculateIncomeTotal(transactions)).toBe(25000)
  })

  it('sums only expense transactions', () => {
    expect(calculateExpenseTotal(transactions)).toBe(3000)
  })
})

describe('filterByMonth', () => {
  it('keeps only transactions within the given month', () => {
    const transactions = [
      makeTransaction({ date: '2026-08-05' }),
      makeTransaction({ date: '2026-08-31' }),
      makeTransaction({ date: '2026-09-01' }),
      makeTransaction({ date: '2026-07-31' }),
    ]
    expect(filterByMonth(transactions, '2026-08')).toHaveLength(2)
  })
})

describe('calculateCategoryTotals', () => {
  it('groups amounts by categoryId', () => {
    const transactions = [
      makeTransaction({ categoryId: 'cat-food', amountMinor: 1000 }),
      makeTransaction({ categoryId: 'cat-food', amountMinor: 2000 }),
      makeTransaction({ categoryId: 'cat-transportation', amountMinor: 500 }),
    ]
    expect(calculateCategoryTotals(transactions)).toEqual({
      'cat-food': 3000,
      'cat-transportation': 500,
    })
  })
})

describe('calculateMonthlyTotals', () => {
  it('aggregates income/expense per month in the given order', () => {
    const transactions = [
      makeTransaction({ type: 'income', amountMinor: 10000, date: '2026-07-10' }),
      makeTransaction({ type: 'expense', amountMinor: 4000, date: '2026-07-15' }),
      makeTransaction({ type: 'expense', amountMinor: 2000, date: '2026-08-02' }),
    ]
    expect(calculateMonthlyTotals(transactions, ['2026-07', '2026-08'])).toEqual([
      { month: '2026-07', income: 10000, expense: 4000 },
      { month: '2026-08', income: 0, expense: 2000 },
    ])
  })
})

describe('calculatePercentage', () => {
  it('computes a normal percentage', () => {
    expect(calculatePercentage(25, 100)).toBe(25)
  })

  it('returns 0 when the whole is 0, instead of NaN/Infinity', () => {
    expect(calculatePercentage(50, 0)).toBe(0)
  })
})

describe('calculateBudgetProgress', () => {
  it('reports remaining budget and not over when under limit', () => {
    const result = calculateBudgetProgress(4000_00, 6000_00)
    expect(result.percentage).toBeCloseTo(66.67, 1)
    expect(result.remainingMinor).toBe(2000_00)
    expect(result.isOverBudget).toBe(false)
  })

  it('flags over-budget when spending exceeds the limit', () => {
    const result = calculateBudgetProgress(7000_00, 6000_00)
    expect(result.isOverBudget).toBe(true)
    expect(result.remainingMinor).toBe(-1000_00)
  })
})

describe('calculateSpendingTrend', () => {
  it('detects a decrease', () => {
    const trend = calculateSpendingTrend(9000, 10000)
    expect(trend.direction).toBe('down')
    expect(trend.percentage).toBeCloseTo(10, 1)
  })

  it('detects an increase', () => {
    const trend = calculateSpendingTrend(12000, 10000)
    expect(trend.direction).toBe('up')
    expect(trend.percentage).toBeCloseTo(20, 1)
  })

  it('treats near-zero change as stable', () => {
    const trend = calculateSpendingTrend(10000, 10000)
    expect(trend.direction).toBe('stable')
  })

  it('handles a zero previous period without dividing by zero', () => {
    expect(calculateSpendingTrend(0, 0)).toEqual({ direction: 'stable', percentage: 0 })
    expect(calculateSpendingTrend(5000, 0)).toEqual({ direction: 'up', percentage: 100 })
  })
})

describe('calculateTopCategories', () => {
  it('sorts categories by total descending and respects the limit', () => {
    const transactions = [
      makeTransaction({ categoryId: 'cat-food', amountMinor: 1000 }),
      makeTransaction({ categoryId: 'cat-transportation', amountMinor: 5000 }),
      makeTransaction({ categoryId: 'cat-bills', amountMinor: 3000 }),
    ]
    const top = calculateTopCategories(transactions, 2)
    expect(top).toEqual([
      { categoryId: 'cat-transportation', totalMinor: 5000 },
      { categoryId: 'cat-bills', totalMinor: 3000 },
    ])
  })
})

describe('previousMonthKey', () => {
  it('rolls back a month within the same year', () => {
    expect(previousMonthKey('2026-08')).toBe('2026-07')
  })

  it('rolls back across a year boundary', () => {
    expect(previousMonthKey('2026-01')).toBe('2025-12')
  })
})
