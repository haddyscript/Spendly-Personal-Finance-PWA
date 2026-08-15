import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { GLASS_STRONG } from '@/lib/glass'

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      registration?.update()
    },
  })

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
