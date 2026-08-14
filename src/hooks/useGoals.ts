import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'

export function useGoals() {
  const goals = useLiveQuery(() => db.goals.orderBy('createdAt').reverse().toArray(), [])
  return { goals: goals ?? [], isLoading: goals === undefined }
}

export function useGoal(id: string | undefined) {
  const goal = useLiveQuery(() => (id ? db.goals.get(id) : undefined), [id])
  return { goal, isLoading: goal === undefined }
}
