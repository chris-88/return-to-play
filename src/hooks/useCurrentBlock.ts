import { useMemo } from 'react'
import { seedBlocks } from '@/data/seedBlocks'
import type { TrainingBlock } from '@/types/training'

export function useCurrentBlock(): TrainingBlock | null {
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0]

    // Active block: today falls within its date range
    const active = seedBlocks.find((b) => b.start_date <= today && today <= b.end_date)
    if (active) return active

    // Pre-season: return the next upcoming block
    const upcoming = seedBlocks
      .filter((b) => b.start_date > today)
      .sort((a, b) => a.start_date.localeCompare(b.start_date))[0]
    if (upcoming) return upcoming

    // Post-plan: return the last block
    return seedBlocks.at(-1) ?? null
  }, [])
}
