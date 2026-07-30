import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAgency } from '@/features/agency/hooks/useAgency'
import { useSubscription } from '@/features/subscription/api/subscription'
import { CurrentPlanCard } from '@/features/subscription/components/CurrentPlanCard'
import { useOwnerAnalyticsHistory } from '@/features/analytics/api/analytics'
import { TrendChart } from '@/features/analytics/components/TrendChart'

export function OwnerAnalyticsPage() {
  const { firebaseUser, profile } = useAuth()
  const isAgency = profile?.role === 'agency'
  const ownerId = isAgency ? profile?.agencyId : firebaseUser?.uid
  const { rollups, loading } = useOwnerAnalyticsHistory(
    isAgency ? 'agency' : 'landlord',
    ownerId ?? undefined,
    30
  )

  const { agency } = useAgency(isAgency ? (profile?.agencyId ?? undefined) : undefined)
  const { subscription } = useSubscription(isAgency ? (profile?.agencyId ?? undefined) : undefined)

  const viewsData = rollups.map((r) => ({ date: r.date, views: r.totalViewsCumulative }))
  const bookingsData = rollups.map((r) => ({ date: r.date, newRequests: r.newBookingRequestsToday }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Views and booking activity for your listings, updated daily.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Listing views</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : viewsData.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No analytics recorded yet — this updates once a day.
                </p>
              ) : (
                <TrendChart
                  data={viewsData}
                  series={[{ key: 'views', label: 'Total views', color: 'var(--chart-1)' }]}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">New viewing requests</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : bookingsData.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No analytics recorded yet — this updates once a day.
                </p>
              ) : (
                <TrendChart
                  data={bookingsData}
                  series={[{ key: 'newRequests', label: 'New requests', color: 'var(--chart-2)' }]}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {isAgency && agency && (
          <div className="lg:col-span-1">
            <CurrentPlanCard agency={agency} subscription={subscription} />
          </div>
        )}
      </div>
    </div>
  )
}
