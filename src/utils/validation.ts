import {
  CURRENCIES,
  PAYMENT_METHODS,
  RECURRING_FREQUENCIES,
  SECURITY_LOCK_MODES,
  THEMES,
  TRANSACTION_TYPES,
} from '@/types/models'
import type { SpendlyExport } from '@/types/models'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  data?: SpendlyExport
}

function isString(v: unknown): v is string {
  return typeof v === 'string'
}
function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}
function isBoolean(v: unknown): v is boolean {
  return typeof v === 'boolean'
}
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function validateTransaction(t: unknown, i: number, errors: string[]): boolean {
  if (!isObject(t)) {
    errors.push(`transactions[${i}] is not an object`)
    return false
  }
  let ok = true
  if (!isString(t.id)) { errors.push(`transactions[${i}].id must be a string`); ok = false }
  if (!TRANSACTION_TYPES.includes(t.type as never)) { errors.push(`transactions[${i}].type is invalid`); ok = false }
  if (!isNumber(t.amountMinor)) { errors.push(`transactions[${i}].amountMinor must be a number`); ok = false }
  if (!isString(t.categoryId)) { errors.push(`transactions[${i}].categoryId must be a string`); ok = false }
  if (!isString(t.description)) { errors.push(`transactions[${i}].description must be a string`); ok = false }
  if (!isString(t.date)) { errors.push(`transactions[${i}].date must be a string`); ok = false }
  if (!PAYMENT_METHODS.includes(t.paymentMethod as never)) { errors.push(`transactions[${i}].paymentMethod is invalid`); ok = false }
  return ok
}

function validateCategory(c: unknown, i: number, errors: string[]): boolean {
  if (!isObject(c)) {
    errors.push(`categories[${i}] is not an object`)
    return false
  }
  let ok = true
  if (!isString(c.id)) { errors.push(`categories[${i}].id must be a string`); ok = false }
  if (!isString(c.name)) { errors.push(`categories[${i}].name must be a string`); ok = false }
  if (!TRANSACTION_TYPES.includes(c.type as never)) { errors.push(`categories[${i}].type is invalid`); ok = false }
  if (!isString(c.icon)) { errors.push(`categories[${i}].icon must be a string`); ok = false }
  if (!isString(c.color)) { errors.push(`categories[${i}].color must be a string`); ok = false }
  return ok
}

function validateBudget(b: unknown, i: number, errors: string[]): boolean {
  if (!isObject(b)) {
    errors.push(`budgets[${i}] is not an object`)
    return false
  }
  let ok = true
  if (!isString(b.id)) { errors.push(`budgets[${i}].id must be a string`); ok = false }
  if (!isString(b.month)) { errors.push(`budgets[${i}].month must be a string`); ok = false }
  if (b.categoryId !== null && !isString(b.categoryId)) { errors.push(`budgets[${i}].categoryId must be a string or null`); ok = false }
  if (!isNumber(b.amountMinor)) { errors.push(`budgets[${i}].amountMinor must be a number`); ok = false }
  return ok
}

function validateGoal(g: unknown, i: number, errors: string[]): boolean {
  if (!isObject(g)) {
    errors.push(`goals[${i}] is not an object`)
    return false
  }
  let ok = true
  if (!isString(g.id)) { errors.push(`goals[${i}].id must be a string`); ok = false }
  if (!isString(g.name)) { errors.push(`goals[${i}].name must be a string`); ok = false }
  if (!isNumber(g.targetAmountMinor)) { errors.push(`goals[${i}].targetAmountMinor must be a number`); ok = false }
  if (!isNumber(g.currentAmountMinor)) { errors.push(`goals[${i}].currentAmountMinor must be a number`); ok = false }
  return ok
}

function validateRecurring(r: unknown, i: number, errors: string[]): boolean {
  if (!isObject(r)) {
    errors.push(`recurring[${i}] is not an object`)
    return false
  }
  let ok = true
  if (!isString(r.id)) { errors.push(`recurring[${i}].id must be a string`); ok = false }
  if (!TRANSACTION_TYPES.includes(r.type as never)) { errors.push(`recurring[${i}].type is invalid`); ok = false }
  if (!isNumber(r.amountMinor)) { errors.push(`recurring[${i}].amountMinor must be a number`); ok = false }
  if (!RECURRING_FREQUENCIES.includes(r.frequency as never)) { errors.push(`recurring[${i}].frequency is invalid`); ok = false }
  if (!isBoolean(r.active)) { errors.push(`recurring[${i}].active must be a boolean`); ok = false }
  return ok
}

function validateSettings(s: unknown, i: number, errors: string[]): boolean {
  if (!isObject(s)) {
    errors.push(`settings[${i}] is not an object`)
    return false
  }
  let ok = true
  if (!CURRENCIES.includes(s.currency as never)) { errors.push(`settings[${i}].currency is invalid`); ok = false }
  if (!THEMES.includes(s.theme as never)) { errors.push(`settings[${i}].theme is invalid`); ok = false }
  if (!SECURITY_LOCK_MODES.includes(s.securityLock as never)) { errors.push(`settings[${i}].securityLock is invalid`); ok = false }
  return ok
}

/** Validates the shape of an imported Spendly export file before it touches IndexedDB. */
export function validateSpendlyExport(input: unknown): ValidationResult {
  const errors: string[] = []

  if (!isObject(input)) {
    return { valid: false, errors: ['File does not contain a valid JSON object.'] }
  }

  if (input.version !== 1) {
    errors.push('Unsupported or missing export version.')
  }

  const requiredArrays = ['transactions', 'categories', 'budgets', 'goals', 'recurring', 'settings'] as const
  for (const key of requiredArrays) {
    if (!Array.isArray(input[key])) {
      errors.push(`"${key}" must be an array.`)
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  const transactions = input.transactions as unknown[]
  const categories = input.categories as unknown[]
  const budgets = input.budgets as unknown[]
  const goals = input.goals as unknown[]
  const recurring = input.recurring as unknown[]
  const settings = input.settings as unknown[]

  transactions.forEach((t, i) => validateTransaction(t, i, errors))
  categories.forEach((c, i) => validateCategory(c, i, errors))
  budgets.forEach((b, i) => validateBudget(b, i, errors))
  goals.forEach((g, i) => validateGoal(g, i, errors))
  recurring.forEach((r, i) => validateRecurring(r, i, errors))
  settings.forEach((s, i) => validateSettings(s, i, errors))

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    errors: [],
    data: input as unknown as SpendlyExport,
  }
}
