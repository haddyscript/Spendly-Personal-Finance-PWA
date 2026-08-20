import { useEffect, useState } from 'react'
import { Plus, Target } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { BackButton } from '@/components/layout/BackButton'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalFormSheet } from '@/components/goals/GoalFormSheet'
import { ContributionSheet } from '@/components/goals/ContributionSheet'
import { useGoals } from '@/hooks/useGoals'
import { deleteGoal } from '@/services/goalService'
import { useToast } from '@/hooks/useToast'
import type { Goal } from '@/types/models'

export default function GoalsPage() {
  const { goals, isLoading } = useGoals()
  const [editing, setEditing] = useState<Goal | null>(null)
  const [creating, setCreating] = useState(false)
  const [contributing, setContributing] = useState<Goal | null>(null)
  const [deleting, setDeleting] = useState<Goal | null>(null)
  const { success } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  // Landing spot for the "Add Goal Contribution" home-screen app shortcut. Waits for goals to
  // load so it can tell whether there's exactly one open goal to jump straight into — with more
  // than one, there's no way to know which the shortcut meant, so it just lands on the list.
  useEffect(() => {
    if (searchParams.get('action') !== 'contribute' || isLoading) return
    const openGoals = goals.filter((g) => g.completedAt === null)
    if (openGoals.length === 1) {
      const goal = openGoals[0]
      setTimeout(() => setContributing(goal), 0)
    }
    setSearchParams(
      (params) => {
        params.delete('action')
        return params
      },
      { replace: true },
    )
  }, [isLoading])

  async function handleDelete() {
    if (!deleting) return
    await deleteGoal(deleting.id)
    success('Goal deleted')
    setDeleting(null)
  }

  return (
    <div className="flex flex-col gap-4 pb-6 pt-6 safe-top">
      <PageHeader
        title="Goals"
        action={<BackButton to="/" label="Back to home" />}
      />

      <div className="flex flex-col gap-3 px-5">
        {!isLoading && goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No goals yet"
            description="Set a savings goal and track your progress toward it."
            action={
              <Button onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" /> New Goal
              </Button>
            }
          />
        ) : (
          <>
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => setEditing(goal)}
                onContribute={() => setContributing(goal)}
                onDelete={() => setDeleting(goal)}
              />
            ))}
            <Button variant="outline" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> New Goal
            </Button>
          </>
        )}
      </div>

      <GoalFormSheet open={editing !== null} onClose={() => setEditing(null)} goal={editing ?? undefined} />
      <GoalFormSheet open={creating} onClose={() => setCreating(false)} />
      <ContributionSheet open={contributing !== null} onClose={() => setContributing(null)} goal={contributing} />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete goal?"
        description={`"${deleting?.name}" and its progress will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
