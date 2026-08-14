import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import { toMonthKey } from '@/utils/date'

export function useBudgetsForMonth(month: string = toMonthKey()) {
  const budgets = useLiveQuery(() => db.budgets.where('month').equals(month).toArray(), [month])
  const overall = budgets?.find((b) => b.categoryId === null) ?? null
  const byCategory = budgets?.filter((b) => b.categoryId !== null) ?? []
  return { overall, byCategory, isLoading: budgets === undefined }
}
