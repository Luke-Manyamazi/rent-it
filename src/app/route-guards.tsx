import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { UserRole } from '@/types/user'

export function FullPageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="text-muted-foreground size-6 animate-spin" />
    </div>
  )
}

/** Requires a signed-in Firebase user, but not necessarily a completed profile. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { firebaseUser, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (!firebaseUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

/** Requires a signed-in user AND a completed RentIT profile (role chosen). */
export function RequireProfile({ children }: { children: ReactNode }) {
  const { firebaseUser, profile, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (!firebaseUser) return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/choose-role" replace />
  return <>{children}</>
}

export function RequireRole({
  roles,
  children,
}: {
  roles: UserRole[]
  children: ReactNode
}) {
  const { profile } = useAuth()
  if (profile && !roles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

/** /dashboard -> /dashboard/{role} */
export function DashboardIndexRedirect() {
  const { profile, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (!profile) return null
  return <Navigate to={`/dashboard/${profile.role}`} replace />
}
