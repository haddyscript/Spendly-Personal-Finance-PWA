import type { Transaction } from '@/types/models'
import { TransactionItem } from '@/components/transactions/TransactionItem'
import { useCategoryMap } from '@/hooks/useCategories'
import { dateGroupLabel } from '@/utils/date'

export interface TransactionListProps {
  transactions: Transaction[]
  grouped?: boolean
  onSelect?: (transaction: Transaction) => void
}

export function TransactionList({ transactions, grouped = true, onSelect }: TransactionListProps) {
  const { categoryMap } = useCategoryMap()

  if (!grouped) {
    return (
      <div className="flex flex-col gap-0.5">
        {transactions.map((t) => (
          <TransactionItem
            key={t.id}
            transaction={t}
            category={categoryMap.get(t.categoryId)}
            onClick={() => onSelect?.(t)}
          />
        ))}
      </div>
    )
  }

  const groups: { label: string; items: Transaction[] }[] = []
  for (const t of transactions) {
    const label = dateGroupLabel(t.date)
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && lastGroup.label === label) {
      lastGroup.items.push(t)
    } else {
      groups.push({ label, items: [t] })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </h3>
          <div className="flex flex-col gap-0.5">
            {group.items.map((t) => (
              <TransactionItem
                key={t.id}
                transaction={t}
                category={categoryMap.get(t.categoryId)}
                onClick={() => onSelect?.(t)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
