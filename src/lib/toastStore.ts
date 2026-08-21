import { haptic } from '@/lib/haptics'
import { speak } from '@/lib/speech'

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'destructive'
  /** Overrides what's spoken aloud — falls back to reading title + description when omitted. */
  spokenText?: string
}

type Listener = () => void

let toasts: ToastItem[] = []
let listeners: Listener[] = []

function emit() {
  for (const listener of listeners) listener()
}

export function subscribeToasts(listener: Listener): () => void {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export function getToastsSnapshot(): ToastItem[] {
  return toasts
}

export function pushToast(toast: Omit<ToastItem, 'id'>, durationMs = 3200): string {
  const id = crypto.randomUUID()
  toasts = [...toasts, { ...toast, id }]
  emit()
  haptic(toast.variant === 'success' ? 'success' : toast.variant === 'destructive' ? 'error' : 'light')
  speak(toast.spokenText ?? [toast.title, toast.description].filter(Boolean).join('. '))
  setTimeout(() => dismissToast(id), durationMs)
  return id
}

export function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}
