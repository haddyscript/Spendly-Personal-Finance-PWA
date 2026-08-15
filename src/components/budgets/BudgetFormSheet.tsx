import { useState } from 'react'
import type { FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { useCategoryMap } from '@/hooks/useCategories'
import { useSettings } from '@/hooks/useSettings'
import { useToast } from '@/hooks/useToast'
import { deleteBudget, setCategoryBudget, setOverallBudget } from '@/services/budgetService'
import { fromMinorUnits, toMinorUnits } from '@/utils/money'
import { monthKeyToLabel } from '@/utils/date'

export interface BudgetFormSheetProps {
  open: boolean
  onClose: () => void
  month: string
  categoryId: string | null
  budgetId?: string
  existingAmountMinor?: number
}

export function BudgetFormSheet({ open, onClose, month, categoryId, budgetId, existingAmountMinor }: BudgetFormSheetProps) {
  const { categoryMap } = useCategoryMap()
  const category = categoryId ? categoryMap.get(categoryId) : undefined

  return (
    <Sheet open={open} onClose={onClose} title={category ? `${category.name} Budget` : 'Overall Budget'}>
      {open && (
        <BudgetForm
          key={`${month}:${categoryId ?? 'overall'}`}
          month={month}
          categoryId={categoryId}
          budgetId={budgetId}
          category={category}
          existingAmountMinor={existingAmountMinor}
          onClose={onClose}
        />
      )}
    </Sheet>
  )
}

interface BudgetFormProps {
  month: string
  categoryId: string | null
  budgetId?: string
  category?: { icon: string; color: string; name: string }
  existingAmountMinor?: number
  onClose: () => void
}

function BudgetForm({ month, categoryId, budgetId, category, existingAmountMinor, onClose }: BudgetFormProps) {
  const { settings } = useSettings()
  const { success, error } = useToast()
  const [amount, setAmount] = useState(existingAmountMinor ? String(fromMinorUnits(existingAmountMinor)) : '')
  const [submitting, setSubmitting] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) {
      error('Enter a valid amount')
      return
    }

    setSubmitting(true)
    try {
      const amountMinor = toMinorUnits(parsed)
      if (categoryId) {
        await setCategoryBudget(month, categoryId, amountMinor)
      } else {
        await setOverallBudget(month, amountMinor)
      }
      success('Budget saved')
      onClose()
    } catch {
      error('Something went wrong', 'Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!budgetId) return
    await deleteBudget(budgetId)
    setConfirmDeleteOpen(false)
    success('Budget deleted')
    onClose()
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">{monthKeyToLabel(month)}</p>

        {category && (
          <div className="flex items-center gap-3">
            <CategoryIcon icon={category.icon} color={category.color} />
            <span className="font-medium">{category.name}</span>
          </div>
        )}

        <div>
          <Label htmlFor="budget-amount">Monthly Limit</Label>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input px-4 focus-within:ring-2 focus-within:ring-ring">
            <span className="text-xl font-semibold text-muted-foreground">{settings?.currency === 'PHP' || !settings ? '₱' : ''}</span>
            <input
              id="budget-amount"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              className="h-14 w-full bg-transparent text-2xl font-semibold tabular-nums outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="flex gap-3">
          {budgetId && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Delete budget"
              onClick={() => setConfirmDeleteOpen(true)}
            >
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          )}
          <Button type="submit" size="lg" className="flex-1" disabled={submitting}>
            Save Budget
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete budget?"
        description="This removes the spending limit for this budget. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  )
}
