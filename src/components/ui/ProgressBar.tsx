import { cn } from '@/lib/cn'

export interface ProgressBarProps {
  percentage: number
  className?: string
  barClassName?: string
  isOverBudget?: boolean
}

export function ProgressBar({ percentage, className, barClassName, isOverBudget }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(percentage, 100))
  return (
    <div
      className={cn('h-2.5 w-full overflow-hidden rounded-full bg-secondary', className)}
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          isOverBudget ? 'bg-destructive' : 'bg-primary',
          barClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
