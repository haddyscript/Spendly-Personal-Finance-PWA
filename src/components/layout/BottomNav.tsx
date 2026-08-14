import { NavLink } from 'react-router-dom'
import { Home, Receipt, Wallet, PieChart, Settings } from 'lucide-react'
import { cn } from '@/lib/cn'

const TABS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/transactions', label: 'Transactions', icon: Receipt, end: false },
  { to: '/budgets', label: 'Budgets', icon: Wallet, end: false },
  { to: '/analytics', label: 'Analytics', icon: PieChart, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
] as const

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur safe-bottom"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-9 w-12 items-center justify-center rounded-full transition-colors',
                      isActive && 'bg-accent',
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
