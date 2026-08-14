import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import type { MonthlyTotal } from '@/utils/calculations'
import { formatCurrencyCompact } from '@/utils/money'
import { useSettings } from '@/hooks/useSettings'
import { useIsDarkMode } from '@/hooks/useIsDarkMode'
import { INCOME_COLOR, EXPENSE_COLOR } from '@/lib/colors'

export interface MonthlyBarChartProps {
  data: MonthlyTotal[]
}

function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' })
}

function TooltipContent({ active, payload }: { active?: boolean; payload?: { payload: MonthlyTotal }[] }) {
  const { settings } = useSettings()
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{monthLabel(point.month)}</p>
      <p className="text-success">Income: {formatCurrencyCompact(point.income, settings?.currency)}</p>
      <p className="text-destructive">Expense: {formatCurrencyCompact(point.expense, settings?.currency)}</p>
    </div>
  )
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  const isDark = useIsDarkMode()
  const income = isDark ? INCOME_COLOR.dark : INCOME_COLOR.light
  const expense = isDark ? EXPENSE_COLOR.dark : EXPENSE_COLOR.light
  const muted = isDark ? '#a1a1aa' : '#64748b'
  const grid = isDark ? '#27272a' : '#e2e8f0'

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: income }} /> Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: expense }} /> Expense
        </span>
      </div>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={3} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={grid} />
            <XAxis
              dataKey="month"
              tickFormatter={monthLabel}
              axisLine={false}
              tickLine={false}
              tick={{ fill: muted, fontSize: 12 }}
            />
            <Tooltip content={<TooltipContent />} cursor={{ fill: isDark ? '#27272a' : '#f1f5f9' }} />
            <Bar dataKey="income" fill={income} radius={[4, 4, 4, 4]} maxBarSize={14} isAnimationActive={false} />
            <Bar dataKey="expense" fill={expense} radius={[4, 4, 4, 4]} maxBarSize={14} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
