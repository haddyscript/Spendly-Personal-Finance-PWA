import { useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { useCategoriesByType } from '@/hooks/useCategories'
import { deleteCategory } from '@/services/categoryService'
import { useToast } from '@/hooks/useToast'
import type { Category } from '@/types/models'

export interface DeleteCategorySheetProps {
  open: boolean
  onClose: () => void
  category: Category | null
  usageCount: number
}

export function DeleteCategorySheet({ open, onClose, category, usageCount }: DeleteCategorySheetProps) {
  const { categories } = useCategoriesByType(category?.type ?? 'expense')
  const otherCategories = categories.filter((c) => c.id !== category?.id)
  const [reassignToId, setReassignToId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const { success, error } = useToast()

  async function handleConfirm() {
    if (!category || !reassignToId) return
    setSubmitting(true)
    try {
      await deleteCategory(category.id, reassignToId)
      success('Category deleted', `${usageCount} transaction(s) moved.`)
      onClose()
    } catch {
      error('Could not delete category')
    } finally {
      setSubmitting(false)
    }
  }

  if (!category) return null

  return (
    <Sheet open={open} onClose={onClose} title="Category in use">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{category.name}</span> is used by {usageCount} transaction
        {usageCount === 1 ? '' : 's'}. Choose a category to move {usageCount === 1 ? 'it' : 'them'} to before deleting.
      </p>

      {otherCategories.length === 0 ? (
        <p className="mt-4 rounded-xl bg-secondary p-3 text-sm text-muted-foreground">
          Create another {category.type} category first — there's nowhere to reassign these transactions.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-1.5">
          {otherCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setReassignToId(c.id)}
              className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${
                reassignToId === c.id ? 'border-primary bg-accent' : 'border-transparent hover:bg-secondary'
              }`}
            >
              <CategoryIcon icon={c.icon} color={c.color} size="sm" />
              <span className="text-sm font-medium">{c.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          disabled={!reassignToId || submitting}
          onClick={handleConfirm}
        >
          Move &amp; Delete
        </Button>
      </div>
    </Sheet>
  )
}
