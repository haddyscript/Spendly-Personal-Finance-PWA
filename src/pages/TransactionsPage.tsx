import { useMemo, useState } from 'react'
import { ListFilter, Receipt, Search, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionFilterSheet } from '@/components/transactions/TransactionFilterSheet'
import { TransactionFormSheet } from '@/components/transactions/TransactionFormSheet'
import { useFilteredTransactions } from '@/hooks/useTransactions'
import type { TransactionFilters } from '@/hooks/useTransactions'
import { useCategoryMap } from '@/hooks/useCategories'
import { useSettings } from '@/hooks/useSettings'
import { calculateExpenseTotal, calculateIncomeTotal } from '@/utils/calculations'
import { formatCurrency } from '@/utils/money'
import type { Transaction } from '@/types/models'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import type { AppShellContext } from '@/components/layout/AppShell'

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategoryId = searchParams.get('category') ?? undefined
  const [filters, setFilters] = useState<TransactionFilters>({ sort: 'newest', categoryId: initialCategoryId })
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const { openAddTransaction } = useOutletContext<AppShellContext>()
  const { categoryMap } = useCategoryMap()
  const { settings } = useSettings()

  const filterChipCategory = filters.categoryId ? categoryMap.get(filters.categoryId) : undefined

  function clearCategoryFilter() {
    setFilters((f) => ({ ...f, categoryId: undefined }))
    setSearchParams((params) => {
      params.delete('category')
      return params
    })
  }

  const activeFilterCount = useMemo(
    () => Object.entries(filters).filter(([k, v]) => k !== 'sort' && v).length,
    [filters],
  )

  const { transactions, isLoading } = useFilteredTransactions({ ...filters, search })
  const hasAnyFilter = activeFilterCount > 0 || search.length > 0

  const expenseTotal = useMemo(() => calculateExpenseTotal(transactions), [transactions])
  const incomeTotal = useMemo(() => calculateIncomeTotal(transactions), [transactions])

  return (
    <div className="flex flex-col gap-4 pb-6 pt-6 safe-top">
      <PageHeader title="Transactions">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search transactions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-xl border border-input bg-transparent pl-10 pr-4 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Search transactions"
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            aria-label="Filter transactions"
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-input"
          >
            <ListFilter className="h-5 w-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </PageHeader>

      {filterChipCategory && (
        <div className="px-5">
          <button
            type="button"
            onClick={clearCategoryFilter}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-colors active:bg-accent/70"
          >
            {filterChipCategory.name}
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {!isLoading && transactions.length > 0 && (
        <div className="flex items-center justify-between px-5 text-sm">
          <span className="text-muted-foreground">
            {transactions.length} transaction{transactions.length === 1 ? '' : 's'}
          </span>
          <span className="flex items-center gap-3 font-semibold tabular-nums">
            {expenseTotal > 0 && (
              <span className="text-foreground">-{formatCurrency(expenseTotal, settings?.currency)}</span>
            )}
            {incomeTotal > 0 && <span className="text-success">+{formatCurrency(incomeTotal, settings?.currency)}</span>}
          </span>
        </div>
      )}

      <div className="px-5">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          hasAnyFilter ? (
            <EmptyState
              icon={Search}
              title="No matching transactions"
              description="Try adjusting your search or filters."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('')
                    setFilters({ sort: 'newest' })
                  }}
                >
                  <X className="h-4 w-4" /> Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              description="Start tracking your spending by adding your first transaction."
              action={<Button onClick={() => openAddTransaction()}>Add Transaction</Button>}
            />
          )
        ) : (
          <TransactionList transactions={transactions} onSelect={setEditing} />
        )}
      </div>

      <TransactionFilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} onChange={setFilters} />
      <TransactionFormSheet open={editing !== null} onClose={() => setEditing(null)} transaction={editing ?? undefined} />
    </div>
  )
}
