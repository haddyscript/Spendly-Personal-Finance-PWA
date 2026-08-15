import { useSyncExternalStore } from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { dismissToast, getToastsSnapshot, subscribeToasts } from '@/lib/toastStore'
import { cn } from '@/lib/cn'
import { GLASS_STRONG } from '@/lib/glass'

export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToastsSnapshot)

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
      aria-live="polite"
      role="status"
    >
      {toasts.map((t) => {
        const Icon = t.variant === 'success' ? CheckCircle2 : t.variant === 'destructive' ? AlertTriangle : Info
        return (
          <div
            key={t.id}
            className={cn(
              GLASS_STRONG,
              'pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-2xl px-4 py-3 shadow-lg',
            )}
          >
            <Icon
              className={cn(
                'mt-0.5 h-5 w-5 shrink-0',
                t.variant === 'success' && 'text-success',
                t.variant === 'destructive' && 'text-destructive',
                (!t.variant || t.variant === 'default') && 'text-muted-foreground',
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{t.title}</p>
              {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
