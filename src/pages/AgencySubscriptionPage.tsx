import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAgency } from '@/features/agency/hooks/useAgency'
import {
  useSubscription,
  useSubscriptionPaymentSubmissions,
} from '@/features/subscription/api/subscription'
import { CurrentPlanCard } from '@/features/subscription/components/CurrentPlanCard'
import { SubmitPaymentForm } from '@/features/subscription/components/SubmitPaymentForm'
import { PaymentSubmissionHistoryList } from '@/features/subscription/components/PaymentSubmissionHistoryList'

export function AgencySubscriptionPage() {
  const { firebaseUser, profile } = useAuth()
  const { agency, loading: agencyLoading } = useAgency(profile?.agencyId ?? undefined)
  const { subscription, loading: subscriptionLoading } = useSubscription(profile?.agencyId ?? undefined)
  const { submissions, loading: submissionsLoading } = useSubscriptionPaymentSubmissions(
    profile?.agencyId ?? undefined
  )

  if (agencyLoading || subscriptionLoading || !agency || !firebaseUser) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Upgrade your plan and manage listing limits.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CurrentPlanCard agency={agency} subscription={subscription} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upgrade your plan</CardTitle>
            </CardHeader>
            <CardContent>
              <SubmitPaymentForm agencyId={agency.id} uid={firebaseUser.uid} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment history</CardTitle>
            </CardHeader>
            <CardContent>
              {submissionsLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <PaymentSubmissionHistoryList submissions={submissions} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
