import { db } from '@/db/db'
import type { Goal } from '@/types/models'
import { createId } from '@/utils/id'

export interface CreateGoalInput {
  name: string
  targetAmountMinor: number
  currentAmountMinor?: number
  targetDate: string | null
  icon?: string
  color?: string
}

export type UpdateGoalInput = Partial<Omit<CreateGoalInput, 'currentAmountMinor'>>

export async function getAllGoals(): Promise<Goal[]> {
  return db.goals.toArray()
}

export async function getGoalById(id: string): Promise<Goal | undefined> {
  return db.goals.get(id)
}

export async function addGoal(input: CreateGoalInput): Promise<Goal> {
  const now = new Date().toISOString()
  const goal: Goal = {
    id: createId(),
    name: input.name,
    targetAmountMinor: input.targetAmountMinor,
    currentAmountMinor: input.currentAmountMinor ?? 0,
    targetDate: input.targetDate,
    icon: input.icon ?? 'PiggyBank',
    color: input.color ?? '#6366f1',
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  }
  await db.goals.add(goal)
  return goal
}

export async function updateGoal(id: string, input: UpdateGoalInput): Promise<void> {
  await db.goals.update(id, { ...input, updatedAt: new Date().toISOString() })
}

export async function deleteGoal(id: string): Promise<void> {
  await db.goals.delete(id)
}

export async function addContribution(id: string, amountMinor: number): Promise<Goal | undefined> {
  const goal = await db.goals.get(id)
  if (!goal) return undefined

  const currentAmountMinor = goal.currentAmountMinor + amountMinor
  const now = new Date().toISOString()
  const completedAt = currentAmountMinor >= goal.targetAmountMinor ? goal.completedAt ?? now : null

  const updated: Goal = { ...goal, currentAmountMinor, completedAt, updatedAt: now }
  await db.goals.put(updated)
  return updated
}
