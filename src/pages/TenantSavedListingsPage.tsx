import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSavedProperties } from '@/features/tenant/api/saved-properties'

export function TenantSavedListingsPage() {
  const { firebaseUser } = useAuth()
  const { saved, loading } = useSavedProperties(firebaseUser?.uid)

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Saved listings</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Properties you've bookmarked while browsing.
      </p>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
            <Heart className="size-5" />
          </span>
          <p className="font-medium">Nothing saved yet</p>
          <p className="text-muted-foreground max-w-xs text-sm">
            Save listings while browsing so you can compare them later.
          </p>
          <Button asChild className="mt-2">
            <Link to="/listings">Browse rentals</Link>
          </Button>
        </div>
      ) : (
        // Property details join lands once listings exist (Phase 9/10) —
        // for now we only have the saved propertyId + timestamp.
        <ul className="mt-6 space-y-2">
          {saved.map((item) => (
            <li
              key={item.propertyId}
              className="text-muted-foreground rounded-lg border px-4 py-3 text-sm"
            >
              Property {item.propertyId}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
