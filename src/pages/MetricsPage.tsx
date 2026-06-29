import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LoadChart from '@/features/metrics/LoadChart'
import StrengthChart from '@/features/metrics/StrengthChart'
import WeightChart from '@/features/metrics/WeightChart'

export default function MetricsPage() {
  const [weightDays, setWeightDays] = useState(90)
  const [loadDays, setLoadDays] = useState(90)

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Metrics</h1>

      <Tabs defaultValue="body">
        <TabsList className="w-full">
          <TabsTrigger value="body" className="flex-1">
            Body
          </TabsTrigger>
          <TabsTrigger value="load" className="flex-1">
            Load
          </TabsTrigger>
          <TabsTrigger value="strength" className="flex-1">
            Strength
          </TabsTrigger>
        </TabsList>

        <TabsContent value="body" className="mt-4">
          <WeightChart days={weightDays} onDaysChange={setWeightDays} />
        </TabsContent>

        <TabsContent value="load" className="mt-4">
          <LoadChart days={loadDays} onDaysChange={setLoadDays} />
        </TabsContent>

        <TabsContent value="strength" className="mt-4">
          <StrengthChart />
        </TabsContent>
      </Tabs>
    </div>
  )
}
