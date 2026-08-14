import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import type { SpendingTrend } from '@/utils/calculations'

export function SpendingTrendCard({ trend }: { trend: SpendingTrend }) {
  const Icon = trend.direction === 'down' ? ArrowDown : trend.direction === 'up' ? ArrowUp : ArrowRight
  const tone =
    trend.direction === 'down' ? 'text-success' : trend.direction === 'up' ? 'text-destructive' : 'text-muted-foreground'

  const message =
    trend.direction === 'stable'
      ? "You're spending about the same as last month."
      : `You're spending ${trend.percentage.toFixed(1)}% ${trend.direction === 'down' ? 'less' : 'more'} than last month.`

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary ${tone}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}
