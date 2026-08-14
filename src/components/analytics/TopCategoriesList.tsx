import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useCategoryMap } from '@/hooks/useCategories'
import { useSettings } from '@/hooks/useSettings'
import { formatCurrency } from '@/utils/money'
import { calculatePercentage } from '@/utils/calculations'
import type { TopCategory } from '@/utils/calculations'

export function TopCategoriesList({ items }: { items: TopCategory[] }) {
  const { categoryMap } = useCategoryMap()
  const { settings } = useSettings()
  const max = items[0]?.totalMinor ?? 0

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => {
        const category = categoryMap.get(item.categoryId)
        if (!category) return null
        return (
          <div key={item.categoryId} className="flex items-center gap-3">
            <CategoryIcon icon={category.icon} color={category.color} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{category.name}</span>
                <span className="tabular-nums text-muted-foreground">{formatCurrency(item.totalMinor, settings?.currency)}</span>
              </div>
              <ProgressBar percentage={calculatePercentage(item.totalMinor, max)} className="mt-1.5 h-1.5" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
