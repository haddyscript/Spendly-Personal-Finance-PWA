import Dexie, { type EntityTable } from 'dexie'
import type { AppSettings, Budget, Category, Goal, RecurringTransaction, Transaction } from '@/types/models'
import { DEFAULT_CATEGORIES } from '@/db/defaultCategories'

export class SpendlyDB extends Dexie {
  transactions!: EntityTable<Transaction, 'id'>
  categories!: EntityTable<Category, 'id'>
  budgets!: EntityTable<Budget, 'id'>
  goals!: EntityTable<Goal, 'id'>
  recurring!: EntityTable<RecurringTransaction, 'id'>
  settings!: EntityTable<AppSettings, 'id'>

  constructor() {
    super('spendly-db')

    this.version(1).stores({
      transactions: 'id, type, categoryId, date, paymentMethod, recurringId, [type+date]',
      categories: 'id, type',
      budgets: 'id, month, categoryId, [month+categoryId]',
      goals: 'id, targetDate, completedAt',
      recurring: 'id, nextOccurrence',
      settings: 'id',
    })

    // v2: goals.createdAt needs to be indexed for useGoals' orderBy('createdAt').
    this.version(2).stores({
      transactions: 'id, type, categoryId, date, paymentMethod, recurringId, [type+date]',
      categories: 'id, type',
      budgets: 'id, month, categoryId, [month+categoryId]',
      goals: 'id, targetDate, completedAt, createdAt',
      recurring: 'id, nextOccurrence',
      settings: 'id',
    })

    this.on('populate', () => this.populateDefaults())
  }

  private async populateDefaults() {
    await this.categories.bulkAdd(DEFAULT_CATEGORIES)
    const now = new Date().toISOString()
    await this.settings.add({
      id: 'settings',
      theme: 'system',
      currency: 'PHP',
      hasOnboarded: false,
      securityLock: 'none',
      installPromptDismissedAt: null,
      createdAt: now,
      updatedAt: now,
    })
  }
}

export const db = new SpendlyDB()
