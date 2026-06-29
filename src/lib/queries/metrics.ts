import { supabase } from '@/lib/supabase'

export const metricsKeys = {
  weight: (days: number) => ['metrics', 'weight', days] as const,
  load: (days: number) => ['metrics', 'load', days] as const,
  exerciseNames: () => ['metrics', 'exerciseNames'] as const,
  strength: (exercise: string) => ['metrics', 'strength', exercise] as const,
}

export interface WeightPoint {
  date: string
  weight: number
  rollingAvg: number | null
}

export interface LoadPoint {
  date: string
  load: number
  rolling7: number
  rolling28: number
}

export interface StrengthPoint {
  date: string
  best1rm: number
  bestWeight: number
  bestReps: number
}

export async function fetchWeightHistory(days: number): Promise<WeightPoint[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('daily_checkins')
    .select('date, weight_kg')
    .gte('date', cutoffStr)
    .not('weight_kg', 'is', null)
    .order('date', { ascending: true })

  if (error) throw error

  const rows = (data ?? []) as { date: string; weight_kg: number }[]
  return rows.map((r, i) => {
    const windowStart = Math.max(0, i - 6)
    const window = rows.slice(windowStart, i + 1)
    const avg = window.reduce((s, w) => s + w.weight_kg, 0) / window.length
    return {
      date: r.date,
      weight: r.weight_kg,
      rollingAvg: window.length >= 3 ? Math.round(avg * 10) / 10 : null,
    }
  })
}

export async function fetchLoadHistory(days: number): Promise<LoadPoint[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('training_sessions')
    .select('date, session_load')
    .gte('date', cutoffStr)
    .neq('completed_status', 'skipped')
    .order('date', { ascending: true })

  if (error) throw error

  // Aggregate load by date (multiple sessions on same day)
  const byDate = new Map<string, number>()
  for (const r of data ?? []) {
    byDate.set(r.date, (byDate.get(r.date) ?? 0) + (r.session_load ?? 0))
  }

  // Fill every day in range so rolling windows are correct
  const result: LoadPoint[] = []
  const start = new Date(cutoffStr)
  const today = new Date()
  const cursor = new Date(start)

  while (cursor <= today) {
    const dateStr = cursor.toISOString().split('T')[0]
    const load = byDate.get(dateStr) ?? 0

    result.push({ date: dateStr, load, rolling7: 0, rolling28: 0 })
    cursor.setDate(cursor.getDate() + 1)
  }

  // Compute rolling sums
  result.forEach((pt, i) => {
    const w7 = result.slice(Math.max(0, i - 6), i + 1)
    const w28 = result.slice(Math.max(0, i - 27), i + 1)
    pt.rolling7 = w7.reduce((s, p) => s + p.load, 0)
    pt.rolling28 = Math.round(w28.reduce((s, p) => s + p.load, 0) / 4)
  })

  return result
}

export async function fetchExerciseNames(): Promise<string[]> {
  const { data, error } = await supabase
    .from('exercise_results')
    .select('exercise_name')
    .order('exercise_name', { ascending: true })

  if (error) throw error

  const names = [...new Set((data ?? []).map((r) => r.exercise_name))]
  return names.sort()
}

// Epley 1RM estimate: weight * (1 + reps/30)
function epley1rm(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

export async function fetchStrengthHistory(exerciseName: string): Promise<StrengthPoint[]> {
  const { data, error } = await supabase
    .from('exercise_results')
    .select('created_at, weight_kg, actual_reps, training_sessions(date)')
    .eq('exercise_name', exerciseName)
    .not('weight_kg', 'is', null)
    .not('actual_reps', 'is', null)
    .order('created_at', { ascending: true })

  if (error) throw error

  // Best set per day (by estimated 1RM)
  const byDate = new Map<string, StrengthPoint>()
  for (const r of data ?? []) {
    const session = r.training_sessions as { date: string } | null
    if (!session) continue
    const weight = r.weight_kg as number
    const reps = r.actual_reps as number
    const est1rm = epley1rm(weight, reps)

    const existing = byDate.get(session.date)
    if (!existing || est1rm > existing.best1rm) {
      byDate.set(session.date, {
        date: session.date,
        best1rm: est1rm,
        bestWeight: weight,
        bestReps: reps,
      })
    }
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}
