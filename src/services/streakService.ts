import { db } from '@/db/db'
import { notify } from '@/services/notificationService'
import { addDaysToDateKey, toDateKey } from '@/utils/date'

export interface SpendingStreak {
  current: number
  loggedToday: boolean
}

/** Consecutive calendar days, ending today or yesterday, with at least one expense logged. */
export async function getSpendingStreak(): Promise<SpendingStreak> {
  const expenses = await db.transactions.where('type').equals('expense').toArray()
  const dateKeys = new Set(expenses.map((t) => t.date))

  const today = toDateKey()
  const loggedToday = dateKeys.has(today)

  let cursor = loggedToday ? today : addDaysToDateKey(today, -1)
  let current = 0
  while (dateKeys.has(cursor)) {
    current++
    cursor = addDaysToDateKey(cursor, -1)
  }

  return { current, loggedToday }
}

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365]
const STREAK_NOTIFIED_KEY = 'spendly:streakMilestoneNotified'

/**
 * Fire-and-forget celebration notification the first time a streak crosses a new milestone.
 * The "already notified" marker lives in localStorage since it's throwaway device-local UI
 * state, matching the same pattern budgetService uses for its threshold alerts. Never throws.
 */
export async function checkStreakMilestone(): Promise<void> {
  try {
    const { current } = await getSpendingStreak()
    const milestone = [...STREAK_MILESTONES].reverse().find((m) => current >= m)
    if (!milestone) return

    const alreadyNotified = Number(localStorage.getItem(STREAK_NOTIFIED_KEY) ?? 0)
    if (alreadyNotified >= milestone) return
    localStorage.setItem(STREAK_NOTIFIED_KEY, String(milestone))

    await notify(`${milestone}-day streak!`, {
      body: `You've logged an expense ${milestone} days in a row. Keep it up!`,
      tag: 'spending-streak',
    })
  } catch {
    // Notifications are best-effort — never let this block or fail the transaction flow.
  }
}
