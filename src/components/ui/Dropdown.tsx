import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { GLASS_STRONG } from '@/lib/glass'

export interface DropdownOption {
  value: string
  label: string
}

export interface DropdownProps {
  id?: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  className?: string
}

const MENU_MAX_HEIGHT = 260

export function Dropdown({ id, value, options, onChange, className }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ left: number; width: number; top?: number; bottom?: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selected = options.find((o) => o.value === value)

  function openMenu() {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < MENU_MAX_HEIGHT && rect.top > spaceBelow

    setPosition({
      left: rect.left,
      width: rect.width,
      ...(openUp ? { bottom: window.innerHeight - rect.top + 8 } : { top: rect.bottom + 8 }),
    })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    // capture:true so scrolling inside the parent sheet (which doesn't bubble) still closes the menu
    document.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-2 rounded-xl border border-input bg-transparent px-4 text-left text-[15px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        <span className="truncate">{selected?.label ?? 'Select…'}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open &&
        position &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[80]" onClick={() => setOpen(false)} aria-hidden="true" />
            <div
              role="listbox"
              className={cn(GLASS_STRONG, 'fixed z-[80] overflow-y-auto rounded-2xl p-1.5 shadow-2xl animate-fade-in')}
              style={{
                left: position.left,
                width: position.width,
                top: position.top,
                bottom: position.bottom,
                maxHeight: MENU_MAX_HEIGHT,
              }}
            >
              {options.map((option) => {
                const isSelected = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-[15px] transition-colors',
                      isSelected ? 'bg-accent font-medium text-accent-foreground' : 'text-foreground hover:bg-secondary',
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
          </>,
          document.body,
        )}
    </>
  )
}
