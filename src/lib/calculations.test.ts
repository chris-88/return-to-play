import { describe, expect, it } from 'vitest'
import { sessionLoad, weeklyAverage } from './calculations'

describe('sessionLoad', () => {
  it('multiplies duration by RPE', () => {
    expect(sessionLoad(60, 7)).toBe(420)
  })
})

describe('weeklyAverage', () => {
  it('returns null for empty array', () => {
    expect(weeklyAverage([])).toBeNull()
  })

  it('averages values correctly', () => {
    expect(weeklyAverage([90, 89, 91])).toBeCloseTo(90)
  })
})
