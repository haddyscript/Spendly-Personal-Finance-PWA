import { Check } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { CURRENCIES } from '@/types/models'
import type { CurrencyCode } from '@/types/models'
import { CURRENCY_INFO } from '@/lib/currency'
import { cn } from '@/lib/cn'

export interface CurrencyPickerSheetProps {
  open: boolean
  onClose: () => void
  value: CurrencyCode
  onSelect: (currency: CurrencyCode) => void
}

export function CurrencyPickerSheet({ open, onClose, value, onSelect }: CurrencyPickerSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Currency">
      <div className="flex flex-col gap-1">
        {CURRENCIES.map((code) => {
          const info = CURRENCY_INFO[code]
          const isSelected = code === value
          return (
            <button
              key={code}
              type="button"
              onClick={() => {
                onSelect(code)
                onClose()
              }}
              className={cn(
                'flex items-center gap-3 rounded-xl p-3 text-left transition-colors active:bg-secondary',
                isSelected ? 'bg-accent' : 'hover:bg-secondary',
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-base font-semibold">
                {info.symbol}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium">{code}</p>
                <p className="text-xs text-muted-foreground">{info.name}</p>
              </div>
              {isSelected && <Check className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}
