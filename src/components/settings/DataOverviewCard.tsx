import { Link } from 'react-router-dom'
import { Receipt, Repeat, Shapes, Target } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useGoals } from '@/hooks/useGoals'
import { useRecurringRules } from '@/hooks/useRecurring'
import { Skeleton } from '@/components/ui/Skeleton'

interface StatTileProps {
  to: string
  icon: LucideIcon
  value: number
  label: string
}

function StatTile({ to, icon: Icon, value, label }: StatTileProps) {
  return (
    <Link
      to={to}
      className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-colors active:bg-secondary hover:bg-secondary/60"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Link>
  )
}

export function DataOverviewCard() {
  const { transactions, isLoading: transactionsLoading } = useTransactions()
  const { categories, isLoading: categoriesLoading } = useCategories()
  const { goals, isLoading: goalsLoading } = useGoals()
  const { rules, isLoading: rulesLoading } = useRecurringRules()

  const isLoading = transactionsLoading || categoriesLoading || goalsLoading || rulesLoading
  const activeRecurring = rules.filter((r) => r.active).length

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatTile to="/transactions" icon={Receipt} value={transactions.length} label="Transactions" />
      <StatTile to="/settings/categories" icon={Shapes} value={categories.length} label="Categories" />
      <StatTile to="/goals" icon={Target} value={goals.length} label="Goals" />
      <StatTile to="/settings/recurring" icon={Repeat} value={activeRecurring} label="Active Recurring" />
    </div>
  )
}
