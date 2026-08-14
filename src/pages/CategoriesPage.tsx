import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { CategoryFormSheet } from '@/components/categories/CategoryFormSheet'
import { DeleteCategorySheet } from '@/components/categories/DeleteCategorySheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useCategoriesByType } from '@/hooks/useCategories'
import { CategoryInUseError, deleteCategory } from '@/services/categoryService'
import { countTransactionsForCategory } from '@/services/transactionService'
import { useToast } from '@/hooks/useToast'
import type { Category, TransactionType } from '@/types/models'

export default function CategoriesPage() {
  const [tab, setTab] = useState<TransactionType>('expense')
  const { categories } = useCategoriesByType(tab)
  const [editing, setEditing] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<Category | null>(null)
  const [reassignTarget, setReassignTarget] = useState<{ category: Category; usageCount: number } | null>(null)
  const { success, error } = useToast()

  async function handleDeleteConfirmed() {
    if (!confirmTarget) return
    try {
      await deleteCategory(confirmTarget.id)
      success('Category deleted')
      setConfirmTarget(null)
    } catch (e) {
      setConfirmTarget(null)
      if (e instanceof CategoryInUseError) {
        setReassignTarget({ category: confirmTarget, usageCount: e.count })
      } else {
        error('Could not delete category')
      }
    }
  }

  async function handleDeleteTap(category: Category) {
    const usageCount = await countTransactionsForCategory(category.id)
    if (usageCount > 0) {
      setReassignTarget({ category, usageCount })
    } else {
      setConfirmTarget(category)
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-6 pt-6 safe-top">
      <PageHeader
        title="Categories"
        action={
          <Link to="/settings" aria-label="Back to settings" className="rounded-full p-2 hover:bg-secondary">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        }
      />

      <div className="px-5">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`h-11 rounded-lg text-sm font-semibold capitalize transition-colors ${
                tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1 px-5">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-secondary/60">
            <CategoryIcon icon={category.icon} color={category.color} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium">{category.name}</p>
              {category.isDefault && <p className="text-xs text-muted-foreground">Default category</p>}
            </div>
            <button
              type="button"
              aria-label={`Edit ${category.name}`}
              onClick={() => setEditing(category)}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={`Delete ${category.name}`}
              onClick={() => handleDeleteTap(category)}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="px-5">
        <Button variant="outline" className="w-full" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New Category
        </Button>
      </div>

      <CategoryFormSheet open={editing !== null} onClose={() => setEditing(null)} category={editing ?? undefined} />
      <CategoryFormSheet open={creating} onClose={() => setCreating(false)} defaultType={tab} />

      <ConfirmDialog
        open={confirmTarget !== null}
        title="Delete category?"
        description="This category isn't used by any transactions."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmTarget(null)}
      />

      <DeleteCategorySheet
        open={reassignTarget !== null}
        onClose={() => setReassignTarget(null)}
        category={reassignTarget?.category ?? null}
        usageCount={reassignTarget?.usageCount ?? 0}
      />
    </div>
  )
}
