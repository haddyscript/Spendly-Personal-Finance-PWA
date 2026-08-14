import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Plus, Repeat } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { CategoryIcon } from '@/components/categories/CategoryIcon'
import { RecurringFormSheet } from '@/components/recurring/RecurringFormSheet'
import { useRecurringRules } from '@/hooks/useRecurring'
import { useCategoryMap } from '@/hooks/useCategories'
import { useSettings } from '@/hooks/useSettings'
import { updateRecurring } from '@/services/recurringService'
import { formatCurrency } from '@/utils/money'
import type { RecurringFrequency, RecurringTransaction } from '@/types/models'

const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

export default function RecurringPage() {
  const { rules, isLoading } = useRecurringRules()
  const { categoryMap } = useCategoryMap()
  const { settings } = useSettings()
  const [editing, setEditing] = useState<RecurringTransaction | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <div className="flex flex-col gap-4 pb-6 pt-6 safe-top">
      <PageHeader
        title="Recurring"
        action={
          <Link to="/settings" aria-label="Back to settings" className="rounded-full p-2 hover:bg-secondary">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        }
      />

      <div className="flex flex-col gap-2 px-5">
        {!isLoading && rules.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No recurring transactions"
            description="Automate bills, subscriptions, or income that repeat on a schedule."
            action={
              <Button onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" /> Add Recurring
              </Button>
            }
          />
        ) : (
          <>
            {rules.map((rule) => {
              const category = categoryMap.get(rule.categoryId)
              return (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => setEditing(rule)}
                  className={`flex items-center gap-3 rounded-2xl border border-border p-3 text-left ${!rule.active ? 'opacity-50' : ''}`}
                >
                  <CategoryIcon icon={category?.icon ?? 'Repeat'} color={category?.color ?? '#78716c'} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium">{rule.description}</p>
                    <p className="text-xs text-muted-foreground">{FREQUENCY_LABELS[rule.frequency]}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[15px] font-semibold tabular-nums ${rule.type === 'income' ? 'text-success' : ''}`}>
                      {rule.type === 'income' ? '+' : '-'}
                      {formatCurrency(rule.amountMinor, settings?.currency)}
                    </span>
                    <span
                      role="switch"
                      aria-checked={rule.active}
                      aria-label={`${rule.active ? 'Pause' : 'Resume'} ${rule.description}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateRecurring(rule.id, { active: !rule.active })
                      }}
                      className={`flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors ${
                        rule.active ? 'bg-primary' : 'bg-secondary'
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full bg-card shadow transition-transform ${rule.active ? 'translate-x-4' : ''}`}
                      />
                    </span>
                  </div>
                </button>
              )
            })}
            <Button variant="outline" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> Add Recurring
            </Button>
          </>
        )}
      </div>

      <RecurringFormSheet open={editing !== null} onClose={() => setEditing(null)} rule={editing ?? undefined} />
      <RecurringFormSheet open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
