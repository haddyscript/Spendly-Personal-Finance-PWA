import { db } from '@/db/db'
import { createId } from '@/utils/id'
import { toDateKey, toMonthKey, lastNMonthKeys } from '@/utils/date'
import type { PaymentMethod, Transaction } from '@/types/models'

const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'gcash', 'bank', 'credit_card']

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomAmountMinor(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100)
}

interface ExpenseTemplate {
  categoryId: string
  description: string
  min: number
  max: number
  perMonth: number
}

const EXPENSE_TEMPLATES: ExpenseTemplate[] = [
  { categoryId: 'cat-food', description: 'Lunch at restaurant', min: 120, max: 450, perMonth: 14 },
  { categoryId: 'cat-food', description: 'Grocery run', min: 800, max: 2200, perMonth: 4 },
  { categoryId: 'cat-transportation', description: 'Gas', min: 300, max: 900, perMonth: 4 },
  { categoryId: 'cat-transportation', description: 'Grab ride', min: 90, max: 280, perMonth: 6 },
  { categoryId: 'cat-shopping', description: 'Online shopping', min: 350, max: 2500, perMonth: 3 },
  { categoryId: 'cat-bills', description: 'Electricity bill', min: 1800, max: 3200, perMonth: 1 },
  { categoryId: 'cat-bills', description: 'Water bill', min: 400, max: 700, perMonth: 1 },
  { categoryId: 'cat-entertainment', description: 'Movie night', min: 250, max: 700, perMonth: 2 },
  { categoryId: 'cat-health', description: 'Pharmacy', min: 200, max: 900, perMonth: 2 },
  { categoryId: 'cat-gym', description: 'Gym membership', min: 1200, max: 1200, perMonth: 1 },
  { categoryId: 'cat-subscriptions', description: 'Netflix', min: 549, max: 549, perMonth: 1 },
  { categoryId: 'cat-subscriptions', description: 'Spotify', min: 149, max: 149, perMonth: 1 },
  { categoryId: 'cat-family', description: 'Family support', min: 1000, max: 3000, perMonth: 1 },
]

function randomDateInMonth(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  const today = toDateKey()
  const day = Math.min(1 + Math.floor(Math.random() * daysInMonth), daysInMonth)
  const candidate = `${monthKey}-${String(day).padStart(2, '0')}`
  return candidate > today ? today : candidate
}

function buildTransaction(partial: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
  const now = new Date().toISOString()
  return { ...partial, id: createId(), createdAt: now, updatedAt: now }
}

function generateDemoTransactions(): Transaction[] {
  const months = lastNMonthKeys(4)
  const transactions: Transaction[] = []

  for (const month of months) {
    // Salary income twice a month
    for (const day of ['05', '20']) {
      const date = `${month}-${day}`
      if (date > toDateKey()) continue
      transactions.push(
        buildTransaction({
          type: 'income',
          amountMinor: randomAmountMinor(19000, 21000),
          categoryId: 'cat-salary',
          description: 'Salary',
          date,
          paymentMethod: 'bank',
        }),
      )
    }

    // Occasional freelance income
    if (Math.random() > 0.4) {
      transactions.push(
        buildTransaction({
          type: 'income',
          amountMinor: randomAmountMinor(3000, 9000),
          categoryId: 'cat-freelance',
          description: 'Freelance project',
          date: randomDateInMonth(month),
          paymentMethod: 'gcash',
        }),
      )
    }

    for (const template of EXPENSE_TEMPLATES) {
      for (let i = 0; i < template.perMonth; i++) {
        transactions.push(
          buildTransaction({
            type: 'expense',
            amountMinor: randomAmountMinor(template.min, template.max),
            categoryId: template.categoryId,
            description: template.description,
            date: randomDateInMonth(month),
            paymentMethod: randomOf(PAYMENT_METHODS),
          }),
        )
      }
    }
  }

  return transactions.sort((a, b) => a.date.localeCompare(b.date))
}

export async function seedDemoData(): Promise<void> {
  const transactions = generateDemoTransactions()
  await db.transactions.bulkAdd(transactions)

  const currentMonth = toMonthKey()
  const now = new Date().toISOString()

  await db.budgets.bulkAdd([
    { id: createId(), month: currentMonth, categoryId: null, amountMinor: 25000_00, createdAt: now, updatedAt: now },
    { id: createId(), month: currentMonth, categoryId: 'cat-food', amountMinor: 6000_00, createdAt: now, updatedAt: now },
    { id: createId(), month: currentMonth, categoryId: 'cat-transportation', amountMinor: 4000_00, createdAt: now, updatedAt: now },
    { id: createId(), month: currentMonth, categoryId: 'cat-entertainment', amountMinor: 2000_00, createdAt: now, updatedAt: now },
  ])

  await db.goals.bulkAdd([
    {
      id: createId(),
      name: 'New MacBook',
      targetAmountMinor: 60000_00,
      currentAmountMinor: 30000_00,
      targetDate: `${new Date().getFullYear()}-12-31`,
      icon: 'Laptop',
      color: '#6366f1',
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    },
    {
      id: createId(),
      name: 'Emergency Fund',
      targetAmountMinor: 100000_00,
      currentAmountMinor: 45000_00,
      targetDate: null,
      icon: 'PiggyBank',
      color: '#10b981',
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    },
  ])

  // Recurring rules dated for next month so they don't collide with already-seeded demo transactions.
  const nextMonthDate = (() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    d.setDate(1)
    return toDateKey(d)
  })()

  await db.recurring.bulkAdd([
    {
      id: createId(),
      type: 'expense',
      amountMinor: 549_00,
      categoryId: 'cat-subscriptions',
      description: 'Netflix',
      paymentMethod: 'credit_card',
      frequency: 'monthly',
      startDate: nextMonthDate,
      nextOccurrence: nextMonthDate,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId(),
      type: 'expense',
      amountMinor: 1500_00,
      categoryId: 'cat-bills',
      description: 'Internet',
      paymentMethod: 'bank',
      frequency: 'monthly',
      startDate: nextMonthDate,
      nextOccurrence: nextMonthDate,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ])
}
