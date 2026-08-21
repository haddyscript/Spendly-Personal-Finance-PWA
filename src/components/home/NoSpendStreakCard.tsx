import { Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export interface NoSpendStreakCardProps {
  current: number
  spentToday: boolean
}

export function NoSpendStreakCard({ current, spentToday }: NoSpendStreakCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
          <Flame className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold">{current}-day no-spend streak</p>
          <p className="text-xs text-muted-foreground">
            {spentToday ? 'Logged an expense today — a new streak starts tomorrow.' : 'Go the rest of today expense-free to extend it.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
