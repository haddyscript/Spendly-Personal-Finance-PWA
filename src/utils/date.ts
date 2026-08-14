/** Returns "YYYY-MM-DD" for the given date (or today) in local time. */
export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Returns "YYYY-MM" for the given date (or today) in local time. */
export function toMonthKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function monthKeyToLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function isSameDay(a: string, b: string): boolean {
  return a === b
}

export function isToday(dateKey: string): boolean {
  return dateKey === toDateKey()
}

export function isYesterday(dateKey: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return dateKey === toDateKey(yesterday)
}

/** Human-friendly group label for a date key: "Today", "Yesterday", or a formatted date. */
export function dateGroupLabel(dateKey: string): string {
  if (isToday(dateKey)) return 'Today'
  if (isYesterday(dateKey)) return 'Yesterday'
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const now = new Date()
  const sameYear = date.getFullYear() === now.getFullYear()
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  })
}

export function formatShortDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Returns the last `count` month keys ending with the given month (inclusive), oldest first. */
export function lastNMonthKeys(count: number, end: Date = new Date()): string[] {
  const keys: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1)
    keys.push(toMonthKey(d))
  }
  return keys
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}
