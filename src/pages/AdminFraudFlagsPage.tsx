import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useFraudFlags } from '@/features/admin/api/fraud-flags'
import { FraudFlagsList } from '@/features/admin/components/FraudFlagsList'

export function AdminFraudFlagsPage() {
  const { flags, loading } = useFraudFlags()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Fraud reports</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Reports filed against users, agencies, and listings.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <FraudFlagsList flags={flags} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
