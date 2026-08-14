import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export interface BackButtonProps {
  to: string
  label: string
}

export function BackButton({ to, label }: BackButtonProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors active:bg-border hover:bg-border/70"
    >
      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
    </Link>
  )
}
