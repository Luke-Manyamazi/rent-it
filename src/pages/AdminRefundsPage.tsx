import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useRefundedViewingPayments } from '@/features/admin/api/refunds'
import { RefundPayoutsTable } from '@/features/admin/components/RefundPayoutsTable'

export function AdminRefundsPage() {
  const { payments, loading } = useRefundedViewingPayments()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Viewing fee refunds</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Owners mark these refunded instantly, with no approval step — but the $5 fee settles
          into the platform's single Paynow account, not the owner's, so this is the list of
          EcoCash/bank payouts still owed to tenants.
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
            <RefundPayoutsTable payments={payments} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
