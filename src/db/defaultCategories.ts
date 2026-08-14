import type { Category } from '@/types/models'

const now = () => new Date().toISOString()

/** Fixed ids so seeding is idempotent and demo data can reference categories predictably. */
export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food', type: 'expense', icon: 'Utensils', color: '#f97316', isDefault: true, createdAt: now() },
  { id: 'cat-transportation', name: 'Transportation', type: 'expense', icon: 'Car', color: '#3b82f6', isDefault: true, createdAt: now() },
  { id: 'cat-shopping', name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', isDefault: true, createdAt: now() },
  { id: 'cat-bills', name: 'Bills', type: 'expense', icon: 'Receipt', color: '#64748b', isDefault: true, createdAt: now() },
  { id: 'cat-entertainment', name: 'Entertainment', type: 'expense', icon: 'Film', color: '#a855f7', isDefault: true, createdAt: now() },
  { id: 'cat-health', name: 'Health', type: 'expense', icon: 'HeartPulse', color: '#ef4444', isDefault: true, createdAt: now() },
  { id: 'cat-gym', name: 'Gym', type: 'expense', icon: 'Dumbbell', color: '#14b8a6', isDefault: true, createdAt: now() },
  { id: 'cat-education', name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#6366f1', isDefault: true, createdAt: now() },
  { id: 'cat-travel', name: 'Travel', type: 'expense', icon: 'Plane', color: '#0ea5e9', isDefault: true, createdAt: now() },
  { id: 'cat-subscriptions', name: 'Subscriptions', type: 'expense', icon: 'Repeat', color: '#8b5cf6', isDefault: true, createdAt: now() },
  { id: 'cat-family', name: 'Family', type: 'expense', icon: 'Users', color: '#d946ef', isDefault: true, createdAt: now() },
  { id: 'cat-other-expense', name: 'Other', type: 'expense', icon: 'MoreHorizontal', color: '#78716c', isDefault: true, createdAt: now() },
]

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'cat-salary', name: 'Salary', type: 'income', icon: 'Wallet', color: '#10b981', isDefault: true, createdAt: now() },
  { id: 'cat-freelance', name: 'Freelance', type: 'income', icon: 'Laptop', color: '#22c55e', isDefault: true, createdAt: now() },
  { id: 'cat-business', name: 'Business', type: 'income', icon: 'Briefcase', color: '#059669', isDefault: true, createdAt: now() },
  { id: 'cat-investment', name: 'Investment', type: 'income', icon: 'TrendingUp', color: '#0d9488', isDefault: true, createdAt: now() },
  { id: 'cat-gift', name: 'Gift', type: 'income', icon: 'Gift', color: '#84cc16', isDefault: true, createdAt: now() },
  { id: 'cat-other-income', name: 'Other', type: 'income', icon: 'MoreHorizontal', color: '#65a30d', isDefault: true, createdAt: now() },
]

export const DEFAULT_CATEGORIES: Category[] = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]
