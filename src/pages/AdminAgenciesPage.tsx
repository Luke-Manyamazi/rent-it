import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAllAgencies } from '@/features/admin/api/agencies'
import { AgenciesTable } from '@/features/admin/components/AgenciesTable'

export function AdminAgenciesPage() {
  const { agencies, loading } = useAllAgencies()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Agencies</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage agency verification, trust scores, and suspensions.
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
            <AgenciesTable agencies={agencies} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
