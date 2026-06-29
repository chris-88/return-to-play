import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { sessionKeys, fetchRecentSessions, insertSession } from '@/lib/queries/sessions'
import type { TrainingSessionInsert } from '@/lib/queries/sessions'
import { sessionLoad } from '@/lib/calculations'

export function useRecentSessions(days = 10) {
  return useQuery({
    queryKey: sessionKeys.recent(days),
    queryFn: () => fetchRecentSessions(days),
  })
}

export function useAddSession() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (
      input: Omit<TrainingSessionInsert, 'user_id' | 'session_load'> & {
        duration_min: number
        session_rpe: number
      },
    ) => {
      if (!user) throw new Error('Not authenticated')
      return insertSession({
        ...input,
        user_id: user.id,
        session_load: sessionLoad(input.duration_min, input.session_rpe),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all })
    },
  })
}
