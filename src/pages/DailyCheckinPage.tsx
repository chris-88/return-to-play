import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/AuthContext'
import { checkinKeys, fetchTodayCheckin, upsertCheckin } from '@/lib/queries/checkins'

const today = new Date().toISOString().split('T')[0]

function ScoreField({
  label,
  value,
  onChange,
  lowLabel = 'Low',
  highLabel = 'High',
}: {
  label: string
  value: number
  onChange: (v: number) => void
  lowLabel?: string
  highLabel?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm font-semibold tabular-nums">{value} / 10</span>
      </div>
      <Slider
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      />
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}

export default function DailyCheckinPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: existing, isLoading } = useQuery({
    queryKey: checkinKeys.today(today),
    queryFn: () => fetchTodayCheckin(today),
  })

  const [weightKg, setWeightKg] = useState('')
  const [sleepHours, setSleepHours] = useState('')
  const [sleepQuality, setSleepQuality] = useState(7)
  const [fatigue, setFatigue] = useState(5)
  const [soreness, setSoreness] = useState(5)
  const [stress, setStress] = useState(5)
  const [readiness, setReadiness] = useState(7)
  const [proteinG, setProteinG] = useState('')
  const [calories, setCalories] = useState('')
  const [waterLitres, setWaterLitres] = useState('')
  const [creatine, setCreatine] = useState(false)
  const [proteinSupplement, setProteinSupplement] = useState(false)
  const [painArea, setPainArea] = useState('')
  const [painScore, setPainScore] = useState(3)
  const [hasPain, setHasPain] = useState(false)
  const [notes, setNotes] = useState('')

  // Populate form from existing check-in
  useEffect(() => {
    if (!existing) return
    setWeightKg(existing.weight_kg?.toString() ?? '')
    setSleepHours(existing.sleep_hours?.toString() ?? '')
    setSleepQuality(existing.sleep_quality ?? 7)
    setFatigue(existing.fatigue ?? 5)
    setSoreness(existing.soreness ?? 5)
    setStress(existing.stress ?? 5)
    setReadiness(existing.readiness ?? 7)
    setProteinG(existing.protein_g?.toString() ?? '')
    setCalories(existing.calories?.toString() ?? '')
    setWaterLitres(existing.water_litres?.toString() ?? '')
    setCreatine(existing.creatine_taken ?? false)
    setProteinSupplement(existing.protein_supplement_taken ?? false)
    setHasPain(!!existing.pain_area)
    setPainArea(existing.pain_area ?? '')
    setPainScore(existing.pain_score ?? 3)
    setNotes(existing.notes ?? '')
  }, [existing])

  const mutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error('Not authenticated')
      return upsertCheckin({
        user_id: user.id,
        date: today,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
        sleep_quality: sleepQuality,
        fatigue,
        soreness,
        stress,
        readiness,
        protein_g: proteinG ? parseInt(proteinG) : null,
        calories: calories ? parseInt(calories) : null,
        water_litres: waterLitres ? parseFloat(waterLitres) : null,
        creatine_taken: creatine,
        protein_supplement_taken: proteinSupplement,
        pain_area: hasPain ? painArea || null : null,
        pain_score: hasPain ? painScore : null,
        notes: notes || null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkinKeys.all })
      toast.success('Check-in saved!')
    },
    onError: () => toast.error('Failed to save check-in.'),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Daily Check-in</h1>
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Daily Check-in</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">{today}</p>
        {existing && (
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            ✓ Already logged today — editing will overwrite
          </p>
        )}
      </div>

      {/* Body */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
            Body
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="e.g. 83.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="water">Water (L)</Label>
              <Input
                id="water"
                type="number"
                step="0.1"
                placeholder="e.g. 2.5"
                value={waterLitres}
                onChange={(e) => setWaterLitres(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sleep & Readiness */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
            Sleep & Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="sleepHours">Sleep hours</Label>
            <Input
              id="sleepHours"
              type="number"
              step="0.5"
              placeholder="e.g. 7.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
            />
          </div>
          <ScoreField
            label="Sleep quality"
            value={sleepQuality}
            onChange={setSleepQuality}
            lowLabel="Poor"
            highLabel="Great"
          />
          <ScoreField
            label="Fatigue"
            value={fatigue}
            onChange={setFatigue}
            lowLabel="Fresh"
            highLabel="Exhausted"
          />
          <ScoreField
            label="Soreness"
            value={soreness}
            onChange={setSoreness}
            lowLabel="None"
            highLabel="Very sore"
          />
          <ScoreField
            label="Stress"
            value={stress}
            onChange={setStress}
            lowLabel="Relaxed"
            highLabel="Very stressed"
          />
          <ScoreField
            label="Readiness"
            value={readiness}
            onChange={setReadiness}
            lowLabel="Not ready"
            highLabel="Fully ready"
          />
        </CardContent>
      </Card>

      {/* Nutrition */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
            Nutrition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                placeholder="e.g. 180"
                value={proteinG}
                onChange={(e) => setProteinG(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                placeholder="e.g. 2400"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Supplements</Label>
            <div className="flex gap-2">
              {[
                { label: 'Creatine', value: creatine, set: setCreatine },
                { label: 'Protein shake', value: proteinSupplement, set: setProteinSupplement },
              ].map(({ label, value, set }) => (
                <button
                  key={label}
                  onClick={() => set(!value)}
                  className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                    value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-accent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pain */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
            Pain / Niggles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Any pain today?</Label>
            <div className="flex gap-2">
              {[false, true].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => setHasPain(val)}
                  className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                    hasPain === val
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-accent'
                  }`}
                >
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>

          {hasPain && (
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
              <ScoreField
                label="Pain score"
                value={painScore}
                onChange={setPainScore}
                lowLabel="Mild"
                highLabel="Severe"
              />
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Anything else to note…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Saving…' : existing ? 'Update check-in' : 'Save check-in'}
      </Button>
    </div>
  )
}
