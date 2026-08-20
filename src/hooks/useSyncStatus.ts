import { useEffect, useState } from 'react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export type SyncStatus = 'saved' | 'offline' | 'reconnected'

const RECONNECTED_DISPLAY_MS = 2500

/**
 * Spendly has no server, so "online" only ever affects whether the connectivity indicator
 * shows a checkmark or a dot — every feature already works fully offline. This just tracks
 * which of the three states to display, including a brief "reconnected" pulse.
 */
export function useSyncStatus(): SyncStatus {
  const isOnline = useOnlineStatus()
  const [prevIsOnline, setPrevIsOnline] = useState(isOnline)
  const [status, setStatus] = useState<SyncStatus>(isOnline ? 'saved' : 'offline')

  if (isOnline !== prevIsOnline) {
    setPrevIsOnline(isOnline)
    setStatus(isOnline ? 'reconnected' : 'offline')
  }

  useEffect(() => {
    if (status !== 'reconnected') return
    const timer = setTimeout(() => setStatus('saved'), RECONNECTED_DISPLAY_MS)
    return () => clearTimeout(timer)
  }, [status])

  return status
}
