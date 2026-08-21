import { Sheet } from '@/components/ui/Sheet'
import { PaymentMethodIcon } from '@/components/transactions/PaymentMethodIcon'
import { PAYMENT_METHODS } from '@/types/models'
import { PAYMENT_METHOD_LABELS } from '@/lib/paymentMethods'
import type { PaymentMethod } from '@/types/models'

export interface PaymentMethodPickerProps {
  open: boolean
  onClose: () => void
  selected: PaymentMethod
  onSelect: (method: PaymentMethod) => void
}

export function PaymentMethodPicker({ open, onClose, selected, onSelect }: PaymentMethodPickerProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Choose payment method">
      <div className="grid grid-cols-3 gap-3">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => {
              onSelect(method)
              onClose()
            }}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-colors ${
              selected === method ? 'border-primary bg-accent' : 'border-transparent hover:bg-secondary'
            }`}
          >
            <PaymentMethodIcon method={method} size={32} />
            <span className="line-clamp-2 text-xs font-medium">{PAYMENT_METHOD_LABELS[method]}</span>
          </button>
        ))}
      </div>
    </Sheet>
  )
}
