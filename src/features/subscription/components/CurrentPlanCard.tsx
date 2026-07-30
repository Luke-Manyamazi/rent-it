import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { checkAgencyListingLimit } from '@/features/subscription/api/subscription'
import { PLANS } from '@/config/plans'
import type { Agency } from '@/types/agency'
import type { Subscription, SubscriptionStatus } from '@/types/subscription'

const STATUS_VARIANT: Record<SubscriptionStatus, 'secondary' | 'default' | 'destructive'> = {
  trialing: 'secondary',
  active: 'default',
  past_due: 'destructive',
  cancelled: 'secondary',
}

export function CurrentPlanCard({
  agency,
  subscription,
}: {
  agency: Agency
  subscription: Subscription | null
}) {
  const [usage, setUsage] = useState<{ current: number; limit: number } | null>(null)

  useEffect(() => {
    checkAgencyListingLimit(agency.id).then(setUsage).catch(() => setUsage(null))
  }, [agency.id, subscription])

  const tier = subscription?.tier ?? 'free'
  const plan = PLANS[tier]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Current plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{plan.name}</span>
          {subscription && (
            <Badge variant={STATUS_VARIANT[subscription.status]} className="capitalize">
              {subscription.status.replace('_', ' ')}
            </Badge>
          )}
        </div>

        {usage && (
          <div>
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>Active listings</span>
              <span>
                {usage.current} / {usage.limit >= 9999 ? '∞' : usage.limit}
              </span>
            </div>
            <Progress
              className="mt-1.5"
              value={usage.limit >= 9999 ? 0 : Math.min(100, (usage.current / usage.limit) * 100)}
            />
          </div>
        )}

        {subscription?.currentPeriodEnd && (
          <p className="text-muted-foreground text-xs">
            Renews {subscription.currentPeriodEnd.toDate().toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
