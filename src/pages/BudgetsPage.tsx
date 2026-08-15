import { useState } from 'react'
import { Plus, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { MonthSwitcher } from '@/components/common/MonthSwitcher'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { CategoryPicker } from '@/components/categories/CategoryPicker'
import { BudgetFormSheet } from '@/components/budgets/BudgetFormSheet'
import { BudgetProgressCard } from '@/components/budgets/BudgetProgressCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useBudgetsForMonth } from '@/hooks/useBudgets'
import { useCategoryBreakdown, useMonthSummary } from '@/hooks/useAnalytics'
import { useCategoryMap } from '@/hooks/useCategories'
import { useSettings } from '@/hooks/useSettings'
import { calculateBudgetProgress } from '@/utils/calculations'
import { formatCurrency } from '@/utils/money'
import { monthKeyToLabel, shiftMonthKey, toMonthKey } from '@/utils/date'

export default function BudgetsPage() {
  const [month, setMonth] = useState(toMonthKey())
  const { settings } = useSettings()
  const { overall, byCategory, isLoading } = useBudgetsForMonth(month)
  const { expense } = useMonthSummary(month)
  const { totals } = useCategoryBreakdown(month, 'expense')
  const { categoryMap } = useCategoryMap()

  const [overallFormOpen, setOverallFormOpen] = useState(false)
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  const budgetedCategoryIds = byCategory
    .map((b) => b.categoryId)
    .filter((id): id is string => id !== null)

  return (
    <div className="flex flex-col gap-5 pb-6 pt-6 safe-top">
      <PageHeader
        title="Budgets"
        action={
          <MonthSwitcher
            onPrevious={() => setMonth((m) => shiftMonthKey(m, -1))}
            onNext={() => setMonth((m) => shiftMonthKey(m, 1))}
          />
        }
        subtitle={monthKeyToLabel(month)}
      />

      <div className="px-5">
        {isLoading ? null : overall ? (
          <button type="button" onClick={() => setOverallFormOpen(true)} className="block w-full text-left">
            <BudgetProgressCard label="Overall Budget" spentMinor={expense} budgetMinor={overall.amountMinor} />
          </button>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold">No overall budget yet</p>
                <p className="text-xs text-muted-foreground">Set a monthly spending limit.</p>
              </div>
              <Button size="sm" onClick={() => setOverallFormOpen(true)}>
                Set Budget
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="px-5">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-base font-semibold">Category Budgets</h2>
          <Button size="sm" variant="outline" onClick={() => setCategoryPickerOpen(true)}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        {byCategory.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No category budgets"
            description="Set spending limits for individual categories to stay on track."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {byCategory.map((budget) => {
              const category = categoryMap.get(budget.categoryId!)
              if (!category) return null
              const spent = totals[budget.categoryId!] ?? 0
              const { percentage, isOverBudget } = calculateBudgetProgress(spent, budget.amountMinor)
              return (
                <button
                  key={budget.id}
                  type="button"
                  onClick={() => setActiveCategoryId(budget.categoryId)}
                  className="rounded-2xl border border-border p-4 text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CategoryIcon icon={category.icon} color={category.color} size="sm" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    {isOverBudget && (
                      <span className="text-xs font-medium text-destructive">⚠️ Over budget</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatCurrency(spent, settings?.currency)} of {formatCurrency(budget.amountMinor, settings?.currency)} spent
                  </p>
                  <ProgressBar percentage={percentage} isOverBudget={isOverBudget} className="mt-2" />
                </button>
              )
            })}
          </div>
        )}
      </div>

      <BudgetFormSheet
        open={overallFormOpen}
        onClose={() => setOverallFormOpen(false)}
        month={month}
        categoryId={null}
        budgetId={overall?.id}
        existingAmountMinor={overall?.amountMinor}
      />

      <CategoryPicker
        open={categoryPickerOpen}
        onClose={() => setCategoryPickerOpen(false)}
        type="expense"
        excludeIds={budgetedCategoryIds}
        onSelect={setActiveCategoryId}
      />

      <BudgetFormSheet
        open={activeCategoryId !== null}
        onClose={() => setActiveCategoryId(null)}
        month={month}
        categoryId={activeCategoryId}
        budgetId={byCategory.find((b) => b.categoryId === activeCategoryId)?.id}
        existingAmountMinor={byCategory.find((b) => b.categoryId === activeCategoryId)?.amountMinor}
      />
    </div>
  )
}
