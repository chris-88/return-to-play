import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RangeOption {
  label: string
  days: number
}

interface Props {
  title: string
  subtitle?: string
  children?: ReactNode
  headerSlot?: ReactNode
  rangeOptions?: readonly RangeOption[]
  activeDays?: number
  onRangeChange?: (days: number) => void
  isEmpty: boolean
  isLoading: boolean
  isError: boolean
  emptyMessage?: string
}

export default function ChartShell({
  title,
  subtitle,
  children,
  headerSlot,
  rangeOptions,
  activeDays,
  onRangeChange,
  isEmpty,
  isLoading,
  isError,
  emptyMessage,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {subtitle && <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {headerSlot}
            {rangeOptions && (
              <div className="flex rounded-md border text-xs">
                {rangeOptions.map((opt) => (
                  <button
                    key={opt.days}
                    onClick={() => onRangeChange?.(opt.days)}
                    className={`px-2.5 py-1 transition-colors first:rounded-l-md last:rounded-r-md ${
                      activeDays === opt.days
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    aria-pressed={activeDays === opt.days}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="bg-muted/50 flex h-40 items-center justify-center rounded-md">
            <span className="text-muted-foreground text-sm">Loading…</span>
          </div>
        ) : isError ? (
          <div className="flex h-40 items-center justify-center">
            <span className="text-destructive text-sm">Failed to load data.</span>
          </div>
        ) : isEmpty ? (
          <div className="flex h-40 items-center justify-center">
            <span className="text-muted-foreground text-center text-sm">{emptyMessage}</span>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
