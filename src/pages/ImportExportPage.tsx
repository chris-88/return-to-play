import { useState } from 'react'
import { Download, FileDown, Package } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import PlanAdjustmentImport from '@/features/import/PlanAdjustmentImport'
import WatchImport from '@/features/import/WatchImport'
import { buildExportZip, buildSingleCsv, downloadBlob } from '@/lib/export'

type SingleTable = 'checkins' | 'sessions' | 'exercises' | 'body_metrics' | 'watch_workouts'

const SINGLE_FILES: { key: SingleTable; label: string; description: string }[] = [
  {
    key: 'checkins',
    label: 'daily_checkins.csv',
    description: 'Sleep, readiness, nutrition, pain',
  },
  { key: 'sessions', label: 'training_sessions.csv', description: 'All completed sessions' },
  { key: 'exercises', label: 'exercise_results.csv', description: 'Set-by-set exercise logs' },
  { key: 'body_metrics', label: 'body_metrics.csv', description: 'Weight and waist measurements' },
  { key: 'watch_workouts', label: 'watch_workouts.csv', description: 'Imported Apple Watch data' },
]

export default function ImportExportPage() {
  const [zipping, setZipping] = useState(false)
  const [downloading, setDownloading] = useState<SingleTable | null>(null)

  async function handleExportAll() {
    setZipping(true)
    try {
      const blob = await buildExportZip()
      const date = new Date().toISOString().split('T')[0]
      downloadBlob(blob, `return-to-play-export-${date}.zip`)
      toast.success('Export downloaded')
    } catch {
      toast.error('Export failed — please try again')
    } finally {
      setZipping(false)
    }
  }

  async function handleSingleDownload(key: SingleTable) {
    setDownloading(key)
    try {
      const { csv, filename } = await buildSingleCsv(key)
      downloadBlob(new Blob([csv], { type: 'text/csv' }), filename)
      toast.success(`${filename} downloaded`)
    } catch {
      toast.error('Download failed — please try again')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Import / Export</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Download your data for coach review or backup
        </p>
      </div>

      {/* Full export */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Export all data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Downloads all five CSVs as a single ZIP file — ready to upload to ChatGPT for coach
            review.
          </p>
          <ul className="text-muted-foreground space-y-0.5 text-xs">
            {SINGLE_FILES.map((f) => (
              <li key={f.key}>
                <span className="font-mono">{f.label}</span> — {f.description}
              </li>
            ))}
          </ul>
          <Button className="w-full" onClick={handleExportAll} disabled={zipping}>
            <Download className="mr-2 h-4 w-4" />
            {zipping ? 'Building zip…' : 'Download export.zip'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Individual files */}
      <div>
        <p className="text-muted-foreground mb-3 text-sm font-medium">Individual files</p>
        <div className="space-y-2">
          {SINGLE_FILES.map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-mono text-sm">{f.label}</p>
                <p className="text-muted-foreground truncate text-xs">{f.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                disabled={downloading === f.key}
                onClick={() => handleSingleDownload(f.key)}
              >
                <FileDown className="mr-1.5 h-3.5 w-3.5" />
                {downloading === f.key ? '…' : 'Download'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Import: watch workouts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Import watch workouts</CardTitle>
          <p className="text-muted-foreground text-xs">
            Apple Health / Health Auto Export CSV format
          </p>
        </CardHeader>
        <CardContent>
          <WatchImport />
        </CardContent>
      </Card>

      {/* Import: plan adjustments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Import plan adjustments</CardTitle>
          <p className="text-muted-foreground text-xs">
            From a ChatGPT coach review — review and apply each change individually
          </p>
        </CardHeader>
        <CardContent>
          <PlanAdjustmentImport />
        </CardContent>
      </Card>
    </div>
  )
}
