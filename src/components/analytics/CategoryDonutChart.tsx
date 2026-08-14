import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/utils/money'
import { calculatePercentage } from '@/utils/calculations'
import { useSettings } from '@/hooks/useSettings'
import { useIsDarkMode } from '@/hooks/useIsDarkMode'

export interface CategorySlice {
  categoryId: string
  name: string
  color: string
  totalMinor: number
}

export interface CategoryDonutChartProps {
  data: CategorySlice[]
  totalMinor: number
}

function TooltipContent({ active, payload }: { active?: boolean; payload?: { payload: CategorySlice }[] }) {
  const { settings } = useSettings()
  if (!active || !payload?.length) return null
  const slice = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{slice.name}</p>
      <p className="text-muted-foreground">{formatCurrency(slice.totalMinor, settings?.currency)}</p>
    </div>
  )
}

export function CategoryDonutChart({ data, totalMinor }: CategoryDonutChartProps) {
  const { settings } = useSettings()
  const isDark = useIsDarkMode()
  const cardColor = isDark ? '#18181b' : '#ffffff'

  return (
    <div>
      <div className="relative mx-auto h-56 w-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="totalMinor"
              nameKey="name"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke={cardColor}
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((slice) => (
                <Cell key={slice.categoryId} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip content={<TooltipContent />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold tabular-nums">{formatCurrency(totalMinor, settings?.currency)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-0.5">
        {data.map((slice) => (
          <Link
            key={slice.categoryId}
            to={`/transactions?category=${slice.categoryId}`}
            className="flex items-center gap-2.5 rounded-xl p-1.5 text-sm transition-colors active:bg-secondary hover:bg-secondary/60"
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-foreground">{slice.name}</span>
            <span className="tabular-nums text-muted-foreground">
              {calculatePercentage(slice.totalMinor, totalMinor).toFixed(0)}%
            </span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </div>
  )
}
