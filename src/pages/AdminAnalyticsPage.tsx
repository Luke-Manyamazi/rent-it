import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PlatformStatsCards } from '@/features/admin/components/PlatformStatsCards'
import {
  usePlatformAnalyticsHistory,
  usePropertyStatusBreakdown,
  useBookingStatusBreakdown,
} from '@/features/analytics/api/analytics'
import { TrendChart } from '@/features/analytics/components/TrendChart'
import { StatusBreakdownChart } from '@/features/analytics/components/StatusBreakdownChart'

const PROPERTY_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  pending_review: 'Pending',
  draft: 'Draft',
  rented: 'Rented',
  suspended: 'Suspended',
  expired: 'Expired',
}

const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  availability_confirmed: 'Verified',
  completed: 'Completed',
  cancelled_by_tenant: 'Cancelled (tenant)',
  cancelled_by_owner: 'Cancelled (owner)',
  auto_cancelled_no_confirmation: 'Auto-cancelled',
  no_show: 'No-show',
}

export function AdminAnalyticsPage() {
  const { rollups, loading: historyLoading } = usePlatformAnalyticsHistory(30)
  const { breakdown: propertyBreakdown, loading: propertyLoading } = usePropertyStatusBreakdown()
  const { breakdown: bookingBreakdown, loading: bookingLoading } = useBookingStatusBreakdown()

  const trendData = rollups.map((r) => ({
    date: r.date,
    newUsersToday: r.newUsersToday,
    newPropertiesToday: r.newPropertiesToday,
    newBookingsToday: r.newBookingsToday,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Platform activity, updated daily.
        </p>
      </div>

      <PlatformStatsCards />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New activity (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : trendData.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No daily analytics recorded yet — the rollup job runs once a day.
            </p>
          ) : (
            <TrendChart
              data={trendData}
              series={[
                { key: 'newUsersToday', label: 'New users', color: 'var(--chart-1)' },
                { key: 'newPropertiesToday', label: 'New listings', color: 'var(--chart-2)' },
                { key: 'newBookingsToday', label: 'New bookings', color: 'var(--chart-3)' },
              ]}
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Listings by status</CardTitle>
          </CardHeader>
          <CardContent>
            {propertyLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <StatusBreakdownChart
                data={propertyBreakdown.map((b) => ({
                  label: PROPERTY_STATUS_LABELS[b.status] ?? b.status,
                  count: b.count,
                }))}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bookings by status</CardTitle>
          </CardHeader>
          <CardContent>
            {bookingLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <StatusBreakdownChart
                data={bookingBreakdown.map((b) => ({
                  label: BOOKING_STATUS_LABELS[b.status] ?? b.status,
                  count: b.count,
                }))}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
