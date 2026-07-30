import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAllPaymentSubmissions } from '@/features/admin/api/subscriptions'
import { SubscriptionSubmissionsTable } from '@/features/admin/components/SubscriptionSubmissionsTable'

export function AdminSubscriptionsPage() {
  const { submissions, loading } = useAllPaymentSubmissions()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review and confirm agency EcoCash/bank payment submissions.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <SubscriptionSubmissionsTable submissions={submissions} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
