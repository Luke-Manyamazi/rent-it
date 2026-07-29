import { History } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useTrustScoreEvents } from '@/features/trust-score/api/trust-score-events'
import { TrustScoreCard } from '@/features/trust-score/components/TrustScoreCard'
import { TrustScoreEventItem } from '@/features/trust-score/components/TrustScoreEventItem'

export function TrustScorePage() {
  const { firebaseUser, profile } = useAuth()
  const { events, loading } = useTrustScoreEvents(firebaseUser?.uid)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trust score</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          How tenants know they can rely on you.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TrustScoreCard score={profile?.trustScore ?? 0} />
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="size-4.5" />
                Activity history
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No activity yet — this fills in once you have bookings and
                  listings.
                </p>
              ) : (
                <div className="divide-y">
                  {events.map((event) => (
                    <TrustScoreEventItem key={event.id} event={event} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
