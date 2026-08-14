import { createElement, useState } from 'react'
import type { FormEvent } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { ICON_NAMES, getIcon } from '@/lib/icons'
import { CATEGORY_COLORS } from '@/lib/colors'
import { addCategory, updateCategory } from '@/services/categoryService'
import { useToast } from '@/hooks/useToast'
import type { Category, TransactionType } from '@/types/models'

export interface CategoryFormSheetProps {
  open: boolean
  onClose: () => void
  category?: Category
  defaultType?: TransactionType
}

export function CategoryFormSheet({ open, onClose, category, defaultType = 'expense' }: CategoryFormSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={category ? 'Edit Category' : 'New Category'}>
      {open && (
        <CategoryForm key={category?.id ?? 'new'} category={category} defaultType={defaultType} onClose={onClose} />
      )}
    </Sheet>
  )
}

interface CategoryFormProps {
  category?: Category
  defaultType: TransactionType
  onClose: () => void
}

function CategoryForm({ category, defaultType, onClose }: CategoryFormProps) {
  const { success, error } = useToast()
  const [name, setName] = useState(category?.name ?? '')
  const [type, setType] = useState<TransactionType>(category?.type ?? defaultType)
  const [icon, setIcon] = useState(category?.icon ?? ICON_NAMES[0])
  const [color, setColor] = useState(category?.color ?? CATEGORY_COLORS[0])
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      error('Enter a category name')
      return
    }

    setSubmitting(true)
    try {
      if (category) {
        await updateCategory(category.id, { name: trimmed, icon, color })
        success('Category updated')
      } else {
        await addCategory({ name: trimmed, type, icon, color })
        success('Category created')
      }
      onClose()
    } catch {
      error('Something went wrong', 'Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex justify-center">
        <CategoryIcon icon={icon} color={color} size="lg" />
      </div>

      {!category && (
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`h-11 rounded-lg text-sm font-semibold capitalize transition-colors ${
                type === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div>
        <Label htmlFor="category-name">Name</Label>
        <Input id="category-name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Groceries" />
      </div>

      <div>
        <Label>Icon</Label>
        <div className="mt-1.5 grid grid-cols-6 gap-2">
          {ICON_NAMES.map((iconName) => (
            <button
              key={iconName}
              type="button"
              onClick={() => setIcon(iconName)}
              aria-label={iconName}
              className={`flex h-11 items-center justify-center rounded-xl border transition-colors ${
                icon === iconName ? 'border-primary bg-accent' : 'border-border hover:bg-secondary'
              }`}
            >
              {createElement(getIcon(iconName), { className: 'h-5 w-5' })}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Color</Label>
        <div className="mt-1.5 grid grid-cols-8 gap-2">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={c}
              style={{ backgroundColor: c }}
              className={`h-8 w-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-offset-card ring-foreground scale-95' : ''}`}
            />
          ))}
        </div>
      </div>

      <Button type="submit" size="lg" disabled={submitting}>
        {category ? 'Save Changes' : 'Create Category'}
      </Button>
    </form>
  )
}
