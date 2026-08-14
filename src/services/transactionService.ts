import { db } from '@/db/db'
import type { PaymentMethod, Transaction, TransactionType } from '@/types/models'
import { createId } from '@/utils/id'
import { toDateKey } from '@/utils/date'

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
