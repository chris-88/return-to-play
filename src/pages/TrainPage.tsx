import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { seedSessions } from '@/data/seedSessions'
import { useCurrentBlock } from '@/hooks/useCurrentBlock'
import { useAddSession, useRecentSessions } from '@/hooks/useRecentSessions'
import { useRecommendation } from '@/hooks/useRecommendation'
import { useTodayCheckin, toCheckinSnapshot } from '@/hooks/useTodayCheckin'
import { categoryColour, categoryLabel } from '@/lib/categories'
import type { SessionExercise, SessionVersion } from '@/types/training'

type Feel = 'good' | 'okay' | 'tired' | 'sore'
type AvailableTime = 30 | 45 | 60 | 75
type Step = 'pre' | 'session' | 'post'

interface SetLog {
  actual_reps: string
  weight_kg: string
  duration_sec: string
  distance_m: string
  rpe: number
  completed: boolean
}

function makeSetLogs(count: number): SetLog[] {
  return Array.from({ length: count }, () => ({
    actual_reps: '',
    weight_kg: '',
    duration_sec: '',
    distance_m: '',
    rpe: 7,
    completed: true,
  }))
}

function versionExercises(
  exercises: SessionExercise[],
  version: SessionVersion,
): SessionExercise[] {
  if (version === 'compressed') {
    // Drop last exercise, reduce sets by 1 (min 2)
    return exercises.slice(0, -1).map((e) => ({ ...e, sets: Math.max(2, e.sets - 1) }))
  }
  if (version === 'recovery') {
    // First 3 exercises at reduced sets
    return exercises.slice(0, 3).map((e) => ({ ...e, sets: 2, intensity: 'easy' }))
  }
  return exercises
}

export default function TrainPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const block = useCurrentBlock()
  const { data: recent = [] } = useRecentSessions(10)
  const { data: checkinData } = useTodayCheckin()
  const addSessionMutation = useAddSession()

  const [step, setStep] = useState<Step>('pre')
  const [availableTime, setAvailableTime] = useState<AvailableTime>(60)
  const [feel, setFeel] = useState<Feel>('good')
  const [warningArea, setWarningArea] = useState('none')
  const [version, setVersion] = useState<SessionVersion>('full')

  const latestCheckin = toCheckinSnapshot(checkinData ?? null)
  const recommendation = useRecommendation(block?.id ?? null, recent, {
    availableTimeMin: availableTime,
    currentFeel: feel,
    warningArea,
    latestCheckin,
  })

  // Sync version to engine suggestion whenever pre-session inputs change (before session starts)
  useEffect(() => {
    if (step === 'pre' && recommendation) setVersion(recommendation.version)
  }, [recommendation, step])

  const preselectedId = (location.state as { sessionId?: string } | null)?.sessionId
  const selectedSession =
    seedSessions.find((s) => s.id === preselectedId) ?? recommendation?.session ?? seedSessions[0]
  const [setLogs, setSetLogs] = useState<Record<string, SetLog[]>>({})
  const [duration, setDuration] = useState('')
  const [sessionRpe, setSessionRpe] = useState(7)
  const [painDuring, setPainDuring] = useState(false)
  const [painArea, setPainArea] = useState('')
  const [painScore, setPainScore] = useState(3)
  const [notes, setNotes] = useState('')

  const exercises = selectedSession
    ? versionExercises(selectedSession.default_version, version)
    : []

  function startSession() {
    // Initialise set logs for each exercise
    const logs: Record<string, SetLog[]> = {}
    exercises.forEach((ex) => {
      logs[ex.id] = makeSetLogs(ex.sets)
    })
    setSetLogs(logs)
    setStep('session')
  }

  function updateSet(
    exId: string,
    setIdx: number,
    field: keyof SetLog,
    value: string | number | boolean,
  ) {
    setSetLogs((prev) => {
      const exLogs = [...(prev[exId] ?? [])]
      exLogs[setIdx] = { ...exLogs[setIdx], [field]: value }
      return { ...prev, [exId]: exLogs }
    })
  }

  function submitSession() {
    if (!selectedSession || !block) return
    const today = new Date().toISOString().split('T')[0]
    const dur = parseInt(duration) || selectedSession.estimated_duration_min

    addSessionMutation.mutate(
      {
        date: today,
        block_id: block.id,
        session_code: selectedSession.session_code,
        session_name: selectedSession.name,
        session_category: selectedSession.category,
        duration_min: dur,
        session_rpe: sessionRpe,
        completed_status: 'completed',
        pain_during_session: painDuring,
        pain_area: painDuring ? painArea || null : null,
        pain_score: painDuring ? painScore : null,
        notes: notes || null,
        planned_or_unplanned: 'planned',
      },
      {
        onSuccess: () => {
          toast.success(`${selectedSession.name} logged!`)
          navigate('/')
        },
        onError: () => {
          toast.error('Failed to save session. Please try again.')
        },
      },
    )
  }

  if (!selectedSession) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Train</h1>
        <p className="text-muted-foreground text-sm">
          No sessions available for the current block.
        </p>
      </div>
    )
  }

  // ── Pre-session ────────────────────────────────────────────────────────────
  if (step === 'pre') {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Ready to train?</h1>

        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label>Available time</Label>
              <div className="grid grid-cols-4 gap-2">
                {([30, 45, 60, 75] as AvailableTime[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setAvailableTime(t)}
                    className={`rounded-md border py-2 text-sm font-medium transition-colors ${
                      availableTime === t
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-accent'
                    }`}
                  >
                    {t} min
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>How do you feel?</Label>
              <div className="grid grid-cols-4 gap-2">
                {(['good', 'okay', 'tired', 'sore'] as Feel[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFeel(f)}
                    className={`rounded-md border py-2 text-sm font-medium capitalize transition-colors ${
                      feel === f
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-accent'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Any warning areas?</Label>
              <Select value={warningArea} onValueChange={(v) => setWarningArea(v ?? 'none')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'none',
                    'Hamstring',
                    'Groin',
                    'Calf / Achilles',
                    'Knee',
                    'Hip',
                    'Back',
                    'Shoulder',
                    'Other',
                  ].map((a) => (
                    <SelectItem key={a} value={a}>
                      {a === 'none' ? 'None' : a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm tracking-wider uppercase">
              Recommended
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{selectedSession.name}</p>
              <Badge variant="secondary" className={categoryColour(selectedSession.category)}>
                {categoryLabel(selectedSession.category)}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <Label>Version</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['full', 'compressed', 'recovery'] as SessionVersion[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVersion(v)}
                    className={`rounded-md border py-2 text-sm font-medium capitalize transition-colors ${
                      version === v
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-accent'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-muted-foreground text-sm">{selectedSession.purpose}</p>

            <Button className="w-full" onClick={startSession}>
              Start {selectedSession.name}
            </Button>
          </CardContent>
        </Card>

        <p className="text-muted-foreground text-center text-xs">
          Wrong session?{' '}
          <button className="underline underline-offset-2" onClick={() => navigate('/sessions')}>
            Browse session bank
          </button>
        </p>
      </div>
    )
  }

  // ── In-session ─────────────────────────────────────────────────────────────
  if (step === 'session') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{selectedSession.name}</h1>
            <Badge
              variant="secondary"
              className={`mt-1 ${categoryColour(selectedSession.category)}`}
            >
              {categoryLabel(selectedSession.category)}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => setStep('post')}>
            Finish
          </Button>
        </div>

        <div className="space-y-3">
          {exercises.map((ex) => (
            <Card key={ex.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{ex.exercise_name}</CardTitle>
                <p className="text-muted-foreground text-xs">
                  {ex.sets} sets
                  {ex.reps ? ` × ${ex.reps}` : ''}
                  {ex.duration_sec ? ` × ${ex.duration_sec}s` : ''}
                  {ex.distance_m ? ` × ${ex.distance_m}m` : ''}
                  {ex.intensity ? ` — ${ex.intensity}` : ''}
                  {ex.rest_seconds ? ` — ${ex.rest_seconds}s rest` : ''}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {(setLogs[ex.id] ?? makeSetLogs(ex.sets)).map((log, i) => (
                  <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2">
                    <span className="text-muted-foreground w-6 text-center text-xs">{i + 1}</span>
                    {ex.duration_sec ? (
                      <Input
                        type="number"
                        placeholder="sec"
                        value={log.duration_sec}
                        onChange={(e) => updateSet(ex.id, i, 'duration_sec', e.target.value)}
                        className="h-8 text-sm"
                      />
                    ) : ex.distance_m ? (
                      <Input
                        type="number"
                        placeholder="m"
                        value={log.distance_m}
                        onChange={(e) => updateSet(ex.id, i, 'distance_m', e.target.value)}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <Input
                        type="number"
                        placeholder="reps"
                        value={log.actual_reps}
                        onChange={(e) => updateSet(ex.id, i, 'actual_reps', e.target.value)}
                        className="h-8 text-sm"
                      />
                    )}
                    <Input
                      type="number"
                      placeholder="kg"
                      value={log.weight_kg}
                      onChange={(e) => updateSet(ex.id, i, 'weight_kg', e.target.value)}
                      className="h-8 text-sm"
                    />
                    <button
                      onClick={() => updateSet(ex.id, i, 'completed', !log.completed)}
                      className={`h-6 w-6 shrink-0 rounded border-2 transition-colors ${
                        log.completed
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground bg-background'
                      }`}
                      aria-label={log.completed ? 'Mark incomplete' : 'Mark complete'}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Button className="w-full" onClick={() => setStep('post')}>
          Finish session
        </Button>
      </div>
    )
  }

  // ── Post-session ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Log session</h1>

      <Card>
        <CardContent className="space-y-5 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              placeholder={String(selectedSession.estimated_duration_min)}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Session RPE</Label>
              <span className="text-sm font-semibold tabular-nums">{sessionRpe} / 10</span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[sessionRpe]}
              onValueChange={(v) => setSessionRpe(Array.isArray(v) ? v[0] : v)}
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>Very easy</span>
              <span>Max effort</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label>Pain during session?</Label>
            <div className="flex gap-2">
              {[false, true].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => setPainDuring(val)}
                  className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                    painDuring === val
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-accent'
                  }`}
                >
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>

          {painDuring && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="painArea">Pain area</Label>
                <Input
                  id="painArea"
                  placeholder="e.g. Groin"
                  value={painArea}
                  onChange={(e) => setPainArea(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Pain score</Label>
                  <span className="text-sm font-semibold tabular-nums">{painScore} / 10</span>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[painScore]}
                  onValueChange={(v) => setPainScore(Array.isArray(v) ? v[0] : v)}
                />
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="How did it feel? Anything to note…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-muted text-muted-foreground rounded-md px-3 py-2 text-sm">
            Session load:{' '}
            <span className="text-foreground font-semibold">
              {(parseInt(duration) || selectedSession.estimated_duration_min) * sessionRpe}
            </span>{' '}
            ({parseInt(duration) || selectedSession.estimated_duration_min} min × RPE {sessionRpe})
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        onClick={submitSession}
        disabled={addSessionMutation.isPending}
      >
        {addSessionMutation.isPending ? 'Saving…' : 'Save session'}
      </Button>

      <Button variant="ghost" className="w-full" onClick={() => setStep('session')}>
        Back to exercises
      </Button>
    </div>
  )
}
