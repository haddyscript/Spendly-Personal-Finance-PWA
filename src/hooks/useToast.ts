import { useCallback } from 'react'
import { pushToast, type ToastItem } from '@/lib/toastStore'

export function useToast() {
  const toast = useCallback((toast: Omit<ToastItem, 'id'>) => pushToast(toast), [])
  const success = useCallback(
    (title: string, description?: string, spokenText?: string) => pushToast({ title, description, spokenText, variant: 'success' }),
    [],
  )
  const error = useCallback(
    (title: string, description?: string, spokenText?: string) => pushToast({ title, description, spokenText, variant: 'destructive' }),
    [],
  )
  return { toast, success, error }
}
