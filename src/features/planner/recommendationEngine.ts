import type { SessionTemplate, SessionVersion } from '@/types/training'
import type { Recommendation, RecommendationInput } from './types'
import {
  daysSinceCategory,
  isHighInjuryRisk,
  isLowReadiness,
  lowerBodyRecentlyTrained,
  shouldAvoidLowerBody,
} from './sessionRules'

function pickVersion(input: RecommendationInput): SessionVersion {
  const { availableTimeMin, currentFeel, latestCheckin } = input

  // Recovery: very sore/tired feel AND pain present or very low readiness
  if (
    (currentFeel === 'sore' && (latestCheckin?.pain_score ?? 0) >= 4) ||
    (currentFeel === 'sore' && (latestCheckin?.soreness ?? 0) >= 8) ||
    isLowReadiness(input)
  ) {
    return 'recovery'
  }

  // Compressed: short on time or feeling tired
  if (availableTimeMin <= 45 || currentFeel === 'tired' || currentFeel === 'sore') {
    return 'compressed'
  }

  return 'full'
}

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
  if (input.currentFeel === 'sore' || input.currentFeel === 'tired') {
    warnings.push(`Feeling ${input.currentFeel} — version adjusted accordingly`)
  }
  if (input.warningArea && input.warningArea !== 'none') {
    warnings.push(`Warning area flagged: ${input.warningArea}`)
  }

  const avoidLower = shouldAvoidLowerBody(input)
  const lowerRecent = lowerBodyRecentlyTrained(recentSessions)

  const daysSinceLower = daysSinceCategory(recentSessions, 'lower_strength')
  const daysSinceUpper = daysSinceCategory(recentSessions, 'upper_trunk')
  const daysSinceConditioning = daysSinceCategory(recentSessions, 'conditioning')
  const daysSinceAthletic = daysSinceCategory(recentSessions, 'athletic_movement')
  const daysSinceFootball = daysSinceCategory(recentSessions, 'football')

  let picked: SessionTemplate | null = null

  // When lower body blocked or recently trained, pivot to upper/conditioning/recovery
  if (avoidLower || lowerRecent) {
    if (daysSinceUpper >= 4) {
      picked = sessions.find((s) => s.category === 'upper_trunk') ?? null
      reason.push('Lower body recently trained or soreness elevated')
      reason.push(`Upper body not trained in ${daysSinceUpper} days`)
    } else if (daysSinceConditioning >= 7) {
      picked = sessions.find((s) => s.category === 'conditioning') ?? null
      reason.push('Conditioning not completed in 7 days')
    } else if (daysSinceFootball >= 7) {
      picked = sessions.find((s) => s.category === 'football') ?? null
      reason.push('Football work not done in 7 days')
    } else {
      picked =
        sessions.find((s) => s.category === 'recovery') ??
        sessions.find((s) => s.category === 'upper_trunk') ??
        null
      reason.push('Recovery or upper body recommended')
    }
  }

  // Lower strength overdue
  if (!picked && daysSinceLower >= 5) {
    picked = sessions.find((s) => s.category === 'lower_strength') ?? null
    reason.push(`Lower strength not trained in ${daysSinceLower} days`)
  }

  // Conditioning overdue
  if (!picked && daysSinceConditioning >= 7) {
    picked = sessions.find((s) => s.category === 'conditioning') ?? null
    reason.push('Conditioning not completed in 7 days')
  }

  // Athletic movement overdue
  if (!picked && daysSinceAthletic >= 7) {
    picked = sessions.find((s) => s.category === 'athletic_movement') ?? null
    reason.push(`Athletic movement not trained in ${daysSinceAthletic} days`)
  }

  // Football overdue
  if (!picked && daysSinceFootball >= 7) {
    picked = sessions.find((s) => s.category === 'football') ?? null
    reason.push(`Football work not done in ${daysSinceFootball} days`)
  }

  // Upper overdue
  if (!picked && daysSinceUpper >= 7) {
    picked = sessions.find((s) => s.category === 'upper_trunk') ?? null
    reason.push(`Upper body not trained in ${daysSinceUpper} days`)
  }

  // Default: block priority order
  if (!picked) {
    picked = sessions[0]
    reason.push('Following block priority order')
  }

  // If available time is very short and there's no time-appropriate session, fallback to recovery
  if (input.availableTimeMin <= 30) {
    const recovery = sessions.find((s) => s.category === 'recovery')
    if (recovery) {
      picked = recovery
      reason.unshift('Only 30 min available — recovery session recommended')
    }
  }

  const version = pickVersion(input)

  const alternative =
    sessions.find((s) => s.id !== picked?.id && s.category !== picked?.category) ?? null

  return { session: picked, version, reason, warnings, alternative }
}
