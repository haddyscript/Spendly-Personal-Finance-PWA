import { Download, Share, X } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { Button } from '@/components/ui/Button'
import { GLASS } from '@/lib/glass'

export function InstallPrompt() {
  const { shouldShow, isIosSafari, canPromptAndroid, promptInstall, dismiss } = useInstallPrompt()

  if (!shouldShow) return null

  return (
    <div className={`${GLASS} relative flex items-start gap-3 rounded-2xl p-4 shadow-sm`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Download className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Install Spendly</p>
        <p className="mt-0.5 text-sm text-muted-foreground">Use Spendly like a native app.</p>

        {isIosSafari && !canPromptAndroid ? (
          <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            Tap <Share className="mx-0.5 inline h-3.5 w-3.5" aria-hidden="true" /> Share →
            <span className="font-medium text-foreground">Add to Home Screen</span>
          </p>
        ) : (
          <Button size="sm" className="mt-3" onClick={promptInstall}>
            Install
          </Button>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
