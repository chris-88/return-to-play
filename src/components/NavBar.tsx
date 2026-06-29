import { BarChart2, CalendarCheck, Dumbbell, LayoutDashboard, MoreHorizontal } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const primary = [
  { to: '/', label: 'Home', icon: LayoutDashboard, exact: true },
  { to: '/train', label: 'Train', icon: Dumbbell, exact: false },
  { to: '/checkin', label: 'Check-in', icon: CalendarCheck, exact: false },
  { to: '/metrics', label: 'Metrics', icon: BarChart2, exact: false },
]

const secondary = [
  { to: '/sessions', label: 'Session Bank' },
  { to: '/plan', label: 'Plan' },
  { to: '/import-export', label: 'Import / Export' },
]

function NavItem({
  to,
  label,
  icon: Icon,
  exact,
}: {
  to: string
  label: string
  icon: React.ElementType
  exact: boolean
}) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        cn(
          'flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors',
          isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        )
      }
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  )
}

export default function NavBar() {
  return (
    <>
      {/* Desktop top bar */}
      <header className="hidden h-14 shrink-0 items-center gap-6 border-b px-6 md:flex">
        <span className="text-sm font-semibold tracking-tight">Return to Play</span>
        <nav className="flex items-center gap-1">
          {primary.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          {secondary.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Mobile bottom bar */}
      <nav className="bg-background fixed inset-x-0 bottom-0 z-50 flex border-t md:hidden">
        {primary.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
        <Sheet>
          <SheetTrigger className="text-muted-foreground hover:text-foreground flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors">
            <MoreHorizontal className="h-5 w-5" />
            <span>More</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="pb-safe">
            <SheetHeader>
              <SheetTitle>More</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-1">
              {secondary.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-4 py-3 text-sm transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-foreground hover:bg-accent/50',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  )
}
