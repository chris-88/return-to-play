import { supabase } from '@/lib/supabase'
import type { InsertTables, Tables } from '@/lib/supabase'

export type TrainingSession = Tables<'training_sessions'>
export type TrainingSessionInsert = InsertTables<'training_sessions'>

export const sessionKeys = {
  all: ['training_sessions'] as const,
  recent: (days: number) => ['training_sessions', 'recent', days] as const,
}

export async function fetchRecentSessions(days: number): Promise<TrainingSession[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('training_sessions')
    .select('*')
    .gte('date', cutoffStr)
    .neq('completed_status', 'skipped')
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

export async function insertSession(input: TrainingSessionInsert): Promise<TrainingSession> {
  const { data, error } = await supabase.from('training_sessions').insert(input).select().single()

  if (error) throw error
  return data
}
