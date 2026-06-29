import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchExerciseNames, fetchStrengthHistory, metricsKeys } from '@/lib/queries/metrics'
import ChartShell from './ChartShell'

export default function StrengthChart() {
  const [exercise, setExercise] = useState<string | null>(null)

  const { data: names, isLoading: loadingNames } = useQuery({
    queryKey: metricsKeys.exerciseNames(),
    queryFn: fetchExerciseNames,
  })

  const firstExercise = names?.[0] ?? null
  const selectedExercise = exercise ?? firstExercise

  const { data, isLoading, isError } = useQuery({
    queryKey: metricsKeys.strength(selectedExercise ?? ''),
    queryFn: () => fetchStrengthHistory(selectedExercise!),
    enabled: !!selectedExercise,
  })

  const points = data ?? []
  const domain = points.length > 0 ? computeDomain(points.map((p) => p.best1rm)) : undefined

  return (
    <ChartShell
      title="Strength progression"
      subtitle="Estimated 1RM per session (Epley formula)"
      isEmpty={!isLoading && !loadingNames && (names?.length ?? 0) === 0}
      isLoading={isLoading || loadingNames}
      isError={isError}
      emptyMessage="No exercise results logged yet."
      headerSlot={
        names && names.length > 0 ? (
          <Select value={selectedExercise ?? ''} onValueChange={(v) => setExercise(v ?? null)}>
            <SelectTrigger className="h-7 w-48 text-xs">
              <SelectValue placeholder="Select exercise" />
            </SelectTrigger>
            <SelectContent>
              {names.map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null
      }
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
          <YAxis tick={{ fontSize: 11 }} domain={domain} tickFormatter={(v) => `${v}kg`} />
          <Tooltip content={<CustomTooltip points={points} />} />
          <Line
            type="monotone"
            dataKey="best1rm"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3, fill: 'hsl(var(--primary))' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

function CustomTooltip({
  active,
  payload,
  label,
  points,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
  points: { date: string; best1rm: number; bestWeight: number; bestReps: number }[]
}) {
  if (!active || !payload?.length || !label) return null
  const pt = points.find((p) => p.date === label)
  if (!pt) return null
  return (
    <div className="bg-popover text-popover-foreground rounded-md border px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{fmtDate(label)}</p>
      <p>Est. 1RM: {pt.best1rm} kg</p>
      <p className="text-muted-foreground">
        Best set: {pt.bestWeight} kg × {pt.bestReps}
      </p>
    </div>
  )
}

function fmtDate(d: string) {
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function computeDomain(vals: number[]): [number, number] {
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const pad = Math.max(1, (max - min) * 0.2)
  return [Math.floor(min - pad), Math.ceil(max + pad)]
}
