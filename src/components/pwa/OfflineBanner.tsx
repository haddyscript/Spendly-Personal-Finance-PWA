import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="flex items-center justify-center gap-2 bg-warning/15 px-4 py-2 text-xs font-medium text-warning safe-top" role="status">
      <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
      <span>You're offline — your data is still available.</span>
    </div>
  )
}
