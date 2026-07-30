import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PropertyStatusBadge } from '@/features/property/components/PropertyStatusBadge'
import { setPropertyVerified, setPropertySuspended } from '@/features/admin/api/properties'
import type { Property } from '@/types/property'

export function PropertiesTable({ properties }: { properties: Property[] }) {
  if (properties.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No listings yet.</p>
  }

  async function onToggleVerified(property: Property, checked: boolean) {
    try {
      await setPropertyVerified(property, checked)
      toast.success(checked ? 'Listing verified.' : 'Verification removed.')
    } catch {
      toast.error("Couldn't update verification.")
    }
  }

  async function onToggleSuspended(property: Property) {
    const suspending = property.status !== 'suspended'
    try {
      await setPropertySuspended(property, suspending, property.status)
      toast.success(suspending ? 'Listing suspended.' : 'Listing unsuspended.')
    } catch {
      toast.error("Couldn't update that listing.")
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Listing</TableHead>
            <TableHead>Owner type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell>
                <Link to={`/listings/${property.id}`} className="font-medium hover:underline">
                  {property.title}
                </Link>
                <p className="text-muted-foreground text-xs">
                  {property.location.suburb} · {property.currency} {property.rentAmount}
                </p>
              </TableCell>
              <TableCell className="capitalize">{property.ownerType}</TableCell>
              <TableCell>
                <PropertyStatusBadge status={property.status} />
                {property.isFlagged && (
                  <p className="text-destructive mt-1 text-xs">Flagged ({property.flagCount})</p>
                )}
              </TableCell>
              <TableCell>
                <Switch
                  checked={property.isVerified}
                  onCheckedChange={(checked) => onToggleVerified(property, checked)}
                />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className={property.status !== 'suspended' ? 'text-destructive' : undefined}
                  onClick={() => onToggleSuspended(property)}
                >
                  <ShieldCheck className="size-3.5" />
                  {property.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
