import JSZip from 'jszip'
import Papa from 'papaparse'
import {
  fetchAllBodyMetrics,
  fetchAllCheckins,
  fetchAllExerciseResults,
  fetchAllSessions,
  fetchAllWatchWorkouts,
} from './queries/export'

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  return Papa.unparse(rows, { newline: '\n' })
}

function nullToEmpty<T extends Record<string, unknown>>(rows: T[]): Record<string, unknown>[] {
  return rows.map((row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v ?? ''])))
}

function pickCheckinCols(rows: Awaited<ReturnType<typeof fetchAllCheckins>>) {
  return rows.map((r) => ({
    date: r.date,
    weight_kg: r.weight_kg ?? '',
    sleep_hours: r.sleep_hours ?? '',
    sleep_quality: r.sleep_quality ?? '',
    fatigue: r.fatigue ?? '',
    soreness: r.soreness ?? '',
    stress: r.stress ?? '',
    readiness: r.readiness ?? '',
    steps: r.steps ?? '',
    water_litres: r.water_litres ?? '',
    protein_g: r.protein_g ?? '',
    calories: r.calories ?? '',
    alcohol_units: r.alcohol_units ?? '',
    creatine_taken: r.creatine_taken ?? '',
    protein_supplement_taken: r.protein_supplement_taken ?? '',
    pain_area: r.pain_area ?? '',
    pain_score: r.pain_score ?? '',
    notes: r.notes ?? '',
  }))
}

function pickSessionCols(rows: Awaited<ReturnType<typeof fetchAllSessions>>) {
  return rows.map((r) => ({
    date: r.date,
    block_id: r.block_id ?? '',
    session_code: r.session_code ?? '',
    session_name: r.session_name,
    category: r.session_category,
    duration_min: r.duration_min,
    rpe: r.session_rpe,
    session_load: r.session_load,
    completed_status: r.completed_status,
    pain_area: r.pain_area ?? '',
    pain_score: r.pain_score ?? '',
    notes: r.notes ?? '',
  }))
}

function pickExerciseCols(rows: Awaited<ReturnType<typeof fetchAllExerciseResults>>) {
  return rows.map((r) => {
    const session = r.training_sessions as { date: string; session_code: string | null } | null
    return {
      date: session?.date ?? '',
      session_code: session?.session_code ?? '',
      exercise_name: r.exercise_name,
      set_number: r.set_number,
      weight_kg: r.weight_kg ?? '',
      reps: r.actual_reps ?? '',
      duration_sec: r.duration_sec ?? '',
      distance_m: r.distance_m ?? '',
      rpe: r.rpe ?? '',
      notes: r.notes ?? '',
    }
  })
}

function pickBodyMetricCols(rows: Awaited<ReturnType<typeof fetchAllBodyMetrics>>) {
  return nullToEmpty(
    rows.map((r) => ({
      date: r.date,
      weight_kg: r.weight_kg,
      waist_cm: r.waist_cm,
      photo_front_url: r.photo_front_url,
      photo_side_url: r.photo_side_url,
      photo_back_url: r.photo_back_url,
      notes: r.notes,
    })),
  )
}

function pickWatchCols(rows: Awaited<ReturnType<typeof fetchAllWatchWorkouts>>) {
  return nullToEmpty(
    rows.map((r) => ({
      date: r.date,
      activity_type: r.activity_type,
      duration_min: r.duration_min,
      distance_km: r.distance_km,
      active_kcal: r.active_kcal,
      avg_hr: r.avg_hr,
      max_hr: r.max_hr,
      steps: r.steps,
      vo2max: r.vo2max,
      resting_hr: r.resting_hr,
      hrv: r.hrv,
    })),
  )
}

// Header-only CSV when there's no data
const HEADERS: Record<string, string> = {
  'daily_checkins.csv':
    'date,weight_kg,sleep_hours,sleep_quality,fatigue,soreness,stress,readiness,steps,water_litres,protein_g,calories,alcohol_units,creatine_taken,protein_supplement_taken,pain_area,pain_score,notes',
  'training_sessions.csv':
    'date,block_id,session_code,session_name,category,duration_min,rpe,session_load,completed_status,pain_area,pain_score,notes',
  'exercise_results.csv':
    'date,session_code,exercise_name,set_number,weight_kg,reps,duration_sec,distance_m,rpe,notes',
  'body_metrics.csv': 'date,weight_kg,waist_cm,photo_front_url,photo_side_url,photo_back_url,notes',
  'watch_workouts.csv':
    'date,activity_type,duration_min,distance_km,active_kcal,avg_hr,max_hr,steps,vo2max,resting_hr,hrv',
}

function safeCsv(rows: Record<string, unknown>[], filename: string): string {
  if (rows.length === 0) return HEADERS[filename] ?? ''
  return toCsv(rows)
}

export async function buildExportZip(): Promise<Blob> {
  const [checkins, sessions, exercises, bodyMetrics, watchWorkouts] = await Promise.all([
    fetchAllCheckins(),
    fetchAllSessions(),
    fetchAllExerciseResults(),
    fetchAllBodyMetrics(),
    fetchAllWatchWorkouts(),
  ])

  const zip = new JSZip()
  zip.file('daily_checkins.csv', safeCsv(pickCheckinCols(checkins), 'daily_checkins.csv'))
  zip.file('training_sessions.csv', safeCsv(pickSessionCols(sessions), 'training_sessions.csv'))
  zip.file('exercise_results.csv', safeCsv(pickExerciseCols(exercises), 'exercise_results.csv'))
  zip.file('body_metrics.csv', safeCsv(pickBodyMetricCols(bodyMetrics), 'body_metrics.csv'))
  zip.file('watch_workouts.csv', safeCsv(pickWatchCols(watchWorkouts), 'watch_workouts.csv'))

  return zip.generateAsync({ type: 'blob' })
}

export async function buildSingleCsv(
  table: 'checkins' | 'sessions' | 'exercises' | 'body_metrics' | 'watch_workouts',
): Promise<{ csv: string; filename: string }> {
  switch (table) {
    case 'checkins': {
      const rows = await fetchAllCheckins()
      return {
        csv: safeCsv(pickCheckinCols(rows), 'daily_checkins.csv'),
        filename: 'daily_checkins.csv',
      }
    }
    case 'sessions': {
      const rows = await fetchAllSessions()
      return {
        csv: safeCsv(pickSessionCols(rows), 'training_sessions.csv'),
        filename: 'training_sessions.csv',
      }
    }
    case 'exercises': {
      const rows = await fetchAllExerciseResults()
      return {
        csv: safeCsv(pickExerciseCols(rows), 'exercise_results.csv'),
        filename: 'exercise_results.csv',
      }
    }
    case 'body_metrics': {
      const rows = await fetchAllBodyMetrics()
      return {
        csv: safeCsv(pickBodyMetricCols(rows), 'body_metrics.csv'),
        filename: 'body_metrics.csv',
      }
    }
    case 'watch_workouts': {
      const rows = await fetchAllWatchWorkouts()
      return {
        csv: safeCsv(pickWatchCols(rows), 'watch_workouts.csv'),
        filename: 'watch_workouts.csv',
      }
    }
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
