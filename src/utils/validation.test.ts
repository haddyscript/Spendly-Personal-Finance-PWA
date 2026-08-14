import { describe, expect, it } from 'vitest'
import { validateSpendlyExport } from '@/utils/validation'

function baseExport() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions: [
      {
        id: 't1',
        type: 'expense',
        amountMinor: 1000,
        categoryId: 'cat-food',
        description: 'Lunch',
        date: '2026-08-01',
        paymentMethod: 'cash',
      },
    ],
    categories: [{ id: 'cat-food', name: 'Food', type: 'expense', icon: 'Utensils', color: '#f97316' }],
    budgets: [{ id: 'b1', month: '2026-08', categoryId: null, amountMinor: 500000 }],
    goals: [{ id: 'g1', name: 'MacBook', targetAmountMinor: 6000000, currentAmountMinor: 100000 }],
    recurring: [
      {
        id: 'r1',
        type: 'expense',
        amountMinor: 54900,
        frequency: 'monthly',
        active: true,
      },
    ],
    settings: [{ currency: 'PHP', theme: 'system', securityLock: 'none' }],
  }
}

describe('validateSpendlyExport', () => {
  it('accepts a well-formed export', () => {
    const result = validateSpendlyExport(baseExport())
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.data).toBeDefined()
  })

  it('rejects non-object input', () => {
    expect(validateSpendlyExport(null).valid).toBe(false)
    expect(validateSpendlyExport('not json').valid).toBe(false)
    expect(validateSpendlyExport([1, 2, 3]).valid).toBe(false)
  })

  it('rejects an unsupported version', () => {
    const result = validateSpendlyExport({ ...baseExport(), version: 99 })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('version'))).toBe(true)
  })

  it('rejects when required arrays are missing', () => {
    const data = baseExport() as Record<string, unknown>
    delete data.categories
    const result = validateSpendlyExport(data)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('categories'))).toBe(true)
  })

  it('rejects a transaction with an invalid type', () => {
    const data = baseExport()
    data.transactions[0].type = 'not-a-type'
    const result = validateSpendlyExport(data)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('transactions[0].type'))).toBe(true)
  })

  it('rejects a transaction with a non-numeric amount', () => {
    const data = baseExport()
    // @ts-expect-error intentionally invalid for the test
    data.transactions[0].amountMinor = 'a lot'
    const result = validateSpendlyExport(data)
    expect(result.valid).toBe(false)
  })

  it('rejects a category with an invalid payment method on transactions', () => {
    const data = baseExport()
    data.transactions[0].paymentMethod = 'bitcoin'
    const result = validateSpendlyExport(data)
    expect(result.valid).toBe(false)
  })
})
