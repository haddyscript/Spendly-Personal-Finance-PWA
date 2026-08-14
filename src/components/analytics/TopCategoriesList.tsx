import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
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
          <Link
            key={item.categoryId}
            to={`/transactions?category=${item.categoryId}`}
            className="flex items-center gap-3 rounded-xl p-1.5 transition-colors active:bg-secondary hover:bg-secondary/60"
          >
            <CategoryIcon icon={category.icon} color={category.color} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{category.name}</span>
                <span className="tabular-nums text-muted-foreground">{formatCurrency(item.totalMinor, settings?.currency)}</span>
              </div>
              <ProgressBar percentage={calculatePercentage(item.totalMinor, max)} className="mt-1.5 h-1.5" />
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>
        )
      })}
    </div>
  )
}
