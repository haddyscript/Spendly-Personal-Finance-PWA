import { createElement } from 'react'
import { CheckCircle2, PlusCircle, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { getIcon } from '@/lib/icons'
import { useSettings } from '@/hooks/useSettings'
import { formatCurrency } from '@/utils/money'
import { calculatePercentage } from '@/utils/calculations'
import { formatShortDate } from '@/utils/date'
import type { Goal } from '@/types/models'

export interface GoalCardProps {
  goal: Goal
  onEdit: () => void
  onContribute: () => void
  onDelete: () => void
}

export function GoalCard({ goal, onEdit, onContribute, onDelete }: GoalCardProps) {
  const { settings } = useSettings()
  const percentage = calculatePercentage(goal.currentAmountMinor, goal.targetAmountMinor)
  const isComplete = goal.completedAt !== null

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${goal.color}22`, color: goal.color }}
            aria-label={`Edit ${goal.name}`}
          >
            {createElement(getIcon(goal.icon), { className: 'h-6 w-6' })}
          </button>
          <div className="min-w-0 flex-1">
            <button type="button" onClick={onEdit} className="text-left">
              <p className="font-semibold">{goal.name}</p>
              {goal.targetDate && (
                <p className="text-xs text-muted-foreground">Target: {formatShortDate(goal.targetDate)}</p>
              )}
            </button>

            <p className="mt-2 text-sm tabular-nums">
              <span className="font-semibold">{formatCurrency(goal.currentAmountMinor, settings?.currency)}</span>
              <span className="text-muted-foreground"> / {formatCurrency(goal.targetAmountMinor, settings?.currency)}</span>
            </p>
            <ProgressBar percentage={percentage} className="mt-2" />
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{percentage.toFixed(0)}%</span>
              {isComplete && (
                <span className="flex items-center gap-1 text-xs font-medium text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Goal reached
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={onContribute}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium text-primary hover:bg-secondary"
          >
            <PlusCircle className="h-4 w-4" /> Add funds
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${goal.name}`}
            className="flex items-center justify-center rounded-lg px-3 text-muted-foreground hover:bg-secondary"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
