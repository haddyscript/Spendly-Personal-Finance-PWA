import type { Transaction } from '@/types/models'

let counter = 0

export function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  counter += 1
  const now = new Date().toISOString()
  return {
    id: `tx-${counter}`,
    type: 'expense',
    amountMinor: 10000,
    categoryId: 'cat-food',
    description: 'Test transaction',
    date: '2026-08-01',
    paymentMethod: 'cash',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}
