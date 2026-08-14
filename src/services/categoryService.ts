import { db } from '@/db/db'
import type { Category, TransactionType } from '@/types/models'
import { createId } from '@/utils/id'
import { countTransactionsForCategory, reassignCategory } from '@/services/transactionService'

export interface CreateCategoryInput {
  name: string
  type: TransactionType
  icon: string
  color: string
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>

export async function getAllCategories(): Promise<Category[]> {
  return db.categories.toArray()
}

export async function getCategoriesByType(type: TransactionType): Promise<Category[]> {
  return db.categories.where('type').equals(type).toArray()
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  return db.categories.get(id)
}

export async function addCategory(input: CreateCategoryInput): Promise<Category> {
  const category: Category = {
    id: createId(),
    name: input.name,
    type: input.type,
    icon: input.icon,
    color: input.color,
    isDefault: false,
    createdAt: new Date().toISOString(),
  }
  await db.categories.add(category)
  return category
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<void> {
  await db.categories.update(id, input)
}

export class CategoryInUseError extends Error {
  count: number

  constructor(count: number) {
    super(`Category is used by ${count} transaction(s). Reassign them before deleting.`)
    this.name = 'CategoryInUseError'
    this.count = count
  }
}

/**
 * Deletes a category. If transactions reference it, a `reassignToId` must be provided
 * (a category of the same type) — those transactions are moved there first.
 */
export async function deleteCategory(id: string, reassignToId?: string): Promise<void> {
  const usageCount = await countTransactionsForCategory(id)

  if (usageCount > 0) {
    if (!reassignToId) {
      throw new CategoryInUseError(usageCount)
    }
    await reassignCategory(id, reassignToId)
  }

  await db.categories.delete(id)
}
