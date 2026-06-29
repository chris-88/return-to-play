import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchLoadHistory, metricsKeys } from '@/lib/queries/metrics'
import ChartShell from './ChartShell'

const RANGE_OPTIONS = [
  { label: '28d', days: 28 },
  { label: '90d', days: 90 },
  { label: '6m', days: 180 },
] as const

interface Props {
  days: number
  onDaysChange: (days: number) => void
}

export default function LoadChart({ days, onDaysChange }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: metricsKeys.load(days),
    queryFn: () => fetchLoadHistory(days),
  })

  // Only show days that had a session (for the bar chart to not be noise)
  const allPoints = data ?? []
  const points = allPoints.filter((p) => p.load > 0 || p.rolling7 > 0)

  return (
    <div className="space-y-6">
      {/* Daily load bars */}
      <ChartShell
        title="Daily session load"
        rangeOptions={RANGE_OPTIONS}
        activeDays={days}
        onRangeChange={onDaysChange}
        isEmpty={!isLoading && allPoints.length === 0}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No sessions logged yet."
      >
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={points} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={fmtDate}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              labelFormatter={(d) => (typeof d === 'string' ? fmtDate(d) : '')}
              formatter={(v) => [v, 'Load']}
            />
            <Bar dataKey="load" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>

      {/* Rolling load (acute 7d vs chronic 28d weekly avg) */}
      <ChartShell
        title="Acute vs chronic load"
        subtitle="7-day rolling (acute) · 28-day weekly average (chronic)"
        isEmpty={!isLoading && allPoints.length < 7}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="Not enough data — log more sessions to see trends."
      >
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={allPoints} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={fmtDate}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              labelFormatter={(d) => (typeof d === 'string' ? fmtDate(d) : '')}
              formatter={(v, name) => [v, name === 'rolling7' ? 'Acute (7d)' : 'Chronic (28d avg)']}
            />
            <Line
              type="monotone"
              dataKey="rolling7"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="rolling28"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartShell>
    </div>
  )
}

function fmtDate(d: string) {
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
