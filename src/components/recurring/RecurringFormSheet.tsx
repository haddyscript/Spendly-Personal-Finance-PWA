import { useState } from 'react'
import type { FormEvent } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { CategoryPicker } from '@/components/categories/CategoryPicker'
import { useCategoriesByType } from '@/hooks/useCategories'
import { useToast } from '@/hooks/useToast'
import { addRecurring, deleteRecurring, updateRecurring } from '@/services/recurringService'
import { toMinorUnits, fromMinorUnits } from '@/utils/money'
import { toDateKey } from '@/utils/date'
import { PAYMENT_METHODS, RECURRING_FREQUENCIES } from '@/types/models'
import type { PaymentMethod, RecurringFrequency, RecurringTransaction, TransactionType } from '@/types/models'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Trash2 } from 'lucide-react'
import { PAYMENT_METHOD_LABELS } from '@/lib/paymentMethods'
import { PaymentMethodIcon } from '@/components/transactions/PaymentMethodIcon'

const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

export interface RecurringFormSheetProps {
  open: boolean
  onClose: () => void
  rule?: RecurringTransaction
}

export function RecurringFormSheet({ open, onClose, rule }: RecurringFormSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={rule ? 'Edit Recurring' : 'New Recurring'}>
      {open && <RecurringForm key={rule?.id ?? 'new'} rule={rule} onClose={onClose} />}
    </Sheet>
  )
}

interface RecurringFormProps {
  rule?: RecurringTransaction
  onClose: () => void
}

function RecurringForm({ rule, onClose }: RecurringFormProps) {
  const { success, error } = useToast()
  const [type, setType] = useState<TransactionType>(rule?.type ?? 'expense')
  const [amount, setAmount] = useState(rule ? String(fromMinorUnits(rule.amountMinor)) : '')
  const [categoryId, setCategoryId] = useState(rule?.categoryId ?? '')
  const [description, setDescription] = useState(rule?.description ?? '')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(rule?.paymentMethod ?? 'cash')
  const [frequency, setFrequency] = useState<RecurringFrequency>(rule?.frequency ?? 'monthly')
  const [startDate, setStartDate] = useState(rule?.startDate ?? toDateKey())
  const [pickerOpen, setPickerOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { categories } = useCategoriesByType(type)
  const selectedCategory = categories.find((c) => c.id === categoryId)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) {
      error('Enter a valid amount')
      return
    }
    if (!categoryId) {
      error('Choose a category')
      return
    }
    if (!description.trim()) {
      error('Enter a description')
      return
    }

    setSubmitting(true)
    try {
      const amountMinor = toMinorUnits(parsed)
      if (rule) {
        await updateRecurring(rule.id, { type, amountMinor, categoryId, description: description.trim(), paymentMethod, frequency })
        success('Recurring transaction updated')
      } else {
        await addRecurring({ type, amountMinor, categoryId, description: description.trim(), paymentMethod, frequency, startDate })
        success('Recurring transaction created')
      }
      onClose()
    } catch {
      error('Something went wrong', 'Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!rule) return
    await deleteRecurring(rule.id)
    setConfirmDeleteOpen(false)
    success('Recurring transaction deleted')
    onClose()
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t)
                setCategoryId('')
              }}
              className={`h-11 rounded-lg text-sm font-semibold capitalize transition-colors ${
                type === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div>
          <Label htmlFor="recurring-description">Description</Label>
          <Input
            id="recurring-description"
            className="mt-1.5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Netflix"
          />
        </div>

        <div>
          <Label htmlFor="recurring-amount">Amount</Label>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input px-4 focus-within:ring-2 focus-within:ring-ring">
            <span className="text-xl font-semibold text-muted-foreground">₱</span>
            <input
              id="recurring-amount"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              className="h-14 w-full bg-transparent text-2xl font-semibold tabular-nums outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div>
          <Label>Category</Label>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="mt-1.5 flex h-14 w-full items-center gap-3 rounded-xl border border-input px-3 text-left"
          >
            {selectedCategory ? (
              <>
                <CategoryIcon icon={selectedCategory.icon} color={selectedCategory.color} size="sm" />
                <span className="text-[15px] font-medium">{selectedCategory.name}</span>
              </>
            ) : (
              <span className="text-[15px] text-muted-foreground">Select a category</span>
            )}
          </button>
        </div>

        <div>
          <Label>Frequency</Label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {RECURRING_FREQUENCIES.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  frequency === f ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-secondary'
                }`}
              >
                {FREQUENCY_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        {!rule && (
          <div>
            <Label htmlFor="recurring-start">Start Date</Label>
            <Input id="recurring-start" type="date" className="mt-1.5" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
        )}

        <div>
          <Label>Payment Method</Label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`flex h-12 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors ${
                  paymentMethod === method
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-foreground hover:bg-secondary'
                }`}
              >
                <PaymentMethodIcon method={method} size={22} />
                <span className="truncate">{PAYMENT_METHOD_LABELS[method]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          {rule && (
            <Button type="button" variant="outline" size="icon" aria-label="Delete recurring transaction" onClick={() => setConfirmDeleteOpen(true)}>
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          )}
          <Button type="submit" size="lg" className="flex-1" disabled={submitting}>
            {rule ? 'Save Changes' : 'Create Recurring'}
          </Button>
        </div>
      </form>

      <CategoryPicker open={pickerOpen} onClose={() => setPickerOpen(false)} type={type} selectedId={categoryId} onSelect={setCategoryId} />

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete recurring transaction?"
        description="Future occurrences will no longer be generated. Past transactions are kept."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  )
}
