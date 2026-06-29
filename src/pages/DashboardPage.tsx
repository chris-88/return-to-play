import { AlertTriangle, ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { seedSessions } from '@/data/seedSessions'
import { useCurrentBlock } from '@/hooks/useCurrentBlock'
import { useLocalSessions } from '@/hooks/useLocalSessions'
import { useRecommendation } from '@/hooks/useRecommendation'
import { categoryLabel, categoryColour } from '@/lib/categories'

const ROLLING_DAYS = 10

export default function DashboardPage() {
  const block = useCurrentBlock()
  const { recentSessions } = useLocalSessions()
  const recent = recentSessions(ROLLING_DAYS)
  const recommendation = useRecommendation(block?.id ?? null, recent)

  const today = new Date().toISOString().split('T')[0]
  const isUpcoming = block ? block.start_date > today : false

  // Build rolling window summary for current block sessions
  const blockSessions = block ? seedSessions.filter((s) => s.block_id === block.id) : []
  const windowSummary = blockSessions.map((template) => {
    const done = recent.filter((s) => s.session_category === template.category).length
    return { template, done }
  })

  return (
    <div className="space-y-4">
      {/* Block header */}
      <div>
        <p className="text-muted-foreground text-xs tracking-wider uppercase">
          {isUpcoming ? 'Upcoming block' : 'Current block'}
        </p>
        <h1 className="mt-0.5 text-xl font-semibold">{block?.name ?? 'No active block'}</h1>
        {isUpcoming && block && (
          <p className="text-muted-foreground mt-0.5 text-sm">Starts {block.start_date}</p>
        )}
      </div>

      <Separator />

      {/* Recommendation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
            Next best session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendation ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg leading-tight font-semibold">
                    {recommendation.session.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={categoryColour(recommendation.session.category)}
                    >
                      {categoryLabel(recommendation.session.category)}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {recommendation.version === 'full'
                        ? `${recommendation.session.estimated_duration_min} min`
                        : recommendation.version === 'compressed'
                          ? `~${Math.round(recommendation.session.estimated_duration_min * 0.7)} min compressed`
                          : 'Recovery version'}
                    </span>
                  </div>
                </div>
              </div>

              {recommendation.warnings.length > 0 && (
                <div className="space-y-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
                  {recommendation.warnings.map((w, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300"
                    >
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {w}
                    </div>
                  ))}
                </div>
              )}

              <ul className="space-y-1">
                {recommendation.reason.map((r, i) => (
                  <li key={i} className="text-muted-foreground flex items-start gap-2 text-sm">
                    <span className="bg-muted-foreground mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                    {r}
                  </li>
                ))}
              </ul>

              <Link
                to="/train"
                state={{ sessionId: recommendation.session.id }}
                className={buttonVariants({ className: 'w-full' })}
              >
                Start session <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              {recommendation.alternative && (
                <p className="text-muted-foreground text-center text-xs">
                  Alternative:{' '}
                  <Link
                    to="/train"
                    state={{ sessionId: recommendation.alternative.id }}
                    className="underline underline-offset-2"
                  >
                    {recommendation.alternative.name}
                  </Link>
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              No sessions available for the current block.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Rolling window */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
            This {ROLLING_DAYS}-day window
          </CardTitle>
        </CardHeader>
        <CardContent>
          {windowSummary.length > 0 ? (
            <ul className="space-y-2">
              {windowSummary.map(({ template, done }) => (
                <li key={template.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {done > 0 ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className="text-muted-foreground h-4 w-4 shrink-0" />
                    )}
                    <span className={done > 0 ? 'text-foreground' : 'text-muted-foreground'}>
                      {template.name}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {done > 0 ? `Done ${done}×` : 'Due'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No sessions in this block yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Recovery placeholder */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
            Recovery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No check-in yet today.{' '}
            <Link to="/checkin" className="underline underline-offset-2">
              Log your readiness
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
