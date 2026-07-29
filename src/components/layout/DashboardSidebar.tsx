import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { DashboardNavItem } from '@/config/dashboard-nav'

export function DashboardSidebar({ items }: { items: DashboardNavItem[] }) {
  return (
    <nav className="hidden w-56 shrink-0 md:block">
      <ul className="sticky top-20 space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <NavLink
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function DashboardMobileTabs({ items }: { items: DashboardNavItem[] }) {
  if (items.length <= 1) return null
  return (
    <nav className="[-ms-overflow-style:none] [scrollbar-width:none] -mx-4 mb-6 flex gap-1 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap',
              isActive
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground'
            )
          }
        >
          <item.icon className="size-3.5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
