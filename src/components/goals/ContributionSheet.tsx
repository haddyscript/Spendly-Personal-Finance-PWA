import { useState } from 'react'
import type { FormEvent } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Input'
import { addContribution } from '@/services/goalService'
import { useToast } from '@/hooks/useToast'
import { toMinorUnits } from '@/utils/money'
import type { Goal } from '@/types/models'

export interface ContributionSheetProps {
  open: boolean
  onClose: () => void
  goal: Goal | null
}

export function ContributionSheet({ open, onClose, goal }: ContributionSheetProps) {
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { success, error } = useToast()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!goal) return
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) {
      error('Enter a valid amount')
      return
    }

    setSubmitting(true)
    try {
      const updated = await addContribution(goal.id, toMinorUnits(parsed))
      if (updated && updated.currentAmountMinor >= updated.targetAmountMinor) {
        success('Goal reached! 🎉', `${goal.name} is fully funded.`)
      } else {
        success('Contribution added')
      }
      setAmount('')
      onClose()
    } catch {
      error('Something went wrong', 'Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!goal) return null

  return (
    <Sheet open={open} onClose={onClose} title={`Add to ${goal.name}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <Label htmlFor="contribution-amount">Amount</Label>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-input px-4 focus-within:ring-2 focus-within:ring-ring">
            <span className="text-xl font-semibold text-muted-foreground">₱</span>
            <input
              id="contribution-amount"
              inputMode="decimal"
              autoFocus
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              className="h-14 w-full bg-transparent text-2xl font-semibold tabular-nums outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
        <Button type="submit" size="lg" disabled={submitting}>
          Add Contribution
        </Button>
      </form>
    </Sheet>
  )
}
