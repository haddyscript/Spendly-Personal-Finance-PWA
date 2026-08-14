import type { CurrencyCode } from '@/types/models'

const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  PHP: 'en-PH',
  USD: 'en-US',
  EUR: 'en-IE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
}

/** Converts a decimal amount (e.g. user input "250.50") to integer minor units (25050). */
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100)
}

/** Converts integer minor units back to a decimal amount. */
export function fromMinorUnits(minor: number): number {
  return minor / 100
}

const formatterCache = new Map<CurrencyCode, Intl.NumberFormat>()

function getFormatter(currency: CurrencyCode): Intl.NumberFormat {
  let formatter = formatterCache.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    })
    formatterCache.set(currency, formatter)
  }
  return formatter
}

export function formatCurrency(minor: number, currency: CurrencyCode = 'PHP'): string {
  return getFormatter(currency).format(fromMinorUnits(minor))
}

export function formatCurrencyCompact(minor: number, currency: CurrencyCode = 'PHP'): string {
  const amount = Math.abs(fromMinorUnits(minor))
  const sign = minor < 0 ? '-' : ''
  const symbol = new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  })
    .formatToParts(0)
    .find((p) => p.type === 'currency')?.value ?? ''

  if (amount >= 1_000_000) return `${sign}${symbol}${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${sign}${symbol}${(amount / 1_000).toFixed(1)}k`
  return `${sign}${symbol}${amount.toFixed(0)}`
}
