export type SessionCategory =
  | 'lower_strength'
  | 'upper_trunk'
  | 'conditioning'
  | 'athletic_movement'
  | 'football'
  | 'recovery'
  | 'other'

export type SessionVersion = 'full' | 'compressed' | 'recovery'

export type CompletedStatus = 'completed' | 'partial' | 'skipped'

export interface TrainingBlock {
  id: string
  name: string
  phase: string
  start_date: string
  end_date: string
  goal: string
  priority_order: string[]
  target_weight_min_kg: number | null
  target_weight_max_kg: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SessionTemplate {
  id: string
  block_id: string
  session_code: string
  name: string
  category: SessionCategory
  priority: number
  estimated_duration_min: number
  purpose: string
  intensity_target: string
  default_version: SessionExercise[]
  compressed_version: SessionExercise[]
  recovery_version: SessionExercise[]
  created_at: string
  updated_at: string
}

export interface SessionExercise {
  id: string
  session_template_id: string
  exercise_name: string
  exercise_category: string
  sets: number
  reps: string
  duration_sec: number | null
  distance_m: number | null
  intensity: string | null
  rest_seconds: number | null
  notes: string | null
  sort_order: number
}

export interface TrainingSession {
  id: string
  date: string
  block_id: string
  session_template_id: string | null
  session_code: string
  session_name: string
  session_category: SessionCategory
  planned_or_unplanned: 'planned' | 'unplanned'
  duration_min: number
  session_rpe: number
  session_load: number
  completed_status: CompletedStatus
  location: string | null
  warmup_completed: boolean
  pain_during_session: boolean
  pain_area: string | null
  pain_score: number | null
  energy_after_session: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ExerciseResult {
  id: string
  training_session_id: string
  exercise_name: string
  exercise_category: string
  set_number: number
  planned_sets: number
  planned_reps: string
  actual_reps: number | null
  weight_kg: number | null
  duration_sec: number | null
  distance_m: number | null
  rpe: number | null
  completed: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DailyCheckin {
  id: string
  date: string
  weight_kg: number | null
  sleep_hours: number | null
  sleep_quality: number | null
  fatigue: number | null
  soreness: number | null
  stress: number | null
  readiness: number | null
  steps: number | null
  water_litres: number | null
  protein_g: number | null
  calories: number | null
  alcohol_units: number | null
  creatine_taken: boolean
  protein_supplement_taken: boolean
  pain_area: string | null
  pain_score: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface BodyMetric {
  id: string
  date: string
  weight_kg: number | null
  waist_cm: number | null
  photo_front_url: string | null
  photo_side_url: string | null
  photo_back_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WatchWorkout {
  id: string
  date: string
  source: string
  activity_type: string
  duration_min: number
  distance_km: number | null
  active_kcal: number | null
  avg_hr: number | null
  max_hr: number | null
  steps: number | null
  vo2max: number | null
  resting_hr: number | null
  hrv: number | null
  raw_payload: Json | null
  created_at: string
  updated_at: string
}

export interface PlanAdjustment {
  id: string
  date: string
  effective_from: string
  source: string
  block_id: string | null
  session_code: string | null
  change_type: string
  field: string
  new_value: string
  reason: string
  changes_json: Json | null
  applied: boolean
  applied_at: string | null
  created_at: string
  updated_at: string
}

type Json = string | number | boolean | null | { [key: string]: Json } | Json[]
