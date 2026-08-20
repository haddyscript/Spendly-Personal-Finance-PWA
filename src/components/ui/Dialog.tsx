import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { GLASS_STRONG } from '@/lib/glass'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  labelledBy?: string
}

// Matches the dialog-out animation duration below, so the panel finishes fading before unmount.
const CLOSE_ANIMATION_MS = 150

export function Dialog({ open, onClose, children, className, labelledBy }: DialogProps) {
  const [rendered, setRendered] = useState(open)

  useEffect(() => {
    if (open) {
      setRendered(true)
      return
    }
    if (!rendered) return
    const timer = setTimeout(() => setRendered(false), CLOSE_ANIMATION_MS)
    return () => clearTimeout(timer)
  }, [open, rendered])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!rendered) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={cn('absolute inset-0 bg-black/50', open ? 'animate-fade-in' : 'animate-fade-out')}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          GLASS_STRONG,
          'relative z-10 w-full max-w-sm rounded-2xl p-5 shadow-2xl',
          open ? 'animate-dialog-in' : 'animate-dialog-out',
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
