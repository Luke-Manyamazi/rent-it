import { Link, Outlet, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Home, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { APP_NAME } from '@/config/constants'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { signOutUser } from '@/features/auth/api/auth'
import { getAuthErrorMessage } from '@/features/auth/api/error-messages'

/**
 * Minimal shell for authenticated dashboards. Sidebar navigation and
 * trust-score widgets are filled in per-role in later phases.
 */
export function DashboardLayout() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  async function onSignOut() {
    try {
      await signOutUser()
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(getAuthErrorMessage(error))
    }
  }

  const initials = profile?.fullName
    ?.split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')

  return (
    <div className="bg-secondary/20 flex min-h-screen flex-col">
      <header className="bg-background sticky top-0 z-40 border-b">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="bg-brand text-brand-foreground flex size-7 items-center justify-center rounded-md">
              <Home className="size-3.5" />
            </span>
            <span className="hidden sm:inline">{APP_NAME}</span>
          </Link>

          <div className="flex items-center gap-3">
            {profile && (
              <div className="flex items-center gap-2">
                <Avatar className="size-7">
                  <AvatarImage src={profile.photoUrl ?? undefined} alt={profile.fullName} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">
                  {profile.fullName}
                </span>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={onSignOut} title="Sign out">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
