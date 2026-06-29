import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { seedBlocks } from '@/data/seedBlocks'
import { seedSessions } from '@/data/seedSessions'
import { useCurrentBlock } from '@/hooks/useCurrentBlock'
import { categoryColour, categoryLabel } from '@/lib/categories'
import type { SessionCategory } from '@/types/training'

const CATEGORIES: SessionCategory[] = [
  'lower_strength',
  'upper_trunk',
  'conditioning',
  'athletic_movement',
  'football',
  'recovery',
  'other',
]

export default function SessionBankPage() {
  const navigate = useNavigate()
  const currentBlock = useCurrentBlock()
  const [filterBlock, setFilterBlock] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  const filtered = seedSessions.filter((s) => {
    if (filterBlock !== 'all' && s.block_id !== filterBlock) return false
    if (filterCategory !== 'all' && s.category !== filterCategory) return false
    return true
  })

  const blockById = Object.fromEntries(seedBlocks.map((b) => [b.id, b]))

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Session Bank</h1>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={filterBlock} onValueChange={(v) => setFilterBlock(v ?? 'all')}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Block" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All blocks</SelectItem>
            {seedBlocks.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name.split('—')[0].trim()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v ?? 'all')}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {categoryLabel(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-muted-foreground text-xs">{filtered.length} sessions</p>

      {/* Session list */}
      <div className="space-y-3">
        {filtered.map((session) => {
          const block = blockById[session.block_id]
          const isCurrentBlock = currentBlock?.id === session.block_id

          return (
            <Card key={session.id} className={!isCurrentBlock ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-mono text-xs">
                        {session.session_code}
                      </span>
                      <CardTitle className="text-base">{session.name}</CardTitle>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {block?.name.split('—')[0].trim()}
                      {!isCurrentBlock && ' · future block'}
                    </p>
                  </div>
                  <Badge variant="secondary" className={categoryColour(session.category)}>
                    {categoryLabel(session.category)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">{session.purpose}</p>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    ~{session.estimated_duration_min} min · {session.default_version.length}{' '}
                    exercises
                  </span>
                  <Button
                    size="sm"
                    variant={isCurrentBlock ? 'default' : 'outline'}
                    onClick={() => navigate('/train', { state: { sessionId: session.id } })}
                  >
                    Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filtered.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No sessions match the selected filters.
          </p>
        )}
      </div>
    </div>
  )
}
