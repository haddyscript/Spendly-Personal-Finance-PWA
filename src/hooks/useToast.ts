import { useCallback } from 'react'
import { pushToast, type ToastItem } from '@/lib/toastStore'

export function useToast() {
  const toast = useCallback((toast: Omit<ToastItem, 'id'>) => pushToast(toast), [])
  const success = useCallback((title: string, description?: string) => pushToast({ title, description, variant: 'success' }), [])
  const error = useCallback((title: string, description?: string) => pushToast({ title, description, variant: 'destructive' }), [])
  return { toast, success, error }
}
