import Dexie, { type EntityTable } from 'dexie'
import type { AppSettings, Budget, Category, Goal, RecurringTransaction, Transaction } from '@/types/models'
import { DEFAULT_CATEGORIES, MOTORCYCLE_CATEGORY } from '@/db/defaultCategories'

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

    // v3: adds Transaction.settledAt for tracking paid-off Atome/Credit Card spending.
    // Backfilled all existing credit-method transactions as settled. Superseded by v4 below —
    // this couldn't distinguish spending that was genuinely already paid from a recent purchase
    // still awaiting its next bill (e.g. an Atome purchase due the 15th), so it could silently
    // mark real outstanding debt as paid.
    this.version(3)
      .stores({
        transactions: 'id, type, categoryId, date, paymentMethod, recurringId, [type+date]',
        categories: 'id, type',
        budgets: 'id, month, categoryId, [month+categoryId]',
        goals: 'id, targetDate, completedAt, createdAt',
        recurring: 'id, nextOccurrence',
        settings: 'id',
      })
      .upgrade(async (tx) => {
        const now = new Date().toISOString()
        await tx
          .table('transactions')
          .where('paymentMethod')
          .anyOf(['atome', 'credit_card'])
          .and((t) => t.type === 'expense')
          .modify({ settledAt: now })
      })

    // v4: reverses v3's blanket auto-settle. There's no reliable way to tell "already paid before
    // this feature existed" apart from "still owed" from the data alone, so the safe default is to
    // treat everything as outstanding and let the Credit to Pay sheet's mark-as-paid actions be the
    // only source of truth going forward.
    this.version(4)
      .stores({
        transactions: 'id, type, categoryId, date, paymentMethod, recurringId, [type+date]',
        categories: 'id, type',
        budgets: 'id, month, categoryId, [month+categoryId]',
        goals: 'id, targetDate, completedAt, createdAt',
        recurring: 'id, nextOccurrence',
        settings: 'id',
      })
      .upgrade(async (tx) => {
        await tx
          .table('transactions')
          .where('paymentMethod')
          .anyOf(['atome', 'credit_card'])
          .and((t) => t.type === 'expense' && !!t.settledAt)
          .modify((t) => {
            delete t.settledAt
          })
      })

    // v5: adds a dedicated Motorcycle expense category, split out from the general
    // Transportation category. populateDefaults() already covers brand-new installs via
    // DEFAULT_EXPENSE_CATEGORIES — this upgrade backfills it for databases created before it existed.
    this.version(5)
      .stores({
        transactions: 'id, type, categoryId, date, paymentMethod, recurringId, [type+date]',
        categories: 'id, type',
        budgets: 'id, month, categoryId, [month+categoryId]',
        goals: 'id, targetDate, completedAt, createdAt',
        recurring: 'id, nextOccurrence',
        settings: 'id',
      })
      .upgrade(async (tx) => {
        const existing = await tx.table('categories').get(MOTORCYCLE_CATEGORY.id)
        if (!existing) {
          await tx.table('categories').add(MOTORCYCLE_CATEGORY)
        }
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
      notificationsEnabled: false,
      voiceFeedbackEnabled: true,
      createdAt: now,
      updatedAt: now,
    })
  }
}

export const db = new SpendlyDB()
