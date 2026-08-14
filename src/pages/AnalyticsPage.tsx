import { useState } from 'react'
import { PieChart } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { MonthSwitcher } from '@/components/common/MonthSwitcher'
import { AnalyticsHeroCard } from '@/components/analytics/AnalyticsHeroCard'
import { CategoryDonutChart } from '@/components/analytics/CategoryDonutChart'
import { MonthlyBarChart } from '@/components/analytics/MonthlyBarChart'
import { TopCategoriesList } from '@/components/analytics/TopCategoriesList'
import { useCategoryBreakdown, useMonthlySeries, useMonthSummary, useSpendingTrend, useTopCategories } from '@/hooks/useAnalytics'
import { useCategoryMap } from '@/hooks/useCategories'
import { shiftMonthKey, toMonthKey } from '@/utils/date'
import type { TransactionType } from '@/types/models'

export default function AnalyticsPage() {
  const [month, setMonth] = useState(toMonthKey())
  const [type, setType] = useState<TransactionType>('expense')

  const { expense } = useMonthSummary(month)
  const { totals, total, isLoading: breakdownLoading } = useCategoryBreakdown(month, type)
  const { series, isLoading: seriesLoading } = useMonthlySeries(6, month)
  const { trend } = useSpendingTrend(month)
  const { topCategories } = useTopCategories(month, type, 5)
  const { categoryMap } = useCategoryMap()

  const slices = Object.entries(totals)
    .map(([categoryId, totalMinor]) => {
      const category = categoryMap.get(categoryId)
      return category ? { categoryId, name: category.name, color: category.color, totalMinor } : null
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .sort((a, b) => b.totalMinor - a.totalMinor)

  const isCurrentMonth = month === toMonthKey()

  return (
    <div className="flex flex-col gap-5 pb-6 pt-6 safe-top">
      <PageHeader
        title="Analytics"
        subtitle="Understand your spending patterns"
        action={
          <MonthSwitcher
            onPrevious={() => setMonth((m) => shiftMonthKey(m, -1))}
            onNext={() => setMonth((m) => shiftMonthKey(m, 1))}
            nextDisabled={isCurrentMonth}
          />
        }
      />

      <div className="px-5">
        <AnalyticsHeroCard month={month} expenseMinor={expense} trend={trend} />
      </div>

      <div className="px-5">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Spending by Category</CardTitle>
            <div className="flex gap-1 rounded-lg bg-secondary p-1">
              {(['expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-colors ${
                    type === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {breakdownLoading ? (
              <Skeleton className="mx-auto h-56 w-56 rounded-full" />
            ) : slices.length === 0 ? (
              <EmptyState icon={PieChart} title="No data yet" description="Add transactions to see your breakdown." />
            ) : (
              <CategoryDonutChart data={slices} totalMinor={total} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="px-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            {seriesLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <MonthlyBarChart data={series} selectedMonth={month} onMonthClick={setMonth} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="px-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top {type === 'expense' ? 'Spending' : 'Income'} Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <TopCategoriesList items={topCategories} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
