import { supabase } from '@/lib/supabase'

export async function fetchAllCheckins() {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .order('date', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchAllSessions() {
  const { data, error } = await supabase
    .from('training_sessions')
    .select('*')
    .order('date', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchAllExerciseResults() {
  const { data, error } = await supabase
    .from('exercise_results')
    .select('*, training_sessions(date, session_code)')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchAllBodyMetrics() {
  const { data, error } = await supabase
    .from('body_metrics')
    .select('*')
    .order('date', { ascending: true })
  if (error) throw error
  return data
}

export async function fetchAllWatchWorkouts() {
  const { data, error } = await supabase
    .from('watch_workouts')
    .select('*')
    .order('date', { ascending: true })
  if (error) throw error
  return data
}
