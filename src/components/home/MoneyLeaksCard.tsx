import { Card, CardContent } from '@/components/ui/Card'
import { useSettings } from '@/hooks/useSettings'
import { formatCurrency } from '@/utils/money'
import type { MoneyLeak } from '@/utils/calculations'
import moneyLeaksIcon from '@/assets/icons/money-leaks-icon.png'

export interface MoneyLeaksCardProps {
  leaks: MoneyLeak[]
  onClick: () => void
}

export function MoneyLeaksCard({ leaks, onClick }: MoneyLeaksCardProps) {
  const { settings } = useSettings()
  const totalMinor = leaks.reduce((sum, l) => sum + l.totalMinor, 0)
  const [top] = leaks

  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <img src={moneyLeaksIcon} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{formatCurrency(totalMinor, settings?.currency)} in money leaks</p>
            <p className="truncate text-xs text-muted-foreground">
              {leaks.length > 1
                ? `${top.description} and ${leaks.length - 1} other repeat buy${leaks.length - 1 > 1 ? 's' : ''}`
                : `${top.description} × ${top.count} times in the last 90 days`}
            </p>
          </div>
        </CardContent>
      </Card>
    </button>
  )
}
