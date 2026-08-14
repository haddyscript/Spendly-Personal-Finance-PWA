import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface MonthSwitcherProps {
  onPrevious: () => void
  onNext: () => void
  nextDisabled?: boolean
}

export function MonthSwitcher({ onPrevious, onNext, nextDisabled }: MonthSwitcherProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Previous month"
        onClick={onPrevious}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground transition-colors active:bg-border hover:bg-border/70"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Next month"
        onClick={onNext}
        disabled={nextDisabled}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground transition-colors active:bg-border hover:bg-border/70 disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
