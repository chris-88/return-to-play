import { useMemo } from 'react'
import { seedSessions } from '@/data/seedSessions'
import { recommend } from '@/features/planner/recommendationEngine'
import type { RecommendationInput, Recommendation } from '@/features/planner/types'
import type { TrainingSession } from '@/lib/queries/sessions'

export function useRecommendation(
  blockId: string | null,
  recentSessions: TrainingSession[],
): Recommendation | null {
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
      latestCheckin: null,
      availableTimeMin: 60,
      currentFeel: 'good',
      warningArea: null,
    }

    return recommend(input, blockSessions)
  }, [blockId, recentSessions])
}
