import { Link, Outlet } from 'react-router-dom'
import { Home } from 'lucide-react'
import { APP_NAME } from '@/config/constants'

/**
 * Minimal shell for authenticated dashboards. Sidebar navigation, role-aware
 * menus, and trust-score widgets are filled in per-role in later phases.
 */
export function DashboardLayout() {
  return (
    <div className="bg-secondary/20 flex min-h-screen flex-col">
      <header className="bg-background sticky top-0 z-40 border-b">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="bg-brand text-brand-foreground flex size-7 items-center justify-center rounded-md">
              <Home className="size-3.5" />
            </span>
            <span className="hidden sm:inline">{APP_NAME}</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
