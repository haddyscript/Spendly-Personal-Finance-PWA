import { Check } from 'lucide-react'
import { useSyncStatus } from '@/hooks/useSyncStatus'
import { cn } from '@/lib/cn'

const CONFIG = {
  saved: { label: 'Saved on device', className: 'text-success' },
  reconnected: { label: 'Back online', className: 'text-success' },
  offline: { label: 'Offline', className: 'text-muted-foreground' },
} as const

export function SyncStatusIndicator() {
  const status = useSyncStatus()
  const { label, className } = CONFIG[status]

  return (
    <div className="flex items-center justify-center gap-1.5 py-1.5 safe-top" role="status">
      {status === 'offline' ? (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
      ) : (
        <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
      )}
      <span className={cn('text-xs font-medium', className)}>{label}</span>
    </div>
  )
}
