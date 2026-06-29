import type { RecommendationInput, RecentSession } from './types'

const LOWER_BODY_CATEGORIES = ['lower_strength', 'athletic_movement']
const PAIN_BLOCKED_AREAS = ['hamstring', 'groin', 'calf', 'achilles', 'knee']

export function daysSinceCategory(sessions: RecentSession[], category: string): number {
  const match = sessions
    .filter((s) => s.category === category)
    .sort((a, b) => b.date.localeCompare(a.date))[0]
  if (!match) return 999
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.floor((Date.now() - new Date(match.date).getTime()) / msPerDay)
}

export function isHighInjuryRisk(input: RecommendationInput): boolean {
  const { latestCheckin, warningArea } = input
  if (!latestCheckin) return false
  if ((latestCheckin.pain_score ?? 0) >= 4) return true
  if (warningArea && PAIN_BLOCKED_AREAS.some((a) => warningArea.toLowerCase().includes(a)))
    return true
  return false
}

export function shouldAvoidLowerBody(input: RecommendationInput): boolean {
  const { latestCheckin, warningArea } = input
  if (!latestCheckin) return false
  if ((latestCheckin.soreness ?? 0) >= 7) return true
  if (warningArea && PAIN_BLOCKED_AREAS.some((a) => warningArea.toLowerCase().includes(a)))
    return true
  if ((latestCheckin.pain_score ?? 0) >= 4) return true
  return false
}

export function isLowReadiness(input: RecommendationInput): boolean {
  const { latestCheckin } = input
  if (!latestCheckin) return false
  return (latestCheckin.sleep_hours ?? 8) < 6 && (latestCheckin.fatigue ?? 0) >= 7
}

export function lowerBodyRecentlyTrained(sessions: RecentSession[]): boolean {
  return LOWER_BODY_CATEGORIES.some((cat) => daysSinceCategory(sessions, cat) < 2)
}
