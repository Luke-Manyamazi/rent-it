import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PlusCircle, Pencil, Trash2, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { usePropertiesByOwner, deleteProperty } from '@/features/property/api/properties'
import { PropertyStatusBadge } from '@/features/property/components/PropertyStatusBadge'

export function PropertyListPage() {
  const { firebaseUser, profile } = useAuth()
  const isAgency = profile?.role === 'agency'
  const ownerId = isAgency ? profile?.agencyId : firebaseUser?.uid
  const { properties, loading } = usePropertiesByOwner(ownerId ?? undefined)
  const basePath = isAgency ? '/dashboard/agency/properties' : '/dashboard/landlord/properties'

  async function onDelete(propertyId: string) {
    const property = properties.find((p) => p.id === propertyId)
    if (!property) return
    try {
      await deleteProperty(property)
      toast.success('Listing deleted.')
    } catch {
      toast.error("Couldn't delete that listing.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your listings.
          </p>
        </div>
        <Button asChild>
          <Link to={`${basePath}/new`}>
            <PlusCircle className="size-4" />
            New listing
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <span className="bg-brand/10 text-brand flex size-12 items-center justify-center rounded-full">
            <Home className="size-5" />
          </span>
          <p className="font-medium">No listings yet</p>
          <p className="text-muted-foreground max-w-xs text-sm">
            Create your first listing to start reaching tenants.
          </p>
          <Button asChild className="mt-2">
            <Link to={`${basePath}/new`}>New listing</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="bg-muted size-16 shrink-0 overflow-hidden rounded-lg">
                  {property.photos[0] && (
                    <img
                      src={property.photos[0].url}
                      alt=""
                      className="size-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{property.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {property.currency} {property.rentAmount.toLocaleString()} /{' '}
                    {property.rentFrequency === 'monthly' ? 'month' : 'week'} ·{' '}
                    {property.location.suburb}
                  </p>
                </div>
                <PropertyStatusBadge status={property.status} />
                <div className="flex gap-2">
                  <Button variant="outline" size="icon-sm" asChild>
                    <Link to={`${basePath}/${property.id}/edit`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon-sm" className="text-destructive">
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently removes "{property.title}" and its photos. This can't be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(property.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
