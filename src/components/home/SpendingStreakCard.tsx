import { Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export interface SpendingStreakCardProps {
  current: number
  loggedToday: boolean
}

export function SpendingStreakCard({ current, loggedToday }: SpendingStreakCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
          <Flame className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold">{current}-day streak</p>
          <p className="text-xs text-muted-foreground">
            {loggedToday ? "You've logged today. Nice." : 'Log an expense today to keep it going.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
