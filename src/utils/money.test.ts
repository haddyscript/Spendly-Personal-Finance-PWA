import { describe, expect, it } from 'vitest'
import { formatCurrency, fromMinorUnits, toMinorUnits } from '@/utils/money'

describe('toMinorUnits / fromMinorUnits', () => {
  it('round-trips a decimal amount without floating point drift', () => {
    expect(toMinorUnits(250.5)).toBe(25050)
    expect(fromMinorUnits(25050)).toBe(250.5)
  })

  it('rounds fractional centavos correctly', () => {
    expect(toMinorUnits(19.999)).toBe(2000)
    expect(toMinorUnits(0.1 + 0.2)).toBe(30)
  })
})

describe('formatCurrency', () => {
  it('formats PHP with the peso symbol', () => {
    expect(formatCurrency(2458000, 'PHP')).toContain('24,580.00')
  })

  it('formats negative amounts', () => {
    expect(formatCurrency(-50000, 'PHP')).toContain('500.00')
  })
})
