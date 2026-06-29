import { useCallback, useEffect, useState } from 'react'
import { sessionLoad } from '@/lib/calculations'
import type { SessionCategory, CompletedStatus } from '@/types/training'

export interface LocalSession {
  id: string
  date: string
  block_id: string
  session_code: string
  session_name: string
  session_category: SessionCategory
  duration_min: number
  session_rpe: number
  session_load: number
  completed_status: CompletedStatus
  pain_area: string | null
  pain_score: number | null
  notes: string | null
}

export interface LocalExerciseResult {
  exercise_name: string
  set_number: number
  actual_reps: number | null
  weight_kg: number | null
  duration_sec: number | null
  distance_m: number | null
  rpe: number | null
  completed: boolean
  notes: string | null
}

const STORAGE_KEY = 'rtp_sessions_v1'

function load(): LocalSession[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useLocalSessions() {
  const [sessions, setSessions] = useState<LocalSession[]>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }, [sessions])

  const addSession = useCallback(
    (
      input: Omit<LocalSession, 'id' | 'session_load'> & {
        duration_min: number
        session_rpe: number
      },
    ) => {
      const session: LocalSession = {
        ...input,
        id: `${Date.now()}`,
        session_load: sessionLoad(input.duration_min, input.session_rpe),
      }
      setSessions((prev) => [session, ...prev])
      return session
    },
    [],
  )

  const recentSessions = useCallback(
    (days = 10) => {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      const cutoffStr = cutoff.toISOString().split('T')[0]
      return sessions.filter((s) => s.date >= cutoffStr && s.completed_status !== 'skipped')
    },
    [sessions],
  )

  return { sessions, addSession, recentSessions }
}
