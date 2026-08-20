import { db } from '@/db/db'
import { CREDIT_PAYMENT_METHODS } from '@/types/models'
import type { PaymentMethod, Transaction, TransactionType } from '@/types/models'
import { createId } from '@/utils/id'
import { toDateKey } from '@/utils/date'
import { getCategoryById } from '@/services/categoryService'
import { getSettings } from '@/services/settingsService'
import { notify } from '@/services/notificationService'
import { formatCurrency } from '@/utils/money'

export interface CreateTransactionInput {
  type: TransactionType
  amountMinor: number
  categoryId: string
  description: string
  date?: string
  paymentMethod: PaymentMethod
  recurringId?: string
}

export type UpdateTransactionInput = Partial<Omit<CreateTransactionInput, 'recurringId'>>

export async function getAllTransactions(): Promise<Transaction[]> {
  return db.transactions.orderBy('date').reverse().toArray()
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  return db.transactions.get(id)
}

export async function getRecentTransactions(limit: number): Promise<Transaction[]> {
  const all = await getAllTransactions()
  return all.slice(0, limit)
}

export async function addTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const now = new Date().toISOString()
  const transaction: Transaction = {
    id: createId(),
    type: input.type,
    amountMinor: input.amountMinor,
    categoryId: input.categoryId,
    description: input.description,
    date: input.date ?? toDateKey(),
    paymentMethod: input.paymentMethod,
    recurringId: input.recurringId,
    createdAt: now,
    updatedAt: now,
  }
  await db.transactions.add(transaction)
  return transaction
}

/** Fire-and-forget confirmation notification after logging a transaction. Never throws. */
export async function notifyTransactionAdded(transaction: Transaction): Promise<void> {
  try {
    const [category, settings] = await Promise.all([getCategoryById(transaction.categoryId), getSettings()])
    const amount = formatCurrency(transaction.amountMinor, settings.currency)
    const sign = transaction.type === 'expense' ? '-' : '+'
    const title = transaction.type === 'expense' ? 'Expense logged' : 'Income logged'
    await notify(title, {
      body: `${sign}${amount} · ${category?.name ?? transaction.description}`,
      tag: 'transaction-added',
    })
  } catch {
    // Notifications are best-effort — never let this block or fail the transaction flow.
  }
}

export async function updateTransaction(id: string, input: UpdateTransactionInput): Promise<void> {
  await db.transactions.update(id, { ...input, updatedAt: new Date().toISOString() })
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.transactions.delete(id)
}

export async function countTransactionsForCategory(categoryId: string): Promise<number> {
  return db.transactions.where('categoryId').equals(categoryId).count()
}

export async function reassignCategory(fromCategoryId: string, toCategoryId: string): Promise<void> {
  const affected = await db.transactions.where('categoryId').equals(fromCategoryId).toArray()
  await db.transactions.bulkPut(
    affected.map((t) => ({ ...t, categoryId: toCategoryId, updatedAt: new Date().toISOString() })),
  )
}

export async function getOutstandingCreditTransactions(): Promise<Transaction[]> {
  const all = await getAllTransactions()
  return all.filter((t) => t.type === 'expense' && CREDIT_PAYMENT_METHODS.includes(t.paymentMethod) && !t.settledAt)
}

export async function markTransactionSettled(id: string): Promise<void> {
  await db.transactions.update(id, { settledAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
}

export async function markAllCreditSettled(): Promise<void> {
  const outstanding = await getOutstandingCreditTransactions()
  const now = new Date().toISOString()
  await db.transactions.bulkPut(outstanding.map((t) => ({ ...t, settledAt: now, updatedAt: now })))
}
