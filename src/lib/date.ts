export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function today(): string {
  return toISODate(new Date())
}

export function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
}
