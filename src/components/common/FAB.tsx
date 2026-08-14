import { Plus } from 'lucide-react'

export function FAB({ onClick }: { onClick: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center safe-bottom">
      <div className="relative w-full max-w-lg">
        <button
          type="button"
          onClick={onClick}
          aria-label="Add transaction"
          className="pointer-events-auto absolute bottom-0 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
