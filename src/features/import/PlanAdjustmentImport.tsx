import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'
import { applyAdjustment, dismissAdjustment, insertPlanAdjustments } from '@/lib/queries/import'
import { parseRows, planAdjustmentRowSchema } from './schemas'
import type { PlanAdjustmentRow } from './schemas'

type Stage = 'idle' | 'preview' | 'importing' | 'review'

interface PendingRow extends PlanAdjustmentRow {
  _id?: string
  _status: 'pending' | 'applied' | 'dismissed'
}

export default function PlanAdjustmentImport() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [valid, setValid] = useState<PlanAdjustmentRow[]>([])
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([])
  const [rows, setRows] = useState<PendingRow[]>([])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const parsed = parseRows(data, planAdjustmentRowSchema)
        setValid(parsed.valid)
        setErrors(parsed.errors)
        setStage('preview')
      },
      error: () => toast.error('Failed to parse CSV'),
    })

    e.target.value = ''
  }

  async function handleConfirm() {
    if (!user || valid.length === 0) return
    setStage('importing')
    try {
      await insertPlanAdjustments(user.id, valid)
      // Fetch back the inserted rows with IDs via a fresh query
      const { data } = await import('@/lib/supabase').then(({ supabase }) =>
        supabase
          .from('plan_adjustments')
          .select('*')
          .eq('applied', false)
          .order('effective_from', { ascending: true }),
      )
      setRows(
        (data ?? []).map((r) => ({
          effective_from: r.effective_from ?? '',
          block: (r.changes_json as Record<string, string>)?.block ?? '',
          session_code: r.session_code ?? '',
          change_type: r.change_type as PlanAdjustmentRow['change_type'],
          field: r.field ?? '',
          new_value: r.new_value ?? '',
          reason: r.reason ?? '',
          _id: r.id,
          _status: 'pending',
        })),
      )
      setStage('review')
    } catch {
      toast.error('Import failed — please try again')
      setStage('preview')
    }
  }

  async function handleApply(idx: number) {
    const row = rows[idx]
    if (!row._id) return
    try {
      await applyAdjustment(row._id)
      setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, _status: 'applied' } : r)))
      queryClient.invalidateQueries({ queryKey: ['plan_adjustments'] })
    } catch {
      toast.error('Failed to apply adjustment')
    }
  }

  async function handleDismiss(idx: number) {
    const row = rows[idx]
    if (!row._id) return
    try {
      await dismissAdjustment(row._id)
      setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, _status: 'dismissed' } : r)))
    } catch {
      toast.error('Failed to dismiss adjustment')
    }
  }

  function reset() {
    setStage('idle')
    setValid([])
    setErrors([])
    setRows([])
  }

  const CHANGE_COLOURS: Record<string, string> = {
    modify: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    add: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    remove: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    pause: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFile}
        aria-label="Upload plan_adjustments.csv"
      />

      {stage === 'idle' && (
        <Button variant="outline" className="w-full" onClick={() => inputRef.current?.click()}>
          Upload plan_adjustments.csv
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
            <div className="space-y-2">
              {valid.map((r, i) => (
                <div key={i} className="space-y-1 rounded-md border px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className={CHANGE_COLOURS[r.change_type]}>
                      {r.change_type}
                    </Badge>
                    <span className="font-mono text-xs">{r.session_code}</span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-xs font-medium">{r.field}</span>
                    <span className="text-muted-foreground text-xs">→</span>
                    <span className="text-xs">{r.new_value}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">{r.reason}</p>
                  <p className="text-muted-foreground text-xs">Effective {r.effective_from}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleConfirm} disabled={valid.length === 0}>
              Import {valid.length} adjustment{valid.length !== 1 ? 's' : ''}
            </Button>
            <Button variant="outline" onClick={reset}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {stage === 'importing' && <p className="text-muted-foreground text-sm">Importing…</p>}

      {stage === 'review' && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Review adjustments</p>
          <p className="text-muted-foreground text-xs">
            Mark each adjustment as applied once you've made the change, or dismiss to remove it.
          </p>
          <div className="space-y-2">
            {rows.map((r, i) => (
              <div
                key={i}
                className={`space-y-1 rounded-md border px-3 py-2 transition-opacity ${
                  r._status !== 'pending' ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className={CHANGE_COLOURS[r.change_type]}>
                        {r.change_type}
                      </Badge>
                      <span className="font-mono text-xs">{r.session_code}</span>
                      <span className="text-xs font-medium">{r.field}</span>
                      <span className="text-muted-foreground text-xs">→ {r.new_value}</span>
                    </div>
                    <p className="text-muted-foreground text-xs">{r.reason}</p>
                  </div>
                  {r._status === 'pending' ? (
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => handleApply(i)}
                        className="text-green-600 hover:text-green-700 dark:text-green-400"
                        aria-label="Mark applied"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDismiss(i)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Dismiss"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground shrink-0 text-xs capitalize">
                      {r._status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            Import another file
          </Button>
        </div>
      )}
    </div>
  )
}
