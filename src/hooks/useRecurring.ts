import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'

export function useRecurringRules() {
  const rules = useLiveQuery(() => db.recurring.toArray(), [])
  return { rules: rules ?? [], isLoading: rules === undefined }
}
