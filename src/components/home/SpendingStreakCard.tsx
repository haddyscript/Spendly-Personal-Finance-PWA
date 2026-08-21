import { Card, CardContent } from '@/components/ui/Card'
import dayStreakIcon from '@/assets/icons/day-streak-icon.png'

export interface SpendingStreakCardProps {
  current: number
  loggedToday: boolean
}

export function SpendingStreakCard({ current, loggedToday }: SpendingStreakCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <img src={dayStreakIcon} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
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
