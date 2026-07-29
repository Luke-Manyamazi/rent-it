import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { TrustScoreEvent, TrustScoreEventType } from '@/types/trust-score'

const EVENT_LABELS: Record<TrustScoreEventType, string> = {
  booking_confirmed_on_time: 'Confirmed a viewing on time',
  booking_auto_cancelled: 'Missed confirming a viewing in time',
  listing_verified: 'A listing was verified',
  fraud_report_upheld: 'A fraud report was upheld against you',
  tenant_no_show: 'A tenant no-show was recorded',
  positive_review_received: 'Received a positive review',
  manual_admin_adjustment: 'Manual adjustment by an admin',
}

export function TrustScoreEventItem({ event }: { event: TrustScoreEvent }) {
  const Icon = event.delta > 0 ? TrendingUp : event.delta < 0 ? TrendingDown : Minus
  const color =
    event.delta > 0 ? 'text-verified' : event.delta < 0 ? 'text-destructive' : 'text-muted-foreground'

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-2.5 text-sm">
        <Icon className={`size-4 shrink-0 ${color}`} />
        <span>{EVENT_LABELS[event.type]}</span>
      </div>
      <span className={`text-sm font-medium ${color}`}>
        {event.delta > 0 ? '+' : ''}
        {event.delta}
      </span>
    </div>
  )
}
