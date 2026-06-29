import { useMemo } from 'react'
import { seedSessions } from '@/data/seedSessions'
import { recommend } from '@/features/planner/recommendationEngine'
import type { CheckinSnapshot, Recommendation, RecommendationInput } from '@/features/planner/types'
import type { TrainingSession } from '@/lib/queries/sessions'

export interface RecommendationOptions {
  availableTimeMin?: 30 | 45 | 60 | 75
  currentFeel?: 'good' | 'okay' | 'tired' | 'sore'
  warningArea?: string | null
  latestCheckin?: CheckinSnapshot | null
}

export function useRecommendation(
  blockId: string | null,
  recentSessions: TrainingSession[],
  options: RecommendationOptions = {},
): Recommendation | null {
  const {
    availableTimeMin = 60,
    currentFeel = 'good',
    warningArea = null,
    latestCheckin = null,
  } = options

  return useMemo(() => {
    if (!blockId) return null

    const blockSessions = seedSessions.filter((s) => s.block_id === blockId)
    if (blockSessions.length === 0) return null

    const input: RecommendationInput = {
      currentBlockId: blockId,
      recentSessions: recentSessions.map((s) => ({
        date: s.date,
        category: s.session_category,
        session_load: s.session_load,
      })),
      latestCheckin,
      availableTimeMin,
      currentFeel,
      warningArea: warningArea === 'none' ? null : warningArea,
    }

    return recommend(input, blockSessions)
  }, [blockId, recentSessions, availableTimeMin, currentFeel, warningArea, latestCheckin])
}
