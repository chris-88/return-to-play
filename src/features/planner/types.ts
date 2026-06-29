import type { SessionTemplate, SessionVersion } from '@/types/training'

export interface RecommendationInput {
  currentBlockId: string
  recentSessions: RecentSession[]
  latestCheckin: CheckinSnapshot | null
  availableTimeMin: 30 | 45 | 60 | 75
  currentFeel: 'good' | 'okay' | 'tired' | 'sore'
  warningArea: string | null
}

export interface RecentSession {
  date: string
  category: string
  session_load: number
}

export interface CheckinSnapshot {
  date: string
  fatigue: number | null
  soreness: number | null
  readiness: number | null
  sleep_hours: number | null
  pain_area: string | null
  pain_score: number | null
}

export interface Recommendation {
  session: SessionTemplate
  version: SessionVersion
  reason: string[]
  warnings: string[]
  alternative: SessionTemplate | null
}
