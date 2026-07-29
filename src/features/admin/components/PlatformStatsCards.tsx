import { RefreshCw, Users, Building2, ShieldAlert, FlagTriangleRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlatformStats } from '@/features/admin/api/platform-stats'

export function PlatformStatsCards() {
  const { stats, loading, refresh } = usePlatformStats()

  if (loading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  const cards = [
    {
      icon: Users,
      label: 'Tenants',
      value: stats.tenantCount,
    },
    {
      icon: Users,
      label: 'Landlords',
      value: stats.landlordCount,
    },
    {
      icon: Building2,
      label: 'Agencies',
      value: stats.agencyCount,
    },
    {
      icon: ShieldAlert,
      label: 'Pending verifications',
      value: stats.pendingVerificationCount,
    },
    {
      icon: FlagTriangleRight,
      label: 'Open fraud flags',
      value: stats.openFraudFlagCount,
    },
  ]

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => refresh()}>
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-3 pt-6">
              <span className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-lg">
                <card.icon className="size-4.5" />
              </span>
              <div>
                <p className="text-2xl font-semibold">{card.value}</p>
                <p className="text-muted-foreground text-xs">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
