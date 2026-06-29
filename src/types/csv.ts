export interface DailyCheckinRow {
  date: string
  weight_kg: string
  sleep_hours: string
  sleep_quality: string
  fatigue: string
  soreness: string
  stress: string
  readiness: string
  steps: string
  water_litres: string
  protein_g: string
  calories: string
  alcohol_units: string
  creatine_taken: string
  protein_supplement_taken: string
  pain_area: string
  pain_score: string
  notes: string
}

export interface TrainingSessionRow {
  date: string
  block: string
  session_code: string
  session_name: string
  category: string
  duration_min: string
  rpe: string
  session_load: string
  completed_status: string
  pain_area: string
  pain_score: string
  notes: string
}

export interface ExerciseResultRow {
  date: string
  session_code: string
  exercise_name: string
  set_number: string
  weight_kg: string
  reps: string
  duration_sec: string
  distance_m: string
  rpe: string
  notes: string
}

export interface BodyMetricRow {
  date: string
  weight_kg: string
  waist_cm: string
  photo_front_url: string
  photo_side_url: string
  photo_back_url: string
  notes: string
}

export interface WatchWorkoutRow {
  date: string
  activity_type: string
  duration_min: string
  distance_km: string
  active_kcal: string
  avg_hr: string
  max_hr: string
  steps: string
  vo2max: string
  resting_hr: string
  hrv: string
}

export interface PlanAdjustmentRow {
  effective_from: string
  block: string
  session_code: string
  change_type: string
  field: string
  new_value: string
  reason: string
}
