import { Link } from 'react-router-dom'
import { Shapes } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useGoals } from '@/hooks/useGoals'
import { useRecurringRules } from '@/hooks/useRecurring'
import { Skeleton } from '@/components/ui/Skeleton'
import { GLASS } from '@/lib/glass'
import { cn } from '@/lib/cn'
import goalsIcon from '@/assets/icons/goals.png'
import transactionsIcon from '@/assets/icons/transaction-logo.png'
import activeRecurringIcon from '@/assets/icons/active-recurring-icon.png'

interface StatTileProps {
  to: string
  icon?: LucideIcon
  image?: string
  value: number
  label: string
  gradient: string
}

function StatTile({ to, icon: Icon, image, value, label, gradient }: StatTileProps) {
  return (
    <Link
      to={to}
      className={`${GLASS} flex flex-col gap-2 rounded-2xl p-4 transition-colors active:bg-secondary hover:bg-secondary/60`}
    >
      <div className="flex items-center gap-3">
        {image ? (
          <img src={image} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover shadow-sm" />
        ) : (
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm',
              gradient,
            )}
          >
            {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
          </div>
        )}
        <p className="text-3xl font-bold tabular-nums">{value}</p>
      </div>
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
      <StatTile
        to="/transactions"
        image={transactionsIcon}
        value={transactions.length}
        label="Transactions"
        gradient="from-blue-500 to-violet-600"
      />
      <StatTile
        to="/settings/categories"
        icon={Shapes}
        value={categories.length}
        label="Categories"
        gradient="from-pink-500 to-fuchsia-600"
      />
      <StatTile to="/goals" image={goalsIcon} value={goals.length} label="Goals" gradient="from-cyan-500 to-blue-600" />
      <StatTile
        to="/settings/recurring"
        image={activeRecurringIcon}
        value={activeRecurring}
        label="Active Recurring"
        gradient="from-emerald-500 to-teal-600"
      />
    </div>
  )
}
