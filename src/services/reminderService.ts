import { db } from '@/db/db'
import { notify } from '@/services/notificationService'

const REMINDER_HOURS = 5
const REMINDER_MS = REMINDER_HOURS * 60 * 60 * 1000
const LAST_REMINDER_KEY = 'spendly:lastLogReminderAt'

/**
 * Nudges the user to log something if it's been REMINDER_HOURS since their last transaction.
 * There's no reliable way to fire this while the app is fully closed on a local-first PWA
 * (no server to push from, and background-sync APIs are unsupported on iOS and unreliable on
 * Android), so this is checked whenever the app is opened or brought to the foreground instead.
 * Reminds at most once per REMINDER_HOURS window, regardless of how often the app is opened.
 */
export async function checkLogReminder(): Promise<void> {
  const latest = await db.transactions.orderBy('createdAt').last()
  if (!latest) return

  const anchor = new Date(latest.createdAt).getTime()
  const now = Date.now()
  if (now - anchor < REMINDER_MS) return

  const lastReminderAt = Number(localStorage.getItem(LAST_REMINDER_KEY) ?? 0)
  if (now - lastReminderAt < REMINDER_MS) return

  localStorage.setItem(LAST_REMINDER_KEY, String(now))
  const hours = Math.floor((now - anchor) / (60 * 60 * 1000))
  await notify('Log your expenses', {
    body: `It's been ${hours} hour${hours === 1 ? '' : 's'} since your last transaction.`,
    tag: 'log-reminder',
  })
}
