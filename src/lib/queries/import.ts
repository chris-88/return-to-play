import { supabase } from '@/lib/supabase'
import type { InsertTables, Tables } from '@/lib/supabase'
import type { Json } from '@/lib/database.types'
import type { WatchWorkoutRow, PlanAdjustmentRow } from '@/features/import/schemas'

export type PlanAdjustment = Tables<'plan_adjustments'>

// Upsert watch workouts — conflict on (user_id, date, activity_type)
export async function upsertWatchWorkouts(
  userId: string,
  rows: WatchWorkoutRow[],
): Promise<{ inserted: number; duplicates: number }> {
  const dates = [...new Set(rows.map((r) => r.date))]

  const { data: existing } = await supabase
    .from('watch_workouts')
    .select('date, activity_type')
    .in('date', dates)

  const existingKeys = new Set((existing ?? []).map((e) => `${e.date}::${e.activity_type}`))

  const newRows = rows.filter((r) => !existingKeys.has(`${r.date}::${r.activity_type}`))
  const duplicates = rows.length - newRows.length

  if (newRows.length === 0) return { inserted: 0, duplicates }

  const inserts: InsertTables<'watch_workouts'>[] = newRows.map((r) => ({
    user_id: userId,
    date: r.date,
    activity_type: r.activity_type,
    duration_min: r.duration_min,
    distance_km: r.distance_km ?? null,
    active_kcal: r.active_kcal ?? null,
    avg_hr: r.avg_hr ?? null,
    max_hr: r.max_hr ?? null,
    steps: r.steps ?? null,
    vo2max: r.vo2max ?? null,
    resting_hr: r.resting_hr ?? null,
    hrv: r.hrv ?? null,
    source: 'apple_health',
    raw_payload: r as unknown as Json,
  }))

  const { error } = await supabase.from('watch_workouts').insert(inserts)
  if (error) throw error

  return { inserted: newRows.length, duplicates }
}

// Insert plan adjustments (always new rows — never update existing)
export async function insertPlanAdjustments(
  userId: string,
  rows: PlanAdjustmentRow[],
): Promise<number> {
  const today = new Date().toISOString().split('T')[0]

  const inserts: InsertTables<'plan_adjustments'>[] = rows.map((r) => ({
    user_id: userId,
    date: today,
    effective_from: r.effective_from,
    source: 'chatgpt_review',
    session_code: r.session_code,
    change_type: r.change_type,
    field: r.field,
    new_value: r.new_value,
    reason: r.reason,
    changes_json: r as unknown as Json,
    applied: false,
  }))

  const { error } = await supabase.from('plan_adjustments').insert(inserts)
  if (error) throw error
  return inserts.length
}

export async function fetchPendingAdjustments(): Promise<PlanAdjustment[]> {
  const { data, error } = await supabase
    .from('plan_adjustments')
    .select('*')
    .eq('applied', false)
    .order('effective_from', { ascending: true })
  if (error) throw error
  return data
}

export async function applyAdjustment(id: string): Promise<void> {
  const { error } = await supabase
    .from('plan_adjustments')
    .update({ applied: true, applied_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function dismissAdjustment(id: string): Promise<void> {
  const { error } = await supabase.from('plan_adjustments').delete().eq('id', id)
  if (error) throw error
}
