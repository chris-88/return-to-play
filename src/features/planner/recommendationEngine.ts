import type { SessionTemplate } from '@/types/training'
import type { Recommendation, RecommendationInput } from './types'
import {
  daysSinceCategory,
  isHighInjuryRisk,
  isLowReadiness,
  lowerBodyRecentlyTrained,
  shouldAvoidLowerBody,
} from './sessionRules'

export function recommend(
  input: RecommendationInput,
  sessions: SessionTemplate[],
): Recommendation | null {
  if (sessions.length === 0) return null

  const { recentSessions } = input
  const warnings: string[] = []
  const reason: string[] = []

  if (isHighInjuryRisk(input)) {
    warnings.push('Pain flag active — high-intensity lower body avoided')
  }
  if (isLowReadiness(input)) {
    warnings.push('Low sleep and high fatigue — reduced intensity recommended')
  }

  const avoidLower = shouldAvoidLowerBody(input)
  const lowerRecent = lowerBodyRecentlyTrained(recentSessions)

  const daysSinceLower = daysSinceCategory(recentSessions, 'lower_strength')
  const daysSinceUpper = daysSinceCategory(recentSessions, 'upper_trunk')
  const daysSinceConditioning = daysSinceCategory(recentSessions, 'conditioning')

  let picked: SessionTemplate | null = null

  // Recovery/upper first when lower body is blocked or just trained
  if (avoidLower || lowerRecent) {
    if (daysSinceUpper >= 4) {
      picked = sessions.find((s) => s.category === 'upper_trunk') ?? null
      reason.push('Lower body recently trained or soreness elevated')
      reason.push(`Upper body not trained in ${daysSinceUpper} days`)
    } else if (daysSinceConditioning >= 7) {
      picked = sessions.find((s) => s.category === 'conditioning') ?? null
      reason.push('Conditioning not completed in 7 days')
    } else {
      picked =
        sessions.find((s) => s.category === 'recovery') ??
        sessions.find((s) => s.category === 'upper_trunk') ??
        null
      reason.push('Recovery or upper body recommended')
    }
  }

  // Lower strength if overdue
  if (!picked && daysSinceLower >= 5) {
    picked = sessions.find((s) => s.category === 'lower_strength') ?? null
    reason.push(`Lower strength not trained in ${daysSinceLower} days`)
  }

  // Conditioning if overdue
  if (!picked && daysSinceConditioning >= 7) {
    picked = sessions.find((s) => s.category === 'conditioning') ?? null
    reason.push('Conditioning not completed in 7 days')
  }

  // Upper if overdue
  if (!picked && daysSinceUpper >= 7) {
    picked = sessions.find((s) => s.category === 'upper_trunk') ?? null
    reason.push(`Upper body not trained in ${daysSinceUpper} days`)
  }

  // Default to block priority order
  if (!picked) {
    picked = sessions[0]
    reason.push('Following block priority order')
  }

  const version =
    isLowReadiness(input) || input.currentFeel === 'tired' || input.currentFeel === 'sore'
      ? 'compressed'
      : 'full'

  const alternative =
    sessions.find((s) => s.id !== picked?.id && s.category !== picked?.category) ?? null

  return { session: picked, version, reason, warnings, alternative }
}
