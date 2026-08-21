import type { PaymentMethod } from '@/types/models'
import cashLogo from '@/assets/PaymentMethodLogo/cash-logo.png'
import atomeLogo from '@/assets/PaymentMethodLogo/atome-logo.png'
import creditCardLogo from '@/assets/PaymentMethodLogo/credit-card-logo.png'
import gcashLogo from '@/assets/PaymentMethodLogo/gcash-logo.png'
import gotymeLogo from '@/assets/PaymentMethodLogo/go-tyme-logo.jpg'
import maribankLogo from '@/assets/PaymentMethodLogo/maribank-logo.png'
import metrobankLogo from '@/assets/PaymentMethodLogo/metro-bank-logo.png'
import securitybankLogo from '@/assets/PaymentMethodLogo/security-bank-logo.png'
import unionbankLogo from '@/assets/PaymentMethodLogo/unionbank-logo.jpeg'
import chinabankLogo from '@/assets/PaymentMethodLogo/china-bank.png'
import landbankLogo from '@/assets/PaymentMethodLogo/land-bank-logo.png'
import citysavingsbankLogo from '@/assets/PaymentMethodLogo/city-savings-bank.png'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  gcash: 'GCash',
  gotyme: 'GoTyme',
  maribank: 'Maribank',
  unionbank: 'Union Bank',
  securitybank: 'Security Bank',
  metrobank: 'Metro Bank',
  chinabank: 'China Bank',
  landbank: 'Landbank',
  citysavingsbank: 'City Savings Bank',
  credit_card: 'Credit Card',
  atome: 'Atome',
  other: 'Other',
}

/** Official brand logos, keyed by payment method. Methods without a real-world brand (other) fall back to a generic icon — see PaymentMethodIcon. */
export const PAYMENT_METHOD_LOGOS: Partial<Record<PaymentMethod, string>> = {
  cash: cashLogo,
  gcash: gcashLogo,
  gotyme: gotymeLogo,
  maribank: maribankLogo,
  unionbank: unionbankLogo,
  securitybank: securitybankLogo,
  metrobank: metrobankLogo,
  chinabank: chinabankLogo,
  landbank: landbankLogo,
  citysavingsbank: citysavingsbankLogo,
  credit_card: creditCardLogo,
  atome: atomeLogo,
}
