import { useQuery } from '@tanstack/react-query'
import { checkinKeys, fetchTodayCheckin } from '@/lib/queries/checkins'
import type { CheckinSnapshot } from '@/features/planner/types'

const today = new Date().toISOString().split('T')[0]

export function useTodayCheckin() {
  return useQuery({
    queryKey: checkinKeys.today(today),
    queryFn: () => fetchTodayCheckin(today),
  })
}

export function toCheckinSnapshot(
  data: Awaited<ReturnType<typeof fetchTodayCheckin>>,
): CheckinSnapshot | null {
  if (!data) return null
  return {
    date: data.date,
    fatigue: data.fatigue,
    soreness: data.soreness,
    readiness: data.readiness,
    sleep_hours: data.sleep_hours,
    pain_area: data.pain_area,
    pain_score: data.pain_score,
  }
}
