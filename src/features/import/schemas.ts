import { z } from 'zod'

// Optional numeric field from CSV string — empty string becomes null
const optNumeric = z
  .string()
  .optional()
  .transform((v) => (v === undefined || v.trim() === '' ? null : parseFloat(v)))

const optInt = z
  .string()
  .optional()
  .transform((v) => (v === undefined || v.trim() === '' ? null : parseInt(v, 10)))

export const watchWorkoutRowSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  activity_type: z.string().min(1, 'activity_type is required'),
  duration_min: z
    .string()
    .transform((v) => parseFloat(v))
    .pipe(z.number().positive()),
  distance_km: optNumeric,
  active_kcal: optInt,
  avg_hr: optInt,
  max_hr: optInt,
  steps: optInt,
  vo2max: optNumeric,
  resting_hr: optInt,
  hrv: optNumeric,
})

export type WatchWorkoutRow = z.infer<typeof watchWorkoutRowSchema>

export const planAdjustmentRowSchema = z.object({
  effective_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'effective_from must be YYYY-MM-DD'),
  block: z.string().min(1, 'block is required'),
  session_code: z.string().min(1, 'session_code is required'),
  change_type: z.enum(['modify', 'add', 'remove', 'pause']),
  field: z.string().min(1, 'field is required'),
  new_value: z.string(),
  reason: z.string(),
})

export type PlanAdjustmentRow = z.infer<typeof planAdjustmentRowSchema>

export interface ParseResult<T> {
  valid: T[]
  errors: { row: number; message: string }[]
}

export function parseRows<T>(
  rawRows: Record<string, string>[],
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
): ParseResult<T> {
  const valid: T[] = []
  const errors: { row: number; message: string }[] = []

  rawRows.forEach((row, i) => {
    const result = schema.safeParse(row)
    if (result.success) {
      valid.push(result.data)
    } else {
      const msg = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      errors.push({ row: i + 2, message: msg })
    }
  })

  return { valid, errors }
}
