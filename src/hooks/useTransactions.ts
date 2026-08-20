import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import { CREDIT_PAYMENT_METHODS } from '@/types/models'
import type { PaymentMethod, TransactionType } from '@/types/models'

export function useTransactions() {
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray(), [])
  return { transactions: transactions ?? [], isLoading: transactions === undefined }
}

export function useOutstandingCredit() {
  const transactions = useLiveQuery(async () => {
    const all = await db.transactions.orderBy('date').reverse().toArray()
    return all.filter((t) => t.type === 'expense' && CREDIT_PAYMENT_METHODS.includes(t.paymentMethod) && !t.settledAt)
  }, [])

  const list = transactions ?? []
  const totalMinor = list.reduce((sum, t) => sum + t.amountMinor, 0)
  return { transactions: list, totalMinor, isLoading: transactions === undefined }
}

export function useRecentlySettledCredit(limit: number) {
  const transactions = useLiveQuery(async () => {
    const all = await db.transactions.orderBy('date').reverse().toArray()
    return all
      .filter((t) => t.type === 'expense' && CREDIT_PAYMENT_METHODS.includes(t.paymentMethod) && !!t.settledAt)
      .sort((a, b) => (b.settledAt ?? '').localeCompare(a.settledAt ?? ''))
      .slice(0, limit)
  }, [limit])
  return { transactions: transactions ?? [], isLoading: transactions === undefined }
}

export function useRecentTransactions(limit: number) {
  const transactions = useLiveQuery(async () => {
    const all = await db.transactions.orderBy('date').reverse().toArray()
    return all.slice(0, limit)
  }, [limit])
  return { transactions: transactions ?? [], isLoading: transactions === undefined }
}

export interface TransactionFilters {
  search?: string
  categoryId?: string
  type?: TransactionType
  paymentMethod?: PaymentMethod
  startDate?: string
  endDate?: string
  sort?: 'newest' | 'oldest'
}

export function useFilteredTransactions(filters: TransactionFilters) {
  const { transactions, isLoading } = useTransactions()

  const filtered = transactions.filter((t) => {
    if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.categoryId && t.categoryId !== filters.categoryId) return false
    if (filters.type && t.type !== filters.type) return false
    if (filters.paymentMethod && t.paymentMethod !== filters.paymentMethod) return false
    if (filters.startDate && t.date < filters.startDate) return false
    if (filters.endDate && t.date > filters.endDate) return false
    return true
  })

  if (filters.sort === 'oldest') {
    filtered.reverse()
  }

  return { transactions: filtered, isLoading }
}
