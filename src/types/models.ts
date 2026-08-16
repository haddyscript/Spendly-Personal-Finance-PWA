export const TRANSACTION_TYPES = ['expense', 'income'] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

/**
 * Reserved for future support (see architecture notes). Not used by the
 * initial implementation — transactions are restricted to expense/income.
 */
export const FUTURE_TRANSACTION_TYPES = ['transfer', 'refund'] as const

export const PAYMENT_METHODS = [
  'cash',
  'gcash',
  'gotyme',
  'maribank',
  'unionbank',
  'securitybank',
  'metrobank',
  'credit_card',
  'atome',
  'other',
] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const RECURRING_FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'] as const
export type RecurringFrequency = (typeof RECURRING_FREQUENCIES)[number]

export const CURRENCIES = ['PHP', 'USD', 'EUR', 'GBP', 'JPY'] as const
export type CurrencyCode = (typeof CURRENCIES)[number]

export const THEMES = ['system', 'light', 'dark'] as const
export type ThemeMode = (typeof THEMES)[number]

export const SECURITY_LOCK_MODES = ['none', 'pin', 'biometric'] as const
export type SecurityLockMode = (typeof SECURITY_LOCK_MODES)[number]

/** All monetary values are stored as integer minor units (e.g. centavos) to avoid float errors. */
export interface Transaction {
  id: string
  type: TransactionType
  amountMinor: number
  categoryId: string
  description: string
  /** ISO date string, e.g. "2026-08-14" */
  date: string
  paymentMethod: PaymentMethod
  /** Set when this transaction was generated from a recurring rule. */
  recurringId?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  type: TransactionType
  /** Lucide icon name, e.g. "utensils" */
  icon: string
  /** Hex color, e.g. "#f97316" */
  color: string
  isDefault: boolean
  createdAt: string
}

export interface Budget {
  id: string
  /** "YYYY-MM" */
  month: string
  /** null represents the overall monthly budget (not tied to a category) */
  categoryId: string | null
  amountMinor: number
  createdAt: string
  updatedAt: string
}

export interface Goal {
  id: string
  name: string
  targetAmountMinor: number
  currentAmountMinor: number
  /** ISO date string, or null if no target date */
  targetDate: string | null
  icon: string
  color: string
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export interface RecurringTransaction {
  id: string
  type: TransactionType
  amountMinor: number
  categoryId: string
  description: string
  paymentMethod: PaymentMethod
  frequency: RecurringFrequency
  /** ISO date string of the first occurrence */
  startDate: string
  /** ISO date string of the next date a transaction should be generated */
  nextOccurrence: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  id: 'settings'
  theme: ThemeMode
  currency: CurrencyCode
  hasOnboarded: boolean
  securityLock: SecurityLockMode
  installPromptDismissedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SpendlyExport {
  version: 1
  exportedAt: string
  transactions: Transaction[]
  categories: Category[]
  budgets: Budget[]
  goals: Goal[]
  recurring: RecurringTransaction[]
  settings: AppSettings[]
}
