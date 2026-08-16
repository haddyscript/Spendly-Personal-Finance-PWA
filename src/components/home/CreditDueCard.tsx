import { ChevronRight, CreditCard } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { useSettings } from '@/hooks/useSettings'
import { formatCurrency } from '@/utils/money'

export interface CreditDueCardProps {
  totalMinor: number
  count: number
  onClick: () => void
}

export function CreditDueCard({ totalMinor, count, onClick }: CreditDueCardProps) {
  const { settings } = useSettings()

  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/15 text-warning">
              <CreditCard className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold">Credit to pay</p>
              <p className="text-xs text-muted-foreground">
                {count} purchase{count === 1 ? '' : 's'} · Atome & Credit Card
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-base font-bold tabular-nums">{formatCurrency(totalMinor, settings?.currency)}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>
    </button>
  )
}
