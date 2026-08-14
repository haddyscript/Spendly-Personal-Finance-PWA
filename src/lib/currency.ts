import type { CurrencyCode } from '@/types/models'

export const CURRENCY_INFO: Record<CurrencyCode, { symbol: string; name: string }> = {
  PHP: { symbol: '₱', name: 'Philippine Peso' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
}
