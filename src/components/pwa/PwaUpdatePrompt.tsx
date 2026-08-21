import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { GLASS_STRONG } from '@/lib/glass'

/** How often to re-check for a new deploy while the app stays open in the background. */
const UPDATE_CHECK_INTERVAL_MS = 60_000

export function PwaUpdatePrompt() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      if (reg) setRegistration(reg)
    },
  })

  useEffect(() => {
    if (!registration) return

    // Installed PWAs are usually resumed from the background rather than freshly
    // loaded, so a one-time check at registration can miss deploys that land while
    // the app is idle. Re-check on an interval and whenever the app becomes visible.
    registration.update()
    const interval = window.setInterval(() => registration.update(), UPDATE_CHECK_INTERVAL_MS)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') registration.update()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleVisibility)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleVisibility)
    }
  }, [registration])

  if (!needRefresh) return null

  return (
    <div
      className={`${GLASS_STRONG} fixed inset-x-4 bottom-24 z-[70] mx-auto flex max-w-sm items-center gap-3 rounded-2xl p-4 shadow-2xl animate-toast-in sm:bottom-6`}
    >
      <RefreshCw className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Update available</p>
        <p className="text-xs text-muted-foreground">Reload to get the latest version.</p>
      </div>
      <Button size="sm" onClick={() => updateServiceWorker(true)}>
        Reload
      </Button>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        aria-label="Dismiss update notice"
        className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-secondary"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
