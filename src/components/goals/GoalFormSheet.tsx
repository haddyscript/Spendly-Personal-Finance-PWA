import { createElement, useState } from 'react'
import type { FormEvent } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { getIcon, ICON_NAMES } from '@/lib/icons'
import { CATEGORY_COLORS } from '@/lib/colors'
import { addGoal, updateGoal } from '@/services/goalService'
import { useToast } from '@/hooks/useToast'
import { toMinorUnits, fromMinorUnits } from '@/utils/money'
import type { Goal } from '@/types/models'

const GOAL_ICONS = ['PiggyBank', 'Laptop', 'Plane', 'Home', 'Car', 'GraduationCap', 'Gift', 'Smartphone', ...ICON_NAMES].filter(
  (v, i, arr) => arr.indexOf(v) === i,
)

export interface GoalFormSheetProps {
  open: boolean
  onClose: () => void
  goal?: Goal
}

export function GoalFormSheet({ open, onClose, goal }: GoalFormSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={goal ? 'Edit Goal' : 'New Goal'}>
      {open && <GoalForm key={goal?.id ?? 'new'} goal={goal} onClose={onClose} />}
    </Sheet>
  )
}

interface GoalFormProps {
  goal?: Goal
  onClose: () => void
}

function GoalForm({ goal, onClose }: GoalFormProps) {
  const { success, error } = useToast()
  const [name, setName] = useState(goal?.name ?? '')
  const [target, setTarget] = useState(goal ? String(fromMinorUnits(goal.targetAmountMinor)) : '')
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? '')
  const [icon, setIcon] = useState(goal?.icon ?? 'PiggyBank')
  const [color, setColor] = useState(goal?.color ?? CATEGORY_COLORS[6])
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    const parsedTarget = parseFloat(target)

    if (!trimmed) {
      error('Enter a goal name')
      return
    }
    if (!parsedTarget || parsedTarget <= 0) {
      error('Enter a valid target amount')
      return
    }

    setSubmitting(true)
    try {
      const targetAmountMinor = toMinorUnits(parsedTarget)
      if (goal) {
        await updateGoal(goal.id, { name: trimmed, targetAmountMinor, targetDate: targetDate || null, icon, color })
        success('Goal updated')
      } else {
        await addGoal({ name: trimmed, targetAmountMinor, targetDate: targetDate || null, icon, color })
        success('Goal created')
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
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {createElement(getIcon(icon), { className: 'h-6 w-6' })}
        </div>
      </div>

      <div>
        <Label htmlFor="goal-name">Goal Name</Label>
        <Input id="goal-name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. New MacBook" />
      </div>

      <div>
        <Label htmlFor="goal-target">Target Amount</Label>
        <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input px-4 focus-within:ring-2 focus-within:ring-ring">
          <span className="text-xl font-semibold text-muted-foreground">₱</span>
          <input
            id="goal-target"
            inputMode="decimal"
            placeholder="0.00"
            value={target}
            onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ''))}
            className="h-14 w-full bg-transparent text-2xl font-semibold tabular-nums outline-none placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="goal-date">Target Date (optional)</Label>
        <Input id="goal-date" type="date" className="mt-1.5" value={targetDate ?? ''} onChange={(e) => setTargetDate(e.target.value)} />
      </div>

      <div>
        <Label>Icon</Label>
        <div className="mt-1.5 grid grid-cols-6 gap-2">
          {GOAL_ICONS.slice(0, 12).map((iconName) => (
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
        {goal ? 'Save Changes' : 'Create Goal'}
      </Button>
    </form>
  )
}
