import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Input'
import { Dropdown } from '@/components/ui/Dropdown'
import { useCategories } from '@/hooks/useCategories'
import { PAYMENT_METHODS } from '@/types/models'
import type { TransactionFilters } from '@/hooks/useTransactions'

export interface TransactionFilterSheetProps {
  open: boolean
  onClose: () => void
  filters: TransactionFilters
  onChange: (filters: TransactionFilters) => void
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  gcash: 'GCash',
  gotyme: 'GoTyme',
  maribank: 'Maribank',
  unionbank: 'Union Bank',
  securitybank: 'Security Bank',
  metrobank: 'Metro Bank',
  credit_card: 'Credit Card',
  other: 'Other',
}

export function TransactionFilterSheet({ open, onClose, filters, onChange }: TransactionFilterSheetProps) {
  const { categories } = useCategories()

  function update(patch: Partial<TransactionFilters>) {
    onChange({ ...filters, ...patch })
  }

  function reset() {
    onChange({ sort: filters.sort })
  }

  return (
    <Sheet open={open} onClose={onClose} title="Filter Transactions">
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="filter-type">Type</Label>
          <Dropdown
            id="filter-type"
            className="mt-1.5"
            value={filters.type ?? ''}
            onChange={(v) => update({ type: (v || undefined) as TransactionFilters['type'] })}
            options={[
              { value: '', label: 'All types' },
              { value: 'expense', label: 'Expense' },
              { value: 'income', label: 'Income' },
            ]}
          />
        </div>

        <div>
          <Label htmlFor="filter-category">Category</Label>
          <Dropdown
            id="filter-category"
            className="mt-1.5"
            value={filters.categoryId ?? ''}
            onChange={(v) => update({ categoryId: v || undefined })}
            options={[
              { value: '', label: 'All categories' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
        </div>

        <div>
          <Label htmlFor="filter-payment">Payment Method</Label>
          <Dropdown
            id="filter-payment"
            className="mt-1.5"
            value={filters.paymentMethod ?? ''}
            onChange={(v) => update({ paymentMethod: (v || undefined) as TransactionFilters['paymentMethod'] })}
            options={[
              { value: '', label: 'All methods' },
              ...PAYMENT_METHODS.map((m) => ({ value: m, label: PAYMENT_METHOD_LABELS[m] })),
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="filter-start">From</Label>
            <input
              id="filter-start"
              type="date"
              className="mt-1.5 h-12 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={filters.startDate ?? ''}
              onChange={(e) => update({ startDate: e.target.value || undefined })}
            />
          </div>
          <div>
            <Label htmlFor="filter-end">To</Label>
            <input
              id="filter-end"
              type="date"
              className="mt-1.5 h-12 w-full rounded-xl border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={filters.endDate ?? ''}
              onChange={(e) => update({ endDate: e.target.value || undefined })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="filter-sort">Sort</Label>
          <Dropdown
            id="filter-sort"
            className="mt-1.5"
            value={filters.sort ?? 'newest'}
            onChange={(v) => update({ sort: v as TransactionFilters['sort'] })}
            options={[
              { value: 'newest', label: 'Newest first' },
              { value: 'oldest', label: 'Oldest first' },
            ]}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={reset}>
            Reset
          </Button>
          <Button type="button" className="flex-1" onClick={onClose}>
            Apply
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
