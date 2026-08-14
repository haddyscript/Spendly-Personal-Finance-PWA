import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/money'
import { monthKeyToLabel } from '@/utils/date'
import { useSettings } from '@/hooks/useSettings'
import type { SpendingTrend } from '@/utils/calculations'

export interface AnalyticsHeroCardProps {
  month: string
  expenseMinor: number
  trend: SpendingTrend
}

export function AnalyticsHeroCard({ month, expenseMinor, trend }: AnalyticsHeroCardProps) {
  const { settings } = useSettings()
  const Icon = trend.direction === 'down' ? ArrowDown : trend.direction === 'up' ? ArrowUp : ArrowRight
  const tone =
    trend.direction === 'down'
      ? 'bg-success/15 text-success'
      : trend.direction === 'up'
        ? 'bg-destructive/15 text-destructive'
        : 'bg-secondary text-muted-foreground'

  return (
    <Card className="border-none bg-primary text-primary-foreground shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm text-primary-foreground/70">Total Spent · {monthKeyToLabel(month)}</p>
        <p className="mt-1 text-4xl font-bold tabular-nums">{formatCurrency(expenseMinor, settings?.currency)}</p>

        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${tone}`}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {trend.direction === 'stable' ? 'About the same' : `${trend.percentage.toFixed(1)}% ${trend.direction === 'down' ? 'less' : 'more'}`}
          </span>
          <span className="text-primary-foreground/60">vs last month</span>
        </div>
      </CardContent>
    </Card>
  )
}
