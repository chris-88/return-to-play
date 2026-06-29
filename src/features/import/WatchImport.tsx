import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'
import { upsertWatchWorkouts } from '@/lib/queries/import'
import { parseRows, watchWorkoutRowSchema } from './schemas'
import type { WatchWorkoutRow } from './schemas'

type Stage = 'idle' | 'preview' | 'importing' | 'done'

export default function WatchImport() {
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [valid, setValid] = useState<WatchWorkoutRow[]>([])
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([])
  const [result, setResult] = useState<{ inserted: number; duplicates: number } | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const parsed = parseRows(data, watchWorkoutRowSchema)
        setValid(parsed.valid)
        setErrors(parsed.errors)
        setStage('preview')
      },
      error: () => toast.error('Failed to parse CSV'),
    })

    // Reset so same file can be re-selected
    e.target.value = ''
  }

  async function handleConfirm() {
    if (!user || valid.length === 0) return
    setStage('importing')
    try {
      const res = await upsertWatchWorkouts(user.id, valid)
      setResult(res)
      setStage('done')
    } catch {
      toast.error('Import failed — please try again')
      setStage('preview')
    }
  }

  function reset() {
    setStage('idle')
    setValid([])
    setErrors([])
    setResult(null)
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFile}
        aria-label="Upload watch_workouts.csv"
      />

      {stage === 'idle' && (
        <Button variant="outline" className="w-full" onClick={() => inputRef.current?.click()}>
          Upload watch_workouts.csv
        </Button>
      )}

      {stage === 'preview' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            >
              {valid.length} valid row{valid.length !== 1 ? 's' : ''}
            </Badge>
            {errors.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              >
                {errors.length} error{errors.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {errors.length > 0 && (
            <ul className="bg-destructive/10 text-destructive space-y-1 rounded-md px-3 py-2 text-xs">
              {errors.map((e) => (
                <li key={e.row}>
                  Row {e.row}: {e.message}
                </li>
              ))}
            </ul>
          )}

          {valid.length > 0 && (
            <div className="overflow-x-auto rounded-md border text-xs">
              <table className="w-full text-left">
                <thead className="bg-muted">
                  <tr>
                    {['date', 'activity_type', 'duration_min', 'distance_km', 'avg_hr'].map((h) => (
                      <th key={h} className="px-2 py-1.5 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {valid.slice(0, 5).map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-1">{r.date}</td>
                      <td className="px-2 py-1">{r.activity_type}</td>
                      <td className="px-2 py-1">{r.duration_min}</td>
                      <td className="px-2 py-1">{r.distance_km ?? '—'}</td>
                      <td className="px-2 py-1">{r.avg_hr ?? '—'}</td>
                    </tr>
                  ))}
                  {valid.length > 5 && (
                    <tr className="border-t">
                      <td colSpan={5} className="text-muted-foreground px-2 py-1">
                        + {valid.length - 5} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleConfirm} disabled={valid.length === 0}>
              Import {valid.length} row{valid.length !== 1 ? 's' : ''}
            </Button>
            <Button variant="outline" onClick={reset}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {stage === 'importing' && <p className="text-muted-foreground text-sm">Importing…</p>}

      {stage === 'done' && result && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            >
              {result.inserted} imported
            </Badge>
            {result.duplicates > 0 && (
              <Badge variant="secondary">
                {result.duplicates} duplicate{result.duplicates !== 1 ? 's' : ''} skipped
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            Import another file
          </Button>
        </div>
      )}
    </div>
  )
}
