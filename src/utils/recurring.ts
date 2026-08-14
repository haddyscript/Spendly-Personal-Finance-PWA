import type { RecurringFrequency, RecurringTransaction } from '@/types/models'
import { toDateKey } from '@/utils/date'

/** Computes the next occurrence date key given a date key and a frequency. */
export function computeNextOccurrence(dateKey: string, frequency: RecurringFrequency): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)

  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1)
      break
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1)
      break
  }

  return toDateKey(date)
}

/**
 * Returns every occurrence date (inclusive) that is due on or before `upToDateKey`,
 * starting from the rule's current `nextOccurrence`. This lets the app "catch up"
 * on recurring transactions that should have fired while it was closed, since the
 * data layer only runs this logic when the app is opened (there is no background
 * process while offline).
 */
export function generateDueOccurrences(
  rule: Pick<RecurringTransaction, 'nextOccurrence' | 'frequency'>,
  upToDateKey: string = toDateKey(),
  maxOccurrences = 366,
): string[] {
  const due: string[] = []
  let cursor = rule.nextOccurrence

  while (cursor <= upToDateKey && due.length < maxOccurrences) {
    due.push(cursor)
    cursor = computeNextOccurrence(cursor, rule.frequency)
  }

  return due
}
