import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatCurrency } from '@/utils/money'
import { calculateBudgetProgress } from '@/utils/calculations'
import { useSettings } from '@/hooks/useSettings'

export interface BudgetProgressCardProps {
  label: string
  spentMinor: number
  budgetMinor: number
}

export function BudgetProgressCard({ label, spentMinor, budgetMinor }: BudgetProgressCardProps) {
  const { settings } = useSettings()
  const { percentage, isOverBudget } = calculateBudgetProgress(spentMinor, budgetMinor)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline justify-between">
          <p className="text-xl font-bold tabular-nums">
            {formatCurrency(spentMinor, settings?.currency)}
            <span className="text-sm font-normal text-muted-foreground"> / {formatCurrency(budgetMinor, settings?.currency)}</span>
          </p>
        </div>
        <ProgressBar percentage={percentage} isOverBudget={isOverBudget} className="mt-3" />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={isOverBudget ? 'font-medium text-destructive' : 'text-muted-foreground'}>
            {percentage.toFixed(1)}%
          </span>
          {isOverBudget && (
            <span className="flex items-center gap-1 font-medium text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> Over budget
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
