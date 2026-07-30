import { Badge } from '@/components/ui/badge'
import { PLANS } from '@/config/plans'
import type { PaymentSubmissionStatus, SubscriptionPaymentSubmission } from '@/types/subscription'

const STATUS_VARIANT: Record<PaymentSubmissionStatus, 'secondary' | 'default' | 'destructive'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
}

export function PaymentSubmissionHistoryList({
  submissions,
}: {
  submissions: SubscriptionPaymentSubmission[]
}) {
  if (submissions.length === 0) {
    return <p className="text-muted-foreground py-6 text-center text-sm">No payment submissions yet.</p>
  }

  return (
    <div className="divide-y">
      {submissions.map((submission) => (
        <div key={submission.id} className="flex items-start justify-between gap-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_VARIANT[submission.status]} className="capitalize">
                {submission.status}
              </Badge>
              <span className="text-sm font-medium">
                {PLANS[submission.requestedTier].name} · ${submission.amountUsd}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs capitalize">
              {submission.paymentMethod} · Ref: {submission.referenceNumber}
            </p>
            {submission.status === 'rejected' && submission.adminNote && (
              <p className="text-destructive mt-1 text-xs">{submission.adminNote}</p>
            )}
          </div>
          {submission.createdAt && (
            <span className="text-muted-foreground shrink-0 text-xs">
              {submission.createdAt.toDate().toLocaleDateString()}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
