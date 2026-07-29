import { Badge } from '@/components/ui/badge'
import type { BookingStatus } from '@/types/booking'

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: 'Awaiting response', variant: 'secondary' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  availability_confirmed: { label: 'Verified — go with confidence', variant: 'default' },
  completed: { label: 'Completed', variant: 'secondary' },
  cancelled_by_tenant: { label: 'Cancelled by you', variant: 'outline' },
  cancelled_by_owner: { label: 'Declined', variant: 'outline' },
  auto_cancelled_no_confirmation: { label: 'Auto-cancelled', variant: 'destructive' },
  no_show: { label: 'No-show', variant: 'destructive' },
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
