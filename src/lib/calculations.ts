export function sessionLoad(durationMin: number, rpe: number): number {
  return durationMin * rpe
}

export function weeklyAverage(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, v) => sum + v, 0) / values.length
}
