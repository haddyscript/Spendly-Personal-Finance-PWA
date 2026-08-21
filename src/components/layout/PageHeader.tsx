import type { ReactNode } from 'react'
import { GLASS_HEADER } from '@/lib/glass'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  /** Rendered below the title, still inside the sticky header — e.g. a search bar that should stay pinned while the page scrolls. */
  children?: ReactNode
}

export function PageHeader({ title, subtitle, action, children }: PageHeaderProps) {
  return (
    <header className={`${GLASS_HEADER} sticky top-0 z-30 border-b border-border/50 px-5 pb-4 pt-6 safe-top`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </header>
  )
}
