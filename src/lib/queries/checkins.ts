import { supabase } from '@/lib/supabase'
import type { InsertTables, Tables } from '@/lib/supabase'

export type DailyCheckin = Tables<'daily_checkins'>
export type DailyCheckinInsert = InsertTables<'daily_checkins'>

export const checkinKeys = {
  all: ['daily_checkins'] as const,
  today: (date: string) => ['daily_checkins', 'today', date] as const,
  recent: (days: number) => ['daily_checkins', 'recent', days] as const,
}

export async function fetchTodayCheckin(date: string): Promise<DailyCheckin | null> {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('date', date)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function upsertCheckin(input: DailyCheckinInsert): Promise<DailyCheckin> {
  const { data, error } = await supabase
    .from('daily_checkins')
    .upsert(input, { onConflict: 'user_id,date' })
    .select()
    .single()

  if (error) throw error
  return data
}
