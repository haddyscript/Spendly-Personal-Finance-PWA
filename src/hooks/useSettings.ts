import { useLiveQuery } from 'dexie-react-hooks'
import { getSettings } from '@/services/settingsService'

export function useSettings() {
  const settings = useLiveQuery(() => getSettings(), [])
  return { settings, isLoading: settings === undefined }
}
