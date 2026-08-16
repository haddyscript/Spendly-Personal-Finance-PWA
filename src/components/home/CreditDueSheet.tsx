import { useState } from 'react'
import { Check } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { useOutstandingCredit } from '@/hooks/useTransactions'
import { useCategoryMap } from '@/hooks/useCategories'
import { useSettings } from '@/hooks/useSettings'
import { useToast } from '@/hooks/useToast'
import { markAllCreditSettled, markTransactionSettled } from '@/services/transactionService'
import { formatCurrency } from '@/utils/money'
import { formatShortDate } from '@/utils/date'
import { PAYMENT_METHOD_LABELS } from '@/lib/paymentMethods'

export interface CreditDueSheetProps {
  open: boolean
  onClose: () => void
}

export function CreditDueSheet({ open, onClose }: CreditDueSheetProps) {
  const { transactions, totalMinor, isLoading } = useOutstandingCredit()
  const { categoryMap } = useCategoryMap()
  const { settings } = useSettings()
  const { success } = useToast()
  const [confirmAllOpen, setConfirmAllOpen] = useState(false)

  async function handleMarkAll() {
    await markAllCreditSettled()
    setConfirmAllOpen(false)
    success('Marked as paid', `${formatCurrency(totalMinor, settings?.currency)} settled.`)
  }

  async function handleMarkOne(id: string, amountMinor: number) {
    await markTransactionSettled(id)
    success('Marked as paid', formatCurrency(amountMinor, settings?.currency))
  }

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Credit to Pay">
        {!isLoading && transactions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">You're all paid up.</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-2xl bg-secondary p-4">
              <div>
                <p className="text-xs text-muted-foreground">Total owed</p>
                <p className="text-2xl font-bold tabular-nums">{formatCurrency(totalMinor, settings?.currency)}</p>
              </div>
              <Button type="button" size="sm" onClick={() => setConfirmAllOpen(true)}>
                Mark all as paid
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {transactions.map((t) => {
                const category = categoryMap.get(t.categoryId)
                return (
                  <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-border p-3">
                    <CategoryIcon icon={category?.icon ?? 'MoreHorizontal'} color={category?.color ?? '#78716c'} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatShortDate(t.date)} · {PAYMENT_METHOD_LABELS[t.paymentMethod]}
                      </p>
                    </div>
                    <span className="shrink-0 text-[15px] font-semibold tabular-nums">
                      {formatCurrency(t.amountMinor, settings?.currency)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Mark ${t.description} as paid`}
                      onClick={() => handleMarkOne(t.id, t.amountMinor)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-input text-muted-foreground transition-colors hover:border-success hover:bg-success/10 hover:text-success"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Sheet>

      <ConfirmDialog
        open={confirmAllOpen}
        title="Mark everything as paid?"
        description={`This clears all ${transactions.length} outstanding purchase${transactions.length === 1 ? '' : 's'} totaling ${formatCurrency(totalMinor, settings?.currency)}.`}
        confirmLabel="Mark all as paid"
        onConfirm={handleMarkAll}
        onCancel={() => setConfirmAllOpen(false)}
      />
    </>
  )
}
