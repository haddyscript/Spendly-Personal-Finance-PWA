import { Sheet } from '@/components/ui/Sheet'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { useCategoryMap } from '@/hooks/useCategories'
import { useSettings } from '@/hooks/useSettings'
import { formatCurrency } from '@/utils/money'
import { formatShortDate } from '@/utils/date'
import type { MoneyLeak } from '@/utils/calculations'

export interface MoneyLeaksSheetProps {
  open: boolean
  onClose: () => void
  leaks: MoneyLeak[]
}

export function MoneyLeaksSheet({ open, onClose, leaks }: MoneyLeaksSheetProps) {
  const { categoryMap } = useCategoryMap()
  const { settings } = useSettings()
  const totalMinor = leaks.reduce((sum, l) => sum + l.totalMinor, 0)

  return (
    <Sheet open={open} onClose={onClose} title="Money Leaks">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Small purchases you make often — the last 90 days, adding up to{' '}
          <span className="font-semibold text-foreground">{formatCurrency(totalMinor, settings?.currency)}</span>.
        </p>

        <div className="flex flex-col gap-2">
          {leaks.map((leak) => {
            const category = categoryMap.get(leak.categoryId)
            return (
              <div key={leak.key} className="flex items-center gap-3 rounded-2xl border border-border p-3">
                <CategoryIcon icon={category?.icon ?? 'MoreHorizontal'} color={category?.color ?? '#78716c'} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium">{leak.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {leak.count}× · avg {formatCurrency(leak.avgMinor, settings?.currency)} · last {formatShortDate(leak.lastDate)}
                  </p>
                </div>
                <span className="shrink-0 text-[15px] font-semibold tabular-nums">
                  {formatCurrency(leak.totalMinor, settings?.currency)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Sheet>
  )
}
