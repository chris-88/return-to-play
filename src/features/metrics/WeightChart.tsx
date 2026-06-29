import { useQuery } from '@tanstack/react-query'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchWeightHistory, metricsKeys } from '@/lib/queries/metrics'
import ChartShell from './ChartShell'

const RANGE_OPTIONS = [
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: 'All', days: 365 },
] as const

interface Props {
  days: number
  onDaysChange: (days: number) => void
}

export default function WeightChart({ days, onDaysChange }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: metricsKeys.weight(days),
    queryFn: () => fetchWeightHistory(days),
  })

  const points = data ?? []
  const domain = points.length > 0 ? computeDomain(points.map((p) => p.weight)) : undefined

  return (
    <ChartShell
      title="Weight"
      rangeOptions={RANGE_OPTIONS}
      activeDays={days}
      onRangeChange={onDaysChange}
      isEmpty={!isLoading && points.length === 0}
      isLoading={isLoading}
      isError={isError}
      emptyMessage="No weight entries yet — log weight in Daily Check-in."
    >
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={points} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={fmtDate}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 11 }} domain={domain} tickFormatter={(v) => `${v}`} />
          <Tooltip
            labelFormatter={(d) => (typeof d === 'string' ? fmtDate(d) : '')}
            formatter={(v, name) => [`${v} kg`, name === 'weight' ? 'Weight' : '7-day avg']}
          />
          <Line
            type="monotone"
            dataKey="weight"
            dot={false}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            opacity={0.6}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="rollingAvg"
            dot={false}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

function fmtDate(d: string) {
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function computeDomain(vals: number[]): [number, number] {
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const pad = Math.max(1, (max - min) * 0.15)
  return [Math.floor(min - pad), Math.ceil(max + pad)]
}
