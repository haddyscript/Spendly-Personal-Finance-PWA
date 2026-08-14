import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
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
          <Select
            id="filter-type"
            className="mt-1.5"
            value={filters.type ?? ''}
            onChange={(e) => update({ type: (e.target.value || undefined) as TransactionFilters['type'] })}
          >
            <option value="">All types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="filter-category">Category</Label>
          <Select
            id="filter-category"
            className="mt-1.5"
            value={filters.categoryId ?? ''}
            onChange={(e) => update({ categoryId: e.target.value || undefined })}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="filter-payment">Payment Method</Label>
          <Select
            id="filter-payment"
            className="mt-1.5"
            value={filters.paymentMethod ?? ''}
            onChange={(e) => update({ paymentMethod: (e.target.value || undefined) as TransactionFilters['paymentMethod'] })}
          >
            <option value="">All methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {PAYMENT_METHOD_LABELS[m]}
              </option>
            ))}
          </Select>
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
          <Select id="filter-sort" className="mt-1.5" value={filters.sort ?? 'newest'} onChange={(e) => update({ sort: e.target.value as TransactionFilters['sort'] })}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </Select>
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
