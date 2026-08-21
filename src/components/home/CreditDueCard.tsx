import { Check, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { useSettings } from '@/hooks/useSettings'
import { formatCurrency } from '@/utils/money'
import creditToPayIcon from '@/assets/icons/credit-to-pay-icon.png'

export interface CreditDueCardProps {
  totalMinor: number
  count: number
  onClick: () => void
}

export function CreditDueCard({ totalMinor, count, onClick }: CreditDueCardProps) {
  const { settings } = useSettings()
  const allPaid = totalMinor <= 0

  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {allPaid ? (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/15 text-success">
                <Check className="h-5 w-5" aria-hidden="true" />
              </div>
            ) : (
              <img src={creditToPayIcon} alt="" className="h-11 w-11 rounded-full object-cover" />
            )}
            <div>
              <p className="text-sm font-semibold">{allPaid ? 'Credit: all paid up' : 'Credit to pay'}</p>
              <p className="text-xs text-muted-foreground">
                {allPaid ? 'Tap to review recent payments' : `${count} purchase${count === 1 ? '' : 's'} · Atome & Credit Card`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!allPaid && <span className="text-base font-bold tabular-nums">{formatCurrency(totalMinor, settings?.currency)}</span>}
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>
    </button>
  )
}
