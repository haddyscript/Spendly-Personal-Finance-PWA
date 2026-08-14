import { Sheet } from '@/components/ui/Sheet'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { useCategoriesByType } from '@/hooks/useCategories'
import type { TransactionType } from '@/types/models'

export interface CategoryPickerProps {
  open: boolean
  onClose: () => void
  type: TransactionType
  selectedId?: string
  excludeIds?: string[]
  onSelect: (categoryId: string) => void
}

export function CategoryPicker({ open, onClose, type, selectedId, excludeIds, onSelect }: CategoryPickerProps) {
  const { categories: allCategories } = useCategoriesByType(type)
  const categories = excludeIds ? allCategories.filter((c) => !excludeIds.includes(c.id)) : allCategories

  return (
    <Sheet open={open} onClose={onClose} title="Choose category">
      <div className="grid grid-cols-4 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => {
              onSelect(category.id)
              onClose()
            }}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-colors ${
              selectedId === category.id ? 'border-primary bg-accent' : 'border-transparent hover:bg-secondary'
            }`}
          >
            <CategoryIcon icon={category.icon} color={category.color} />
            <span className="line-clamp-1 text-xs font-medium">{category.name}</span>
          </button>
        ))}
      </div>
    </Sheet>
  )
}
