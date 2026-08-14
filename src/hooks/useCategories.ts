import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import type { TransactionType } from '@/types/models'

export function useCategories() {
  const categories = useLiveQuery(() => db.categories.toArray(), [])
  return { categories: categories ?? [], isLoading: categories === undefined }
}

export function useCategoriesByType(type: TransactionType) {
  const { categories, isLoading } = useCategories()
  return { categories: categories.filter((c) => c.type === type), isLoading }
}

export function useCategoryMap() {
  const { categories, isLoading } = useCategories()
  const map = new Map(categories.map((c) => [c.id, c]))
  return { categoryMap: map, isLoading }
}
