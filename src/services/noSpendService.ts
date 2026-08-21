import { db } from '@/db/db'
import { notify } from '@/services/notificationService'
import { addDaysToDateKey, toDateKey } from '@/utils/date'

export interface NoSpendStreak {
  current: number
  spentToday: boolean
}

/**
 * Consecutive calendar days, ending today or yesterday, with zero expenses logged. Bounded by
 * the date of the user's very first transaction (of either type) so days before they started
 * using Spendly never count toward the streak.
 */
export async function getNoSpendStreak(): Promise<NoSpendStreak> {
  const [expenses, firstTransaction] = await Promise.all([
    db.transactions.where('type').equals('expense').toArray(),
    db.transactions.orderBy('date').first(),
  ])
  if (!firstTransaction) return { current: 0, spentToday: false }

  const spendDates = new Set(expenses.map((t) => t.date))
  const today = toDateKey()
  const spentToday = spendDates.has(today)
  const firstUseDate = firstTransaction.date

  let cursor = spentToday ? addDaysToDateKey(today, -1) : today
  let current = 0
  while (cursor >= firstUseDate && !spendDates.has(cursor)) {
    current++
    cursor = addDaysToDateKey(cursor, -1)
  }

  return { current, spentToday }
}

const NO_SPEND_MILESTONES = [3, 7, 14, 30, 60, 100]
const NO_SPEND_NOTIFIED_KEY = 'spendly:noSpendMilestoneNotified'

/**
 * Fire-and-forget celebration notification the first time a no-spend streak crosses a new
 * milestone. Mirrors checkStreakMilestone's "already notified" pattern. Never throws.
 */
export async function checkNoSpendMilestone(): Promise<void> {
  try {
    const { current } = await getNoSpendStreak()
    const milestone = [...NO_SPEND_MILESTONES].reverse().find((m) => current >= m)
    if (!milestone) return

    const alreadyNotified = Number(localStorage.getItem(NO_SPEND_NOTIFIED_KEY) ?? 0)
    if (alreadyNotified >= milestone) return
    localStorage.setItem(NO_SPEND_NOTIFIED_KEY, String(milestone))

    await notify(`${milestone} no-spend days!`, {
      body: `You haven't logged an expense in ${milestone} days straight. Your wallet says thanks.`,
      tag: 'no-spend-streak',
    })
  } catch {
    // Notifications are best-effort — never let this block or fail anything.
  }
}
