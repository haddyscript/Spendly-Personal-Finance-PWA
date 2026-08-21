import { Link } from 'react-router-dom'
import { ChevronRight, Plus, Receipt, Volume2 } from 'lucide-react'
import goalsIcon from '@/assets/icons/goals.png'
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
import { SpendingStreakCard } from '@/components/home/SpendingStreakCard'
import { NoSpendStreakCard } from '@/components/home/NoSpendStreakCard'
import { MoneyLeaksCard } from '@/components/home/MoneyLeaksCard'
import { MoneyLeaksSheet } from '@/components/home/MoneyLeaksSheet'
import { useBalance, useMonthSummary, useMoneyLeaks } from '@/hooks/useAnalytics'
import { useBudgetsForMonth } from '@/hooks/useBudgets'
import {
  useOutstandingCredit,
  useRecentlySettledCredit,
  useRecentTransactions,
  useSpendingStreak,
  useNoSpendStreak,
} from '@/hooks/useTransactions'
import { useGoals } from '@/hooks/useGoals'
import { useSettings } from '@/hooks/useSettings'
import { formatCurrency } from '@/utils/money'
import { monthKeyToLabel, toMonthKey } from '@/utils/date'
import { speak } from '@/lib/speech'
import { pickPhrasing, speakableAmount } from '@/lib/speechPhrasing'
import { useEffect, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
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
  const { transactions: recentlyPaidCredit } = useRecentlySettledCredit(1)
  const { current: streakDays, loggedToday: streakLoggedToday } = useSpendingStreak()
  const { current: noSpendDays, spentToday } = useNoSpendStreak()
  const { leaks: moneyLeaks } = useMoneyLeaks()
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [creditSheetOpen, setCreditSheetOpen] = useState(false)
  const [leaksSheetOpen, setLeaksSheetOpen] = useState(false)
  const { openAddTransaction } = useOutletContext<AppShellContext>()
  const [searchParams, setSearchParams] = useSearchParams()

  // Landing spot for the "Add Expense"/"Add Income" home-screen app shortcuts.
  useEffect(() => {
    const action = searchParams.get('action')
    if (action !== 'add-expense' && action !== 'add-income') return
    openAddTransaction(action === 'add-expense' ? 'expense' : 'income')
    setSearchParams(
      (params) => {
        params.delete('action')
        return params
      },
      { replace: true },
    )
  }, [])

  const isLoading = balanceLoading || summaryLoading

  function handleSpeakSummary() {
    const currency = settings?.currency ?? 'PHP'
    const bal = speakableAmount(balance, currency)
    const inc = speakableAmount(income, currency)
    const exp = speakableAmount(expense, currency)
    const rem = speakableAmount(remaining, currency)

    const phrasing = pickPhrasing([
      `You've got ${bal} in the bank. You brought in ${inc} this month. You spent ${exp}, leaving ${rem} left over.`,
      `Your balance is ${bal}. This month, you've earned ${inc} and spent ${exp}. That leaves ${rem} remaining.`,
      `Here's where you stand. ${bal} total. This month you earned ${inc} and spent ${exp}. ${rem} left to go.`,
    ])
    speak(phrasing)
  }

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

      <Card className="border-none bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/70">Current Balance</p>
            <button
              type="button"
              onClick={handleSpeakSummary}
              aria-label="Read balance summary aloud"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white active:bg-white/20"
            >
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {isLoading ? (
            <Skeleton className="mt-2 h-9 w-40 bg-white/15" />
          ) : (
            <p className="mt-1 text-4xl font-bold tabular-nums">{formatCurrency(balance, settings?.currency)}</p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/15 pt-4">
            <div>
              <p className="text-xs text-white/70">Income</p>
              <p className="mt-0.5 font-semibold tabular-nums">{formatCurrency(income, settings?.currency)}</p>
            </div>
            <div>
              <p className="text-xs text-white/70">Expenses</p>
              <p className="mt-0.5 font-semibold tabular-nums">{formatCurrency(expense, settings?.currency)}</p>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-white/10 px-3 py-2">
            <p className="text-xs text-white/70">Remaining this month</p>
            <p className="font-semibold tabular-nums">{formatCurrency(remaining, settings?.currency)}</p>
          </div>
        </CardContent>
      </Card>

      {streakDays > 0 && <SpendingStreakCard current={streakDays} loggedToday={streakLoggedToday} />}

      {noSpendDays > 0 && <NoSpendStreakCard current={noSpendDays} spentToday={spentToday} />}

      {moneyLeaks.length > 0 && <MoneyLeaksCard leaks={moneyLeaks} onClick={() => setLeaksSheetOpen(true)} />}

      {(creditDueMinor > 0 || recentlyPaidCredit.length > 0) && (
        <CreditDueCard totalMinor={creditDueMinor} count={creditDue.length} onClick={() => setCreditSheetOpen(true)} />
      )}

      {!budgetLoading && overall && (
        <BudgetProgressCard label="Monthly Budget" spentMinor={expense} budgetMinor={overall.amountMinor} />
      )}

      {goals.length > 0 && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <img src={goalsIcon} alt="" className="h-11 w-11 rounded-full object-cover" />
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
              <Button onClick={() => openAddTransaction()}>
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
      <MoneyLeaksSheet open={leaksSheetOpen} onClose={() => setLeaksSheetOpen(false)} leaks={moneyLeaks} />
    </div>
  )
}
