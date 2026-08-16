import { Link } from 'react-router-dom'
import { ChevronRight, Plus, Receipt, Target } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { TransactionList } from '@/components/transactions/TransactionList'
import { BudgetProgressCard } from '@/components/budgets/BudgetProgressCard'
import { TransactionFormSheet } from '@/components/transactions/TransactionFormSheet'
import { CreditDueCard } from '@/components/home/CreditDueCard'
import { CreditDueSheet } from '@/components/home/CreditDueSheet'
import { useBalance, useMonthSummary } from '@/hooks/useAnalytics'
import { useBudgetsForMonth } from '@/hooks/useBudgets'
import { useOutstandingCredit, useRecentTransactions } from '@/hooks/useTransactions'
import { useGoals } from '@/hooks/useGoals'
import { useSettings } from '@/hooks/useSettings'
import { formatCurrency } from '@/utils/money'
import { monthKeyToLabel, toMonthKey } from '@/utils/date'
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { Transaction } from '@/types/models'
import type { AppShellContext } from '@/components/layout/AppShell'

export default function HomePage() {
  const { settings } = useSettings()
  const { balance, isLoading: balanceLoading } = useBalance()
  const { income, expense, remaining, isLoading: summaryLoading } = useMonthSummary()
  const { overall, isLoading: budgetLoading } = useBudgetsForMonth()
  const { transactions: recent, isLoading: recentLoading } = useRecentTransactions(5)
  const { goals } = useGoals()
  const { totalMinor: creditDueMinor, transactions: creditDue } = useOutstandingCredit()
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [creditSheetOpen, setCreditSheetOpen] = useState(false)
  const { openAddTransaction } = useOutletContext<AppShellContext>()

  const isLoading = balanceLoading || summaryLoading

  return (
    <div className="flex flex-col gap-6 px-5 pb-6 pt-6 safe-top">
      <div className="flex items-center gap-3">
        <Logo />
        <div>
          <p className="text-sm text-muted-foreground">{monthKeyToLabel(toMonthKey())}</p>
          <h1 className="text-lg font-bold">Spendly</h1>
        </div>
      </div>

      <InstallPrompt />

      <Card className="border-none bg-primary text-primary-foreground shadow-sm">
        <CardContent className="p-5">
          <p className="text-sm text-primary-foreground/70">Current Balance</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-9 w-40 bg-primary-foreground/15" />
          ) : (
            <p className="mt-1 text-4xl font-bold tabular-nums">{formatCurrency(balance, settings?.currency)}</p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-primary-foreground/15 pt-4">
            <div>
              <p className="text-xs text-primary-foreground/70">Income</p>
              <p className="mt-0.5 font-semibold tabular-nums">{formatCurrency(income, settings?.currency)}</p>
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70">Expenses</p>
              <p className="mt-0.5 font-semibold tabular-nums">{formatCurrency(expense, settings?.currency)}</p>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-primary-foreground/10 px-3 py-2">
            <p className="text-xs text-primary-foreground/70">Remaining this month</p>
            <p className="font-semibold tabular-nums">{formatCurrency(remaining, settings?.currency)}</p>
          </div>
        </CardContent>
      </Card>

      {creditDueMinor > 0 && (
        <CreditDueCard totalMinor={creditDueMinor} count={creditDue.length} onClick={() => setCreditSheetOpen(true)} />
      )}

      {!budgetLoading && overall && (
        <BudgetProgressCard label="Monthly Budget" spentMinor={expense} budgetMinor={overall.amountMinor} />
      )}

      {goals.length > 0 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Target className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold">{goals.length} active goal{goals.length > 1 ? 's' : ''}</p>
                <p className="text-xs text-muted-foreground">Track your progress</p>
              </div>
            </div>
            <Link to="/goals" className="flex items-center gap-1 text-sm font-medium text-primary">
              View <ChevronRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-base font-semibold">Recent Transactions</h2>
          <Link to="/transactions" className="flex items-center gap-0.5 text-sm font-medium text-primary">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {recentLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description="Start tracking your spending by adding your first transaction."
            action={
              <Button onClick={openAddTransaction}>
                <Plus className="h-4 w-4" /> Add Transaction
              </Button>
            }
          />
        ) : (
          <TransactionList transactions={recent} grouped={false} onSelect={setEditing} />
        )}
      </div>

      <TransactionFormSheet open={editing !== null} onClose={() => setEditing(null)} transaction={editing ?? undefined} />
      <CreditDueSheet open={creditSheetOpen} onClose={() => setCreditSheetOpen(false)} />
    </div>
  )
}
