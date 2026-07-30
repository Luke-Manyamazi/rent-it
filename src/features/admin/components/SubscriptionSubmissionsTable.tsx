import { useState } from 'react'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { approvePaymentSubmission, rejectPaymentSubmission } from '@/features/admin/api/subscriptions'
import { PLANS } from '@/config/plans'
import type { PaymentSubmissionStatus, SubscriptionPaymentSubmission } from '@/types/subscription'

const STATUS_VARIANT: Record<PaymentSubmissionStatus, 'secondary' | 'default' | 'destructive'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
}

function RejectDialog({ onReject }: { onReject: (note: string) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit() {
    setSubmitting(true)
    try {
      await onReject(note.trim() || 'Payment could not be confirmed')
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <X className="size-3.5" />
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject this payment submission?</DialogTitle>
          <DialogDescription>Let the agency know why, if you'd like.</DialogDescription>
        </DialogHeader>
        <Textarea
          rows={2}
          placeholder="Reason (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onSubmit} disabled={submitting}>
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SubscriptionSubmissionsTable({
  submissions,
}: {
  submissions: SubscriptionPaymentSubmission[]
}) {
  const { firebaseUser } = useAuth()

  if (submissions.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No subscription payment submissions yet.
      </p>
    )
  }

  async function onApprove(submission: SubscriptionPaymentSubmission) {
    if (!firebaseUser) return
    try {
      await approvePaymentSubmission(submission, firebaseUser.uid)
      toast.success('Subscription activated.')
    } catch {
      toast.error("Couldn't approve that submission.")
    }
  }

  async function onReject(submission: SubscriptionPaymentSubmission, note: string) {
    if (!firebaseUser) return
    try {
      await rejectPaymentSubmission(submission, firebaseUser.uid, note)
      toast.success('Submission rejected.')
    } catch {
      toast.error("Couldn't reject that submission.")
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agency</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Method / reference</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell className="font-mono text-xs">{submission.agencyId}</TableCell>
              <TableCell>
                {PLANS[submission.requestedTier].name} · ${submission.amountUsd}
              </TableCell>
              <TableCell>
                <p className="capitalize">{submission.paymentMethod}</p>
                <p className="text-muted-foreground text-xs">{submission.referenceNumber}</p>
                {submission.proofImageUrl && (
                  <a
                    href={submission.proofImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand text-xs hover:underline"
                  >
                    View proof
                  </a>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[submission.status]} className="capitalize">
                  {submission.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {submission.status === 'pending' && (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => onApprove(submission)}>
                      <Check className="size-3.5" />
                      Approve
                    </Button>
                    <RejectDialog onReject={(note) => onReject(submission, note)} />
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
