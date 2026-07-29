import { Home, Building2, KeyRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/user'

const ROLES: Array<{
  role: Exclude<UserRole, 'admin'>
  title: string
  description: string
  icon: typeof Home
}> = [
  {
    role: 'tenant',
    title: "I'm looking to rent",
    description: 'Browse verified listings and book viewings.',
    icon: KeyRound,
  },
  {
    role: 'landlord',
    title: "I'm a property owner",
    description: 'List and manage your own rental properties.',
    icon: Home,
  },
  {
    role: 'agency',
    title: "I'm an agency",
    description: 'Manage a portfolio of listings for clients.',
    icon: Building2,
  },
]

export function RoleSelector({
  value,
  onChange,
}: {
  value: Exclude<UserRole, 'admin'> | null
  onChange: (role: Exclude<UserRole, 'admin'>) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {ROLES.map(({ role, title, description, icon: Icon }) => (
        <button
          key={role}
          type="button"
          onClick={() => onChange(role)}
          className={cn(
            'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors',
            value === role
              ? 'border-primary bg-primary/5'
              : 'border-border hover:bg-muted/50'
          )}
        >
          <span className="bg-brand text-brand-foreground flex size-9 items-center justify-center rounded-lg">
            <Icon className="size-4.5" />
          </span>
          <span className="text-sm font-medium">{title}</span>
          <span className="text-muted-foreground text-xs">{description}</span>
        </button>
      ))}
    </div>
  )
}
