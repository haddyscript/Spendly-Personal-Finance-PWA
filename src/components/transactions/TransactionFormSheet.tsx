import { useState } from 'react'
import type { FormEvent } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { CategoryPicker } from '@/components/categories/CategoryPicker'
import { useCategoriesByType } from '@/hooks/useCategories'
import { useSettings } from '@/hooks/useSettings'
import { useToast } from '@/hooks/useToast'
import { addTransaction, deleteTransaction, notifyTransactionAdded, updateTransaction } from '@/services/transactionService'
import { checkBudgetAlerts } from '@/services/budgetService'
import { checkStreakMilestone } from '@/services/streakService'
import { fromMinorUnits, toMinorUnits } from '@/utils/money'
import { toDateKey } from '@/utils/date'
import { PAYMENT_METHODS } from '@/types/models'
import type { PaymentMethod, Transaction, TransactionType } from '@/types/models'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Trash2 } from 'lucide-react'
import { PAYMENT_METHOD_LABELS } from '@/lib/paymentMethods'

export interface TransactionFormSheetProps {
  open: boolean
  onClose: () => void
  transaction?: Transaction
  defaultType?: TransactionType
}

export function TransactionFormSheet({ open, onClose, transaction, defaultType = 'expense' }: TransactionFormSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={transaction ? 'Edit Transaction' : 'Add Transaction'}>
      {open && (
        <TransactionForm key={transaction?.id ?? 'new'} transaction={transaction} defaultType={defaultType} onClose={onClose} />
      )}
    </Sheet>
  )
}

interface TransactionFormProps {
  transaction?: Transaction
  defaultType: TransactionType
  onClose: () => void
}

function TransactionForm({ transaction, defaultType, onClose }: TransactionFormProps) {
  const { settings } = useSettings()
  const { success, error } = useToast()

  const [type, setType] = useState<TransactionType>(transaction?.type ?? defaultType)
  const [amount, setAmount] = useState(transaction ? String(fromMinorUnits(transaction.amountMinor)) : '')
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? '')
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [date, setDate] = useState(transaction?.date ?? toDateKey())
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(transaction?.paymentMethod ?? 'cash')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { categories } = useCategoriesByType(type)
  const effectiveCategoryId = categoryId || categories[0]?.id || ''
  const selectedCategory = categories.find((c) => c.id === effectiveCategoryId)

  function handleTypeChange(nextType: TransactionType) {
    setType(nextType)
    setCategoryId('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)

    if (!parsedAmount || parsedAmount <= 0) {
      error('Enter a valid amount')
      return
    }
    if (!effectiveCategoryId) {
      error('Choose a category')
      return
    }

    setSubmitting(true)
    try {
      const amountMinor = toMinorUnits(parsedAmount)
      if (transaction) {
        await updateTransaction(transaction.id, {
          type,
          amountMinor,
          categoryId: effectiveCategoryId,
          description: description.trim() || selectedCategory?.name || 'Transaction',
          date,
          paymentMethod,
        })
        success('Transaction updated')
      } else {
        const created = await addTransaction({
          type,
          amountMinor,
          categoryId: effectiveCategoryId,
          description: description.trim() || selectedCategory?.name || 'Transaction',
          date,
          paymentMethod,
        })
        success('Transaction added')
        void notifyTransactionAdded(created)
        if (type === 'expense') {
          void checkBudgetAlerts(date.slice(0, 7), effectiveCategoryId)
          void checkStreakMilestone()
        }
      }
      onClose()
    } catch {
      error('Something went wrong', 'Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!transaction) return
    await deleteTransaction(transaction.id)
    setConfirmDeleteOpen(false)
    success('Transaction deleted')
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
              onClick={() => handleTypeChange(t)}
              className={`h-11 rounded-lg text-sm font-semibold capitalize transition-colors ${
                type === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div>
          <Label htmlFor="amount">Amount</Label>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input px-4 focus-within:ring-2 focus-within:ring-ring">
            <span className="text-xl font-semibold text-muted-foreground">
              {settings?.currency === 'PHP' || !settings ? '₱' : ''}
            </span>
            <input
              id="amount"
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
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            className="mt-1.5 min-h-11"
            rows={1}
            placeholder="Lunch at restaurant"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              className="mt-1.5"
              value={date}
              max={toDateKey()}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label>Today</Label>
            <Button type="button" variant="outline" className="mt-1.5 w-full" onClick={() => setDate(toDateKey())}>
              Use Today
            </Button>
          </div>
        </div>

        <div>
          <Label>Payment Method</Label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  paymentMethod === method
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-foreground hover:bg-secondary'
                }`}
              >
                {PAYMENT_METHOD_LABELS[method]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          {transaction && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Delete transaction"
              onClick={() => setConfirmDeleteOpen(true)}
            >
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          )}
          <Button type="submit" size="lg" className="flex-1" disabled={submitting}>
            {transaction ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </form>

      <CategoryPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        type={type}
        selectedId={effectiveCategoryId}
        onSelect={setCategoryId}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete transaction?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  )
}
