import { describe, expect, it } from 'vitest'
import { computeNextOccurrence, generateDueOccurrences } from '@/utils/recurring'

describe('computeNextOccurrence', () => {
  it('advances by one day', () => {
    expect(computeNextOccurrence('2026-08-14', 'daily')).toBe('2026-08-15')
  })

  it('advances by one week', () => {
    expect(computeNextOccurrence('2026-08-14', 'weekly')).toBe('2026-08-21')
  })

  it('advances by one month, including month-end rollover', () => {
    expect(computeNextOccurrence('2026-08-14', 'monthly')).toBe('2026-09-14')
    expect(computeNextOccurrence('2026-01-31', 'monthly')).toBe('2026-03-03')
  })

  it('advances by one year', () => {
    expect(computeNextOccurrence('2026-08-14', 'yearly')).toBe('2027-08-14')
  })
})

describe('generateDueOccurrences', () => {
  it('returns no occurrences when the next date is in the future', () => {
    const due = generateDueOccurrences({ nextOccurrence: '2026-09-01', frequency: 'monthly' }, '2026-08-14')
    expect(due).toEqual([])
  })

  it('returns a single occurrence when exactly due today', () => {
    const due = generateDueOccurrences({ nextOccurrence: '2026-08-14', frequency: 'monthly' }, '2026-08-14')
    expect(due).toEqual(['2026-08-14'])
  })

  it('catches up on multiple missed occurrences while the app was closed', () => {
    const due = generateDueOccurrences({ nextOccurrence: '2026-05-14', frequency: 'monthly' }, '2026-08-14')
    expect(due).toEqual(['2026-05-14', '2026-06-14', '2026-07-14', '2026-08-14'])
  })

  it('respects the maxOccurrences safety cap', () => {
    const due = generateDueOccurrences({ nextOccurrence: '2020-01-01', frequency: 'daily' }, '2026-08-14', 10)
    expect(due).toHaveLength(10)
  })
})
