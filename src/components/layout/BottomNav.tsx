import { NavLink } from 'react-router-dom'
import { Home, Receipt, Wallet, PieChart, Settings, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { haptic } from '@/lib/haptics'

interface NavTab {
  to: string
  label: string
  icon: LucideIcon
  end: boolean
}

const LEFT_TABS: NavTab[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/transactions', label: 'Transactions', icon: Receipt, end: false },
]

const RIGHT_TABS: NavTab[] = [
  { to: '/budgets', label: 'Budgets', icon: Wallet, end: false },
  { to: '/analytics', label: 'Analytics', icon: PieChart, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

// Bar shape: a floating rounded pill with a semicircular notch cut into the
// top edge (centered over the gap between the left and right tab groups) so
// the quick-add button can nest into it. Drawn at a fixed baseline size and
// stretched to fill the bar — the notch is a true geometric cutout rather
// than a color-matched circle, so it stays correct regardless of what's
// scrolling behind the nav.
const BAR_VIEWBOX_WIDTH = 400
const BAR_VIEWBOX_HEIGHT = 76
const BAR_PATH =
  'M32 0 H126 A40 40 0 0 0 206 0 H368 A32 32 0 0 1 400 32 V44 A32 32 0 0 1 368 76 H32 A32 32 0 0 1 0 44 V32 A32 32 0 0 1 32 0 Z'
const NOTCH_CENTER_PERCENT = (166 / BAR_VIEWBOX_WIDTH) * 100

function TabLink({ to, label, icon: Icon, end }: NavTab) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={() => haptic('light')}
      className="flex flex-1 flex-col items-center justify-center gap-1 py-3"
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
              isActive ? 'bg-violet-500 text-white' : 'text-muted-foreground',
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          {isActive && <span className="text-[11px] font-medium text-violet-500">{label}</span>}
        </>
      )}
    </NavLink>
  )
}

export function BottomNav({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-2 z-40 flex justify-center safe-bottom">
      <nav aria-label="Primary" className="pointer-events-auto relative w-full max-w-5xl px-4">
        <div
          className="relative drop-shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
          style={{ height: BAR_VIEWBOX_HEIGHT }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-[32px] backdrop-blur-[28px]">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox={`0 0 ${BAR_VIEWBOX_WIDTH} ${BAR_VIEWBOX_HEIGHT}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d={BAR_PATH} className="fill-card/85 stroke-border/60" strokeWidth={1} />
            </svg>
          </div>

          <ul className="relative flex h-full items-stretch">
            {LEFT_TABS.map((tab) => (
              <li key={tab.to} className="flex flex-1">
                <TabLink {...tab} />
              </li>
            ))}
            <li className="w-[16.6%] shrink-0" aria-hidden="true" />
            {RIGHT_TABS.map((tab) => (
              <li key={tab.to} className="flex flex-1">
                <TabLink {...tab} />
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => {
              haptic('medium')
              onAddClick()
            }}
            aria-label="Add transaction"
            className="absolute -top-6 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-b from-violet-500 to-violet-700 text-white shadow-[0_0_24px_rgba(139,92,246,0.55)] transition-transform active:scale-95"
            style={{ left: `${NOTCH_CENTER_PERCENT}%` }}
          >
            <Plus className="h-7 w-7" aria-hidden="true" />
          </button>
        </div>
      </nav>
    </div>
  )
}
