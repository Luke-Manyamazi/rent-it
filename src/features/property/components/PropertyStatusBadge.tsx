import { Badge } from '@/components/ui/badge'
import type { PropertyStatus } from '@/types/property'

const STATUS_CONFIG: Record<PropertyStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'outline' },
  pending_review: { label: 'Pending review', variant: 'secondary' },
  active: { label: 'Active', variant: 'default' },
  rented: { label: 'Rented', variant: 'secondary' },
  suspended: { label: 'Suspended', variant: 'destructive' },
  expired: { label: 'Expired', variant: 'outline' },
}

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const config = STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
