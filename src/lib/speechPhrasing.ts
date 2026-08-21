import type { CurrencyCode } from '@/types/models'
import { fromMinorUnits } from '@/utils/money'

const CURRENCY_SPOKEN_PLURAL: Record<CurrencyCode, string> = {
  PHP: 'pesos',
  USD: 'dollars',
  EUR: 'euros',
  GBP: 'pounds',
  JPY: 'yen',
}

/**
 * Rounds to whole units and spells the currency out in casual spoken form (e.g. "5,000 pesos")
 * instead of reading a literal "5000.00 Philippine Peso", or a currency symbol most TTS engines
 * don't recognize aloud — the Philippine peso sign (₱) in particular is rarely read correctly.
 */
export function speakableAmount(minor: number, currency: CurrencyCode): string {
  const whole = Math.round(fromMinorUnits(Math.abs(minor)))
  const sign = minor < 0 ? 'negative ' : ''
  return `${sign}${whole.toLocaleString('en-US')} ${CURRENCY_SPOKEN_PLURAL[currency]}`
}

/** Picks a random entry so repeated spoken feedback doesn't sound like the same recording on loop. */
export function pickPhrasing<T>(variants: readonly T[]): T {
  return variants[Math.floor(Math.random() * variants.length)]
}
