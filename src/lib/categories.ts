import type { SessionCategory } from '@/types/training'

const labels: Record<SessionCategory, string> = {
  lower_strength: 'Lower Strength',
  upper_trunk: 'Upper + Trunk',
  conditioning: 'Conditioning',
  athletic_movement: 'Athletic Movement',
  football: 'Football',
  recovery: 'Recovery',
  other: 'Other',
}

const colours: Record<SessionCategory, string> = {
  lower_strength: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  upper_trunk: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  conditioning: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  athletic_movement: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  football: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  recovery: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300',
}

export function categoryLabel(cat: SessionCategory): string {
  return labels[cat] ?? cat
}

export function categoryColour(cat: SessionCategory): string {
  return colours[cat] ?? ''
}
