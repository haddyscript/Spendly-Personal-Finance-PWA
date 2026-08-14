import type { Category, Transaction } from '@/types/models'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { formatCurrency } from '@/utils/money'
import { useSettings } from '@/hooks/useSettings'
import { cn } from '@/lib/cn'

export interface TransactionItemProps {
  transaction: Transaction
  category?: Category
  onClick?: () => void
}

export function TransactionItem({ transaction, category, onClick }: TransactionItemProps) {
  const { settings } = useSettings()
  const isExpense = transaction.type === 'expense'

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-secondary/60 active:bg-secondary"
    >
      <CategoryIcon icon={category?.icon ?? 'MoreHorizontal'} color={category?.color ?? '#78716c'} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-foreground">{transaction.description}</p>
        <p className="truncate text-xs text-muted-foreground">{category?.name ?? 'Uncategorized'}</p>
      </div>
      <span
        className={cn(
          'shrink-0 text-[15px] font-semibold tabular-nums',
          isExpense ? 'text-foreground' : 'text-success',
        )}
      >
        {isExpense ? '-' : '+'}
        {formatCurrency(transaction.amountMinor, settings?.currency)}
      </span>
    </button>
  )
}
