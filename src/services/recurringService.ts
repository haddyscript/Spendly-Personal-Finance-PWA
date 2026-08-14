import { db } from '@/db/db'
import type { PaymentMethod, RecurringFrequency, RecurringTransaction, TransactionType } from '@/types/models'
import { createId } from '@/utils/id'
import { computeNextOccurrence, generateDueOccurrences } from '@/utils/recurring'
import { toDateKey } from '@/utils/date'

export interface CreateRecurringInput {
  type: TransactionType
  amountMinor: number
  categoryId: string
  description: string
  paymentMethod: PaymentMethod
  frequency: RecurringFrequency
  startDate?: string
}

export type UpdateRecurringInput = Partial<CreateRecurringInput> & { active?: boolean }

export async function getAllRecurring(): Promise<RecurringTransaction[]> {
  return db.recurring.toArray()
}

export async function addRecurring(input: CreateRecurringInput): Promise<RecurringTransaction> {
  const now = new Date().toISOString()
  const startDate = input.startDate ?? toDateKey()
  const rule: RecurringTransaction = {
    id: createId(),
    type: input.type,
    amountMinor: input.amountMinor,
    categoryId: input.categoryId,
    description: input.description,
    paymentMethod: input.paymentMethod,
    frequency: input.frequency,
    startDate,
    nextOccurrence: startDate,
    active: true,
    createdAt: now,
    updatedAt: now,
  }
  await db.recurring.add(rule)
  return rule
}

export async function updateRecurring(id: string, input: UpdateRecurringInput): Promise<void> {
  await db.recurring.update(id, { ...input, updatedAt: new Date().toISOString() })
}

export async function deleteRecurring(id: string): Promise<void> {
  await db.recurring.delete(id)
}

/**
 * Generates any transactions that are due for active recurring rules, up to today.
 * Safe to call every time the app starts — it only ever moves `nextOccurrence` forward,
 * so it naturally "catches up" after periods offline without duplicating transactions.
 */
export async function processDueRecurring(today: string = toDateKey()): Promise<number> {
  const allRules = await db.recurring.toArray()
  const rules = allRules.filter((r) => r.active)
  let generatedCount = 0

  for (const rule of rules) {
    const dueDates = generateDueOccurrences(rule, today)
    if (dueDates.length === 0) continue

    const now = new Date().toISOString()
    await db.transactions.bulkAdd(
      dueDates.map((date) => ({
        id: createId(),
        type: rule.type,
        amountMinor: rule.amountMinor,
        categoryId: rule.categoryId,
        description: rule.description,
        date,
        paymentMethod: rule.paymentMethod,
        recurringId: rule.id,
        createdAt: now,
        updatedAt: now,
      })),
    )

    const lastDue = dueDates[dueDates.length - 1]

    await db.recurring.update(rule.id, {
      nextOccurrence: computeNextOccurrence(lastDue, rule.frequency),
      updatedAt: now,
    })

    generatedCount += dueDates.length
  }

  return generatedCount
}
