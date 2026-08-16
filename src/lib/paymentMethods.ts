import type { PaymentMethod } from '@/types/models'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  gcash: 'GCash',
  gotyme: 'GoTyme',
  maribank: 'Maribank',
  unionbank: 'Union Bank',
  securitybank: 'Security Bank',
  metrobank: 'Metro Bank',
  credit_card: 'Credit Card',
  atome: 'Atome',
  other: 'Other',
}
