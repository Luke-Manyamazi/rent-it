import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAllProperties } from '@/features/admin/api/properties'
import { PropertiesTable } from '@/features/admin/components/PropertiesTable'

export function AdminListingsPage() {
  const { properties, loading } = useAllProperties()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Listings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Verify genuine listings and suspend problematic ones.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <PropertiesTable properties={properties} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
